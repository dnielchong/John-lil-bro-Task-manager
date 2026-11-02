export type TaskCategory = 'homework' | 'workout' | 'cleaning' | 'habit' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurringType = 'hourly' | 'daily' | 'weekdays' | 'weekends' | 'none';
export type WorkoutExercise = 'pushups' | 'squats' | 'pullups' | 'plank' | 'lunges' | 'dips' | 'burpees' | 'custom';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  
  // Timing & Alarm
  alarmTime: string; // HH:mm format, e.g. "17:30"
  alarmEnabled: boolean;
  alarmSound: 'digital-beep' | 'zen-chime' | 'fanfare' | 'boxing-bell';
  lastAlarmFiredDate?: string;
  isCentralTimePinned?: boolean; // e.g. 8:00 PM Central cleanup
  
  // Recurrence & Date
  recurring: RecurringType;
  dueDate?: string;
  
  // Status
  completed: boolean;
  completedAt?: string;

  // Homework specifics
  subject?: string;
  estimatedMinutes?: number;
  subtasks?: Subtask[];

  // Workout specifics
  workoutType?: WorkoutExercise;
  targetReps?: number;
  completedReps?: number;
  sets?: WorkoutSet[];
  restSeconds?: number;

  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'workout' | 'homework' | 'overall';
  unlockedAt?: string;
}

export interface DailyRecord {
  date: string;
  tasksCompleted: number;
  totalScheduled: number;
  workoutReps: number;
  studyMinutes: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalWorkoutReps: number;
  totalStudyMinutes: number;
  dailyHistory: Record<string, DailyRecord>;
  badges: Badge[];
}

export interface AppSettings {
  soundEnabled: boolean;
  alarmSound: 'digital-beep' | 'zen-chime' | 'fanfare' | 'boxing-bell';
  volume: number;
  desktopNotifications: boolean;
  dailyPushupGoal: number;
  
  // Hourly body exercise alarm
  hourlyExerciseEnabled: boolean;
  hourlyStartHour: number;
  hourlyEndHour: number;
  hourlyExerciseType: WorkoutExercise;
  hourlyTargetReps: number;
  lastHourlyFiredHour?: number;

  // 8pm Central Time House Cleanup Alarm
  houseCleanupCentralTimeEnabled: boolean;
}
