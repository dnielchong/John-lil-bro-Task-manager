import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Task, StreakStats, AppSettings } from '../types';
import {
  DEFAULT_SETTINGS,
  getInitialTasks,
  getInitialStreakStats,
  getTodayDateString,
} from '../utils/defaults';
import { soundEngine } from '../utils/sound';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'schedule' | 'calendar';
  setActiveTab: (tab: 'schedule' | 'calendar') => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  streakStats: StreakStats;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Modals & States
  activeAlarmTask: Task | null;
  activeWorkoutTask: Task | null;
  setActiveWorkoutTask: (task: Task | null) => void;
  showStartupModal: boolean;
  setShowStartupModal: (show: boolean) => void;
  showNewTaskModal: boolean;
  setShowNewTaskModal: (show: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  logWorkoutSet: (taskId: string, setIndex: number, reps: number) => void;
  addQuickWorkoutReps: (taskId: string, reps: number) => void;
  
  // Alarms
  snoozeAlarm: (taskId: string, minutes: number) => void;
  dismissAlarm: () => void;
  completeAlarmTask: () => void;
  testAlarmSound: (soundName?: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
  sendTestScreenNotification: () => Promise<boolean>;
  notificationPermission: NotificationPermission | 'unsupported';
}

const STORAGE_KEYS = {
  TASKS: 'taskpulse_tasks_v2',
  STREAKS: 'taskpulse_streaks_v2',
  SETTINGS: 'taskpulse_settings_v2',
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialTasks();
  });

  const [streakStats, setStreakStats] = useState<StreakStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialStreakStats();
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'schedule' | 'calendar'>('schedule');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [activeWorkoutTask, setActiveWorkoutTask] = useState<Task | null>(null);
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streakStats));
  }, [streakStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Request Notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setSettings(prev => ({ ...prev, desktopNotifications: true }));
      }
      return perm === 'granted';
    } catch {
      return false;
    }
  }, []);

  // Send a test screen notification to show the user how it looks on their computer screen
  const sendTestScreenNotification = useCallback(async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return false;
    }

    let perm = Notification.permission;
    if (perm !== 'granted') {
      perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }

    if (perm === 'granted') {
      setSettings(prev => ({ ...prev, desktopNotifications: true }));
      try {
        const notif = new Notification("Task Manager: Screen Alert Active! 🔔", {
          body: "Computer screen notifications are working! You will receive native popups for hourly workouts and the 8:00 PM Central cleanup.",
          icon: '/icon.svg',
          tag: 'task-manager-test-alert',
          requireInteraction: true, // Remains on screen until user interacts with it
          silent: false,
        });

        notif.onclick = () => {
          window.focus();
          try {
            notif.close();
          } catch {
            // ignore
          }
        };
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  // Audio test - sustained 25s alarm
  const testAlarmSound = useCallback((soundName?: string) => {
    const sound = soundName || settings.alarmSound;
    if (soundEngine.isLooping()) {
      soundEngine.stopAlarmLoop();
    } else {
      soundEngine.startAlarmLoop(sound, settings.volume, 25);
    }
  }, [settings.alarmSound, settings.volume]);

  // Alarm verification interval (checks every 10 seconds)
  const lastFiredMinute = useRef<string>('');
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayDateString();
      const currentMinuteKey = `${todayStr} ${timeStr}`;

      if (lastFiredMinute.current === currentMinuteKey) return;

      // Find pending task whose alarm matches
      const matched = tasks.find(t => {
        if (!t.alarmEnabled || t.completed || !t.alarmTime) return false;
        if (t.lastAlarmFiredDate === currentMinuteKey) return false;
        // If task has specific dueDate and recurring is none or custom, check that dueDate matches today
        if (t.dueDate && t.recurring === 'none') {
          if (t.dueDate !== todayStr) return false;
        }
        return t.alarmTime === timeStr;
      });

      if (matched) {
        lastFiredMinute.current = currentMinuteKey;
        setTasks(prev => prev.map(t => t.id === matched.id ? { ...t, lastAlarmFiredDate: currentMinuteKey } : t));
        setActiveAlarmTask(matched);

        if (settings.soundEnabled) {
          soundEngine.startAlarmLoop(matched.alarmSound || settings.alarmSound, settings.volume, 45);
        }

        // Screen notification on user's computer screen
        if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const notif = new Notification(`Task Manager: ${matched.title}`, {
              body: matched.category === 'workout'
                ? `Time for workout! Target: ${matched.targetReps || 15} reps (${matched.workoutType || 'pushups'})`
                : matched.category === 'cleaning'
                ? `8:00 PM Central: Time to clean up the house!`
                : `Task reminder: ${matched.title}`,
              icon: '/icon.svg',
              tag: matched.id,
              requireInteraction: true, // Keeps alert visible on computer screen
            });

            notif.onclick = () => {
              window.focus();
              try {
                notif.close();
              } catch {
                // ignore
              }
            };
          } catch {
            // notification failed
          }
        }
      }
    };

    const interval = setInterval(checkAlarms, 10000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [tasks, settings]);

  // Streak verification logic
  const checkStreakProgress = useCallback((newCompletedTasks: Task[]) => {
    const today = getTodayDateString();
    setStreakStats(prev => {
      const completedToday = newCompletedTasks.filter(t => t.completed).length;
      const workoutRepsToday = newCompletedTasks
        .filter(t => t.category === 'workout' && (t.completedAt?.startsWith(today) || t.completed))
        .reduce((sum, t) => sum + (t.completedReps || 0), 0);

      const studyMinsToday = newCompletedTasks
        .filter(t => t.category === 'homework' && (t.completedAt?.startsWith(today) || t.completed))
        .reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

      const updatedHistory = {
        ...prev.dailyHistory,
        [today]: {
          date: today,
          tasksCompleted: completedToday,
          totalScheduled: Math.max(newCompletedTasks.length, 1),
          workoutReps: workoutRepsToday,
          studyMinutes: studyMinsToday,
        },
      };

      let newCurrentStreak = prev.currentStreak;
      if (completedToday > 0 && prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        if (prev.lastActiveDate === yStr) {
          newCurrentStreak += 1;
        } else if (!prev.lastActiveDate) {
          newCurrentStreak = 1;
        }
      }

      const newLongest = Math.max(newCurrentStreak, prev.longestStreak);
      const totalCompletedCount = newCompletedTasks.filter(t => t.completed).length;
      const totalRepsCount = newCompletedTasks.reduce((acc, t) => acc + (t.completedReps || 0), 0);

      const updatedBadges = prev.badges.map(b => {
        if (b.unlockedAt) return b;
        let unlocked = false;
        if (b.id === 'first-task' && totalCompletedCount >= 1) unlocked = true;
        if (b.id === 'streak-3' && newCurrentStreak >= 3) unlocked = true;
        if (b.id === 'streak-7' && newCurrentStreak >= 7) unlocked = true;
        if (b.id === 'pushups-50' && totalRepsCount >= 50) unlocked = true;
        if (unlocked) {
          return { ...b, unlockedAt: today };
        }
        return b;
      });

      return {
        ...prev,
        currentStreak: newCurrentStreak,
        longestStreak: newLongest,
        lastActiveDate: completedToday > 0 ? today : prev.lastActiveDate,
        totalTasksCompleted: totalCompletedCount,
        totalWorkoutReps: totalRepsCount,
        totalStudyMinutes: prev.totalStudyMinutes + (completedToday > 0 ? 10 : 0),
        dailyHistory: updatedHistory,
        badges: updatedBadges,
      };
    });
  }, []);

  // Task actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const today = getTodayDateString();
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: today,
    };
    setTasks(prev => [newTask, ...prev]);
    if (settings.soundEnabled) soundEngine.playTick(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeAlarmTask?.id === taskId) {
      soundEngine.stopAlarmLoop();
      setActiveAlarmTask(null);
    }
    if (activeWorkoutTask?.id === taskId) {
      setActiveWorkoutTask(null);
    }
  }, [activeAlarmTask, activeWorkoutTask]);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          return {
            ...t,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      const target = updated.find(t => t.id === taskId);
      if (target?.completed) {
        if (settings.soundEnabled) {
          soundEngine.playSuccess(settings.volume);
        }
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
        checkStreakProgress(updated);
      }
      return updated;
    });
  }, [settings.soundEnabled, settings.volume, checkStreakProgress]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const nextSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
        const allDone = nextSubtasks.every(s => s.done);
        return {
          ...t,
          subtasks: nextSubtasks,
          completed: allDone,
          completedAt: allDone ? new Date().toISOString() : t.completedAt,
        };
      }
      return t;
    }));
    if (settings.soundEnabled) soundEngine.playTick(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  const logWorkoutSet = useCallback((taskId: string, setIndex: number, reps: number) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId && t.sets) {
          const newSets = [...t.sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            reps,
            completed: true,
          };
          const totalCompletedReps = newSets.reduce((sum, s) => sum + (s.completed ? s.reps : 0), 0);
          const allSetsDone = newSets.every(s => s.completed);
          return {
            ...t,
            sets: newSets,
            completedReps: totalCompletedReps,
            completed: allSetsDone || (t.targetReps ? totalCompletedReps >= t.targetReps : false),
            completedAt: (allSetsDone || (t.targetReps && totalCompletedReps >= t.targetReps)) ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      });

      if (settings.soundEnabled) soundEngine.playTick(settings.volume);
      checkStreakProgress(updated);
      return updated;
    });
  }, [settings.soundEnabled, settings.volume, checkStreakProgress]);

  const addQuickWorkoutReps = useCallback((taskId: string, reps: number) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const nextReps = Math.max(0, (t.completedReps || 0) + reps);
          const isDone = t.targetReps ? nextReps >= t.targetReps : false;
          return {
            ...t,
            completedReps: nextReps,
            completed: isDone,
            completedAt: isDone ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      });
      if (settings.soundEnabled) soundEngine.playTick(settings.volume);
      checkStreakProgress(updated);
      return updated;
    });
  }, [settings.soundEnabled, settings.volume, checkStreakProgress]);

  const snoozeAlarm = useCallback((taskId: string, minutes: number) => {
    soundEngine.stopAlarmLoop();
    setActiveAlarmTask(null);

    const snoozeTarget = new Date(Date.now() + minutes * 60000);
    const h = String(snoozeTarget.getHours()).padStart(2, '0');
    const m = String(snoozeTarget.getMinutes()).padStart(2, '0');
    const newTime = `${h}:${m}`;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, alarmTime: newTime, lastAlarmFiredDate: undefined } : t));
  }, []);

  const dismissAlarm = useCallback(() => {
    soundEngine.stopAlarmLoop();
    setActiveAlarmTask(null);
  }, []);

  const completeAlarmTask = useCallback(() => {
    if (activeAlarmTask) {
      soundEngine.stopAlarmLoop();
      toggleTaskComplete(activeAlarmTask.id);
      setActiveAlarmTask(null);
    }
  }, [activeAlarmTask, toggleTaskComplete]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Filtered task list (single unified list with clean search)
  const filteredTasks = React.useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(task => {
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description?.toLowerCase().includes(q);
      const matchesSubject = task.subject?.toLowerCase().includes(q);
      return matchesTitle || matchesDesc || matchesSubject;
    });
  }, [tasks, searchQuery]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedCalendarDate,
        setSelectedCalendarDate,
        streakStats,
        settings,
        updateSettings,
        activeAlarmTask,
        activeWorkoutTask,
        setActiveWorkoutTask,
        showStartupModal,
        setShowStartupModal,
        showNewTaskModal,
        setShowNewTaskModal,
        editingTask,
        setEditingTask,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        logWorkoutSet,
        addQuickWorkoutReps,
        snoozeAlarm,
        dismissAlarm,
        completeAlarmTask,
        testAlarmSound,
        requestNotificationPermission,
        sendTestScreenNotification,
        notificationPermission,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTask(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
