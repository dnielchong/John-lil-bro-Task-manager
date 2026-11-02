import React from 'react';
import { Bell, CheckCircle2, Volume2, VolumeX, Dumbbell, BookOpen, Sparkles, Clock } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { soundEngine } from '../utils/sound';
import { formatTo12Hour } from '../utils/defaults';

export const ActiveAlarmModal: React.FC = () => {
  const {
    activeAlarmTask,
    completeAlarmTask,
    snoozeAlarm,
    dismissAlarm,
    setActiveWorkoutTask,
    settings,
  } = useTask();

  const [isMuted, setIsMuted] = React.useState(false);

  if (!activeAlarmTask) return null;

  const toggleSoundMute = () => {
    if (isMuted) {
      soundEngine.startAlarmLoop(activeAlarmTask.alarmSound || settings.alarmSound, settings.volume);
      setIsMuted(false);
    } else {
      soundEngine.stopAlarmLoop();
      setIsMuted(true);
    }
  };

  const handleStartWorkout = () => {
    soundEngine.stopAlarmLoop();
    setActiveWorkoutTask(activeAlarmTask);
    dismissAlarm();
  };

  const isWorkout = activeAlarmTask.category === 'workout';
  const isHomework = activeAlarmTask.category === 'homework';
  const isCleaning = activeAlarmTask.category === 'cleaning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-black border border-neutral-700 shadow-2xl overflow-hidden p-6 text-center space-y-5">
        {/* Animated Bell Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
          <Bell className="w-8 h-8 text-yellow-400 animate-bounce" />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
            {isWorkout && <Dumbbell className="w-3.5 h-3.5 text-orange-500" />}
            {isHomework && <BookOpen className="w-3.5 h-3.5 text-sky-400" />}
            {isCleaning && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            {!isWorkout && !isHomework && !isCleaning && <Clock className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="capitalize">{activeAlarmTask.category} • {formatTo12Hour(activeAlarmTask.alarmTime)}</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {activeAlarmTask.title}
          </h2>

          {activeAlarmTask.description && (
            <p className="text-xs text-neutral-400 max-w-sm mx-auto line-clamp-2">
              {activeAlarmTask.description}
            </p>
          )}

          {isWorkout && activeAlarmTask.targetReps && (
            <div className="mt-1 text-xs text-orange-400 font-semibold">
              🎯 Target: {activeAlarmTask.targetReps} reps
            </div>
          )}
        </div>

        {/* Ringing status indicator */}
        <div className="text-[11px] text-amber-400 font-mono flex items-center justify-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Alarm ringing continuously (sustained alert)
        </div>

        {/* Sound Mute */}
        <div className="flex justify-center">
          <button
            onClick={toggleSoundMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isWorkout && (
            <button
              onClick={handleStartWorkout}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-orange-500" />
              <span>Start Workout Counter</span>
            </button>
          )}

          <button
            onClick={completeAlarmTask}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>Mark Completed (+Streak)</span>
          </button>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <button
              onClick={() => snoozeAlarm(activeAlarmTask.id, 5)}
              className="py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition cursor-pointer"
            >
              Snooze 5m
            </button>
            <button
              onClick={() => snoozeAlarm(activeAlarmTask.id, 15)}
              className="py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition cursor-pointer"
            >
              Snooze 15m
            </button>
            <button
              onClick={dismissAlarm}
              className="py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
