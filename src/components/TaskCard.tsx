import React from 'react';
import { Check, Clock, Bell, BellOff, Dumbbell, BookOpen, Sparkles, Flame, MoreVertical, Edit2, Trash2, Play } from 'lucide-react';
import { Task } from '../types';
import { useTask } from '../context/TaskContext';
import { formatTo12Hour } from '../utils/defaults';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    toggleTaskComplete,
    toggleSubtask,
    deleteTask,
    setEditingTask,
    setActiveWorkoutTask,
    updateTask,
    addQuickWorkoutReps,
  } = useTask();

  const [showMenu, setShowMenu] = React.useState(false);

  const isWorkout = task.category === 'workout';
  const isHomework = task.category === 'homework';
  const isCleaning = task.category === 'cleaning';

  const subtasksCompleted = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-150 ${
        task.completed
          ? 'bg-black/60 border-neutral-900 opacity-60'
          : 'bg-black border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox & Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition cursor-pointer shrink-0 ${
              task.completed
                ? 'bg-white text-black font-bold'
                : 'border border-neutral-700 hover:border-white bg-neutral-900'
            }`}
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            {/* Category icon and title */}
            <div className="flex items-center gap-2">
              <span className="shrink-0">
                {isWorkout && <Dumbbell className="w-4 h-4 text-orange-500" />}
                {isHomework && <BookOpen className="w-4 h-4 text-sky-400" />}
                {isCleaning && <Sparkles className="w-4 h-4 text-purple-400" />}
                {!isWorkout && !isHomework && !isCleaning && <Flame className="w-4 h-4 text-amber-400" />}
              </span>

              <h3
                className={`text-sm font-semibold text-white tracking-tight break-words ${
                  task.completed ? 'line-through text-neutral-500' : ''
                }`}
              >
                {task.title}
              </h3>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Workout inline tracker */}
            {isWorkout && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    Reps: <strong className="text-white">{task.completedReps || 0}</strong> / {task.targetReps || 15}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addQuickWorkoutReps(task.id, 5)}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => addQuickWorkoutReps(task.id, 10)}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(((task.completedReps || 0) / (task.targetReps || 15)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Homework Subtasks Checklist */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="pt-1.5 space-y-1">
                <div className="text-[10px] text-neutral-500 font-medium">
                  Steps ({subtasksCompleted}/{totalSubtasks})
                </div>
                <div className="space-y-1">
                  {task.subtasks.map(st => (
                    <div
                      key={st.id}
                      onClick={() => toggleSubtask(task.id, st.id)}
                      className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white transition cursor-pointer"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                          st.done ? 'bg-white border-white text-black' : 'border-neutral-700 bg-neutral-900'
                        }`}
                      >
                        {st.done && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                      </div>
                      <span className={st.done ? 'line-through text-neutral-600' : ''}>{st.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side alarm and menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Alarm Badge */}
          <button
            onClick={() => updateTask(task.id, { alarmEnabled: !task.alarmEnabled })}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border transition cursor-pointer ${
              task.alarmEnabled
                ? 'bg-neutral-900 text-white border-neutral-700'
                : 'bg-transparent text-neutral-600 border-neutral-900'
            }`}
            title={task.alarmEnabled ? 'Alarm ON' : 'Alarm OFF'}
          >
            {task.alarmEnabled ? (
              <Bell className="w-3 h-3 text-yellow-400" />
            ) : (
              <BellOff className="w-3 h-3 text-neutral-600" />
            )}
            <span>{formatTo12Hour(task.alarmTime)}</span>
          </button>

          {isWorkout && (
            <button
              onClick={() => setActiveWorkoutTask(task)}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition cursor-pointer"
              title="Open workout companion"
            >
              <Play className="w-3.5 h-3.5 text-orange-400 fill-current" />
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-6 w-28 rounded-lg bg-black border border-neutral-800 shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setEditingTask(task);
                    }}
                    className="w-full px-3 py-1 text-left text-neutral-300 hover:text-white hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-neutral-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      deleteTask(task.id);
                    }}
                    className="w-full px-3 py-1 text-left text-rose-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
