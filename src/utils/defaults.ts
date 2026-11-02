import { Badge, Task, AppSettings, StreakStats } from '../types';

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first-task',
    name: 'Spark of Action',
    description: 'Completed your very first task',
    icon: '⚡',
    category: 'overall',
  },
  {
    id: 'streak-3',
    name: 'On Fire',
    description: 'Kept the fire burning for 3 consecutive days',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Unstoppable 7-day active streak',
    icon: '🏆',
    category: 'streak',
  },
  {
    id: 'pushups-50',
    name: 'Pushup Pioneer',
    description: 'Conquered 50 total pushups or bodyweight reps',
    icon: '💪',
    category: 'workout',
  },
  {
    id: 'cleanup-champion',
    name: 'Order & Clarity',
    description: 'Completed 8:00 PM house cleanup routine',
    icon: '🧹',
    category: 'overall',
  },
  {
    id: 'homework-master',
    name: 'Homework Hero',
    description: 'Completed homework or study assignments on time',
    icon: '📚',
    category: 'homework',
  },
];

/**
 * Converts a 24-hour "HH:mm" time string into standard 12-hour format with AM/PM (e.g. "5:30 PM", "8:00 PM")
 */
export function formatTo12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Calculates what time 8:00 PM Central Time (America/Chicago) translates to in user's local 24-hr time for alarm matching
 */
export function get8pmCentralInLocalTime24(): string {
  try {
    const now = new Date();
    for (let h = 0; h < 24; h++) {
      const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0);
      const testCentral = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        hour12: false,
      }).format(testDate);
      if (parseInt(testCentral, 10) === 20) {
        return `${String(h).padStart(2, '0')}:00`;
      }
    }
  } catch {
    // fallback
  }
  return '20:00';
}

/**
 * Formats 8:00 PM Central Time in user's local timezone as a 12-hour string (e.g. "8:00 PM" or local equivalent)
 */
export function get8pmCentralInLocalTime(): string {
  return formatTo12Hour(get8pmCentralInLocalTime24());
}

/**
 * Get current time in Central Time (US/Central) in 12-hour format for status display
 */
export function getCentralTimeInfo(): { timeString: string; is8pmCentral: boolean } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const militaryFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const timeString = formatter.format(now);
    const parts = militaryFormatter.formatToParts(now);
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    return {
      timeString,
      is8pmCentral: hours === 20 && minutes === 0,
    };
  } catch {
    return { timeString: 'Central Time', is8pmCentral: false };
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  alarmSound: 'digital-beep',
  volume: 0.7,
  desktopNotifications: true,
  dailyPushupGoal: 50,
  
  // Hourly body exercise alarm
  hourlyExerciseEnabled: true,
  hourlyStartHour: 9,
  hourlyEndHour: 21,
  hourlyExerciseType: 'pushups',
  hourlyTargetReps: 15,

  // 8pm Central Time House Cleanup Alarm
  houseCleanupCentralTimeEnabled: true,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDatePretty(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const cleanupTime24 = get8pmCentralInLocalTime24();

  return [
    {
      id: 'task-hourly-body-exercise',
      title: 'Hourly Body Exercise: 15 Pushups',
      description: 'Break up desk time with 10-15 clean pushups or squats every hour.',
      category: 'workout',
      priority: 'high',
      alarmTime: '15:00', // 3:00 PM
      alarmEnabled: true,
      alarmSound: 'boxing-bell',
      recurring: 'hourly',
      workoutType: 'pushups',
      targetReps: 15,
      completedReps: 0,
      sets: [
        { setNumber: 1, reps: 15, completed: false },
      ],
      restSeconds: 30,
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-house-cleanup-8pm',
      title: 'Clean Up the House & Evening Tidy',
      description: 'Scheduled daily at 8:00 PM Central Time. Keep your space clean and organized.',
      category: 'cleaning',
      priority: 'high',
      alarmTime: cleanupTime24, // 8:00 PM Central
      alarmEnabled: true,
      alarmSound: 'fanfare',
      isCentralTimePinned: true,
      recurring: 'daily',
      subtasks: [
        { id: 'st-c1', text: 'Wash/load dinner dishes & wipe counters', done: false },
        { id: 'st-c2', text: '10-minute surface tidy (living room & desk)', done: false },
        { id: 'st-c3', text: 'Take out kitchen trash & recycle bin', done: false },
        { id: 'st-c4', text: 'Prep clothes & workspace for tomorrow', done: false },
      ],
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-pushups-today',
      title: 'Daily Pushups Goal - 45 Reps',
      description: 'Chest, shoulders & core strength. Complete 3 sets.',
      category: 'workout',
      priority: 'high',
      alarmTime: '16:30', // 4:30 PM
      alarmEnabled: true,
      alarmSound: 'boxing-bell',
      recurring: 'daily',
      workoutType: 'pushups',
      targetReps: 45,
      completedReps: 0,
      sets: [
        { setNumber: 1, reps: 15, completed: false },
        { setNumber: 2, reps: 15, completed: false },
        { setNumber: 3, reps: 15, completed: false },
      ],
      restSeconds: 45,
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-homework-math',
      title: 'Math & Physics Problem Set 4',
      description: 'Complete questions 1 to 10 and submit online.',
      category: 'homework',
      priority: 'high',
      alarmTime: '17:30', // 5:30 PM
      alarmEnabled: true,
      alarmSound: 'zen-chime',
      recurring: 'weekdays',
      subject: 'Calculus & Physics',
      dueDate: today,
      estimatedMinutes: 60,
      subtasks: [
        { id: 'st-1', text: 'Questions 1 - 5 (Problems & proofs)', done: false },
        { id: 'st-2', text: 'Questions 6 - 10 (Kinematics application)', done: false },
        { id: 'st-3', text: 'Review final answers and submit PDF', done: false },
      ],
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-reading-history',
      title: 'History / English Essay Draft',
      description: 'Write thesis statement and three supporting body paragraphs.',
      category: 'homework',
      priority: 'medium',
      alarmTime: '19:15', // 7:15 PM
      alarmEnabled: true,
      alarmSound: 'zen-chime',
      recurring: 'weekdays',
      subject: 'History',
      dueDate: today,
      estimatedMinutes: 45,
      subtasks: [
        { id: 'st-h1', text: 'Write introductory paragraph & thesis', done: false },
        { id: 'st-h2', text: 'Find 3 citations and add bibliography', done: false },
      ],
      completed: false,
      createdAt: today,
    },
  ];
}

export function getInitialStreakStats(): StreakStats {
  const today = new Date();
  const history: Record<string, { date: string; tasksCompleted: number; totalScheduled: number; workoutReps: number; studyMinutes: number }> = {};

  for (let i = 3; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    history[dateKey] = {
      date: dateKey,
      tasksCompleted: 3,
      totalScheduled: 4,
      workoutReps: 40,
      studyMinutes: 60,
    };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const badges = DEFAULT_BADGES.map((b) => {
    if (b.id === 'first-task' || b.id === 'streak-3' || b.id === 'pushups-50') {
      return { ...b, unlockedAt: yStr };
    }
    return b;
  });

  return {
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: yStr,
    totalTasksCompleted: 12,
    totalWorkoutReps: 150,
    totalStudyMinutes: 200,
    dailyHistory: history,
    badges,
  };
}
