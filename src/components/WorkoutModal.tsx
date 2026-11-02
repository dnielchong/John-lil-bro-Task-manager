import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Minus, Dumbbell, Sparkles } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { soundEngine } from '../utils/sound';

export const WorkoutModal: React.FC = () => {
  const { activeWorkoutTask, setActiveWorkoutTask, logWorkoutSet, addQuickWorkoutReps, toggleTaskComplete, settings } = useTask();

  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);
  const [restPreset, setRestPreset] = useState<number>(45);

  useEffect(() => {
    let timer: number;
    if (isRestTimerRunning && restSecondsLeft > 0) {
      timer = window.setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            if (settings.soundEnabled) {
              soundEngine.playSoundPattern('boxing-bell', settings.volume);
            }
            setIsRestTimerRunning(false);
            return 0;
          }
          if (settings.soundEnabled && prev <= 4) {
            soundEngine.playTick(settings.volume * 0.5);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRestTimerRunning, restSecondsLeft, settings.soundEnabled, settings.volume]);

  if (!activeWorkoutTask) return null;

  const startRestTimer = (seconds = restPreset) => {
    setRestSecondsLeft(seconds);
    setIsRestTimerRunning(true);
    if (settings.soundEnabled) soundEngine.playTick(settings.volume);
  };

  const stopRestTimer = () => setIsRestTimerRunning(false);
  const resetRestTimer = () => {
    setIsRestTimerRunning(false);
    setRestSecondsLeft(0);
  };

  const handleFinishWorkout = () => {
    toggleTaskComplete(activeWorkoutTask.id);
    setActiveWorkoutTask(null);
  };

  const targetReps = activeWorkoutTask.targetReps || 15;
  const completedReps = activeWorkoutTask.completedReps || 0;
  const progressPct = Math.min(100, Math.round((completedReps / targetReps) * 100));
  const exerciseName = activeWorkoutTask.workoutType || 'pushups';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white capitalize">
                {exerciseName} Session
              </h2>
              <p className="text-xs text-neutral-400">
                Log reps, track rest intervals, and hit target.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveWorkoutTask(null)}
            className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-neutral-300">
          {/* Main Reps Counter */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
            <div className="text-neutral-400 uppercase tracking-wider text-[11px] font-semibold">
              Reps Completed
            </div>
            <div className="text-5xl font-black text-white font-mono">
              {completedReps}
              <span className="text-2xl text-neutral-600 font-normal"> / {targetReps}</span>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => addQuickWorkoutReps(activeWorkoutTask.id, -1)}
                className="w-9 h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition cursor-pointer"
                title="Minus 1"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => addQuickWorkoutReps(activeWorkoutTask.id, 1)}
                className="px-3 h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => addQuickWorkoutReps(activeWorkoutTask.id, 5)}
                className="px-3 h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition cursor-pointer"
              >
                +5
              </button>
              <button
                onClick={() => addQuickWorkoutReps(activeWorkoutTask.id, 10)}
                className="px-4 h-9 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer"
              >
                +10 Reps
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden mt-3">
              <div
                className="h-full bg-white transition-all duration-200 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Sets Breakdown */}
          {activeWorkoutTask.sets && activeWorkoutTask.sets.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                Target Sets
              </div>
              <div className="grid grid-cols-3 gap-2">
                {activeWorkoutTask.sets.map((set, idx) => (
                  <div
                    key={set.setNumber}
                    onClick={() => {
                      logWorkoutSet(activeWorkoutTask.id, idx, set.reps);
                      startRestTimer(restPreset);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                      set.completed
                        ? 'bg-neutral-900 border-white text-white'
                        : 'bg-black border-neutral-800 hover:border-neutral-600 text-neutral-400'
                    }`}
                  >
                    <div className="text-[10px] text-neutral-500 font-mono">Set {set.setNumber}</div>
                    <div className="text-sm font-bold text-white">{set.reps} Reps</div>
                    <div className="text-[10px] mt-1 text-emerald-400">
                      {set.completed ? '✓ Logged' : 'Tap to log'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rest Timer */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Rest Timer</span>
              <div className="flex gap-1">
                {[30, 45, 60].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setRestPreset(s);
                      if (!isRestTimerRunning) setRestSecondsLeft(s);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                      restPreset === s ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-mono font-bold text-white">
                {String(Math.floor(restSecondsLeft / 60)).padStart(2, '0')}:
                {String(restSecondsLeft % 60).padStart(2, '0')}
              </div>

              <div className="flex gap-1.5">
                {isRestTimerRunning ? (
                  <button
                    onClick={stopRestTimer}
                    className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition cursor-pointer"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => startRestTimer(restSecondsLeft > 0 ? restSecondsLeft : restPreset)}
                    className="px-3 py-1 rounded-md bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
                  >
                    Start Rest
                  </button>
                )}
                <button
                  onClick={resetRestTimer}
                  className="p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-black flex items-center justify-between">
          <button
            onClick={() => setActiveWorkoutTask(null)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleFinishWorkout}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer"
          >
            Mark Done (+Streak)
          </button>
        </div>
      </div>
    </div>
  );
};
