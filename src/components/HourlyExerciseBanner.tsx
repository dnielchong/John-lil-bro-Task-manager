import React, { useState, useEffect } from 'react';
import { Dumbbell, Clock, Bell, Sparkles, Play, ToggleRight, ToggleLeft, Monitor } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { getCentralTimeInfo, get8pmCentralInLocalTime } from '../utils/defaults';
import { soundEngine } from '../utils/sound';

export const HourlyExerciseBanner: React.FC = () => {
  const {
    settings,
    updateSettings,
    setActiveWorkoutTask,
    tasks,
    sendTestScreenNotification,
    notificationPermission,
  } = useTask();
  const [minutesToNextHour, setMinutesToNextHour] = useState(60 - new Date().getMinutes());
  const [centralInfo, setCentralInfo] = useState(getCentralTimeInfo());
  const [isTestingBell, setIsTestingBell] = useState(false);
  const [screenToastActive, setScreenToastActive] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setMinutesToNextHour(60 - now.getMinutes());
      setCentralInfo(getCentralTimeInfo());
    };
    const timer = setInterval(updateTimes, 15000);
    return () => clearInterval(timer);
  }, []);

  const toggleTestBell = () => {
    if (isTestingBell) {
      soundEngine.stopAlarmLoop();
      setIsTestingBell(false);
    } else {
      setIsTestingBell(true);
      soundEngine.startAlarmLoop('fanfare', settings.volume, 25);
      setTimeout(() => {
        setIsTestingBell(false);
      }, 25000);
    }
  };

  const handleTestScreen = async () => {
    setScreenToastActive(true);
    await sendTestScreenNotification();
    setTimeout(() => {
      setScreenToastActive(false);
    }, 3500);
  };

  const triggerHourlyNow = () => {
    soundEngine.playSoundPattern('boxing-bell', settings.volume);
    const existing = tasks.find(t => t.recurring === 'hourly');
    if (existing) {
      setActiveWorkoutTask(existing);
    } else {
      setActiveWorkoutTask({
        id: 'hourly-workout-live',
        title: `Hourly ${settings.hourlyExerciseType || 'Pushups'} Challenge`,
        category: 'workout',
        priority: 'high',
        alarmTime: `${String(new Date().getHours()).padStart(2, '0')}:00`,
        alarmEnabled: true,
        alarmSound: 'boxing-bell',
        recurring: 'hourly',
        workoutType: settings.hourlyExerciseType || 'pushups',
        targetReps: settings.hourlyTargetReps || 15,
        completedReps: 0,
        sets: [{ setNumber: 1, reps: settings.hourlyTargetReps || 15, completed: false }],
        restSeconds: 30,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const local8pmCleanTime = get8pmCentralInLocalTime();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* 1. Hourly Exercise Alarm */}
      <div className="p-4 rounded-xl bg-black border border-neutral-800 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Hourly Body Exercise
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {settings.hourlyTargetReps || 15} reps
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Alarms every 60 min to do pushups or squats.
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ hourlyExerciseEnabled: !settings.hourlyExerciseEnabled })}
            className="cursor-pointer text-white"
            title="Toggle hourly alarm"
          >
            {settings.hourlyExerciseEnabled ? (
              <ToggleRight className="w-6 h-6 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-neutral-600" />
            )}
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-sky-400" /> Next alarm in {minutesToNextHour}m
          </span>
          <button
            onClick={triggerHourlyNow}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current text-black" />
            <span>Do Reps Now</span>
          </button>
        </div>
      </div>

      {/* 2. 8:00 PM Central House Cleanup */}
      <div className="p-4 rounded-xl bg-black border border-neutral-800 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  8:00 PM Central House Cleanup
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                Central: <span className="text-white font-mono">{centralInfo.timeString}</span> • Local: <span className="text-white font-mono">{local8pmCleanTime}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ houseCleanupCentralTimeEnabled: !settings.houseCleanupCentralTimeEnabled })}
            className="cursor-pointer text-white"
            title="Toggle 8:00 PM Central cleanup alarm"
          >
            {settings.houseCleanupCentralTimeEnabled ? (
              <ToggleRight className="w-6 h-6 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-neutral-600" />
            )}
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={handleTestScreen}
            className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
              screenToastActive
                ? 'bg-sky-400 text-black border-sky-400 font-bold'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title="Pop up a native test notification on your computer screen"
          >
            <Monitor className="w-3 h-3 text-sky-400" />
            <span>{screenToastActive ? 'Screen Alert Sent!' : 'Test Screen Alert'}</span>
          </button>

          <button
            onClick={toggleTestBell}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              isTestingBell
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white'
            }`}
          >
            <Bell className={`w-3 h-3 ${isTestingBell ? 'text-black' : 'text-yellow-400'}`} />
            <span>{isTestingBell ? 'Stop Alarm (Ringing...)' : 'Test Alarm (25s)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
