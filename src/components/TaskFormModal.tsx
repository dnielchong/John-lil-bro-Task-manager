import React, { useState, useEffect } from 'react';
import { X, Dumbbell, BookOpen, Sparkles, Plus, Trash2, Bell, Flame } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { TaskCategory, TaskPriority, RecurringType, WorkoutExercise } from '../types';
import { getTodayDateString, get8pmCentralInLocalTime, formatTo12Hour } from '../utils/defaults';

export const TaskFormModal: React.FC = () => {
  const { showNewTaskModal, setShowNewTaskModal, editingTask, setEditingTask, addTask, updateTask, testAlarmSound, selectedCalendarDate } = useTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('homework');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [alarmTime, setAlarmTime] = useState('17:00');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmSound, setAlarmSound] = useState<'digital-beep' | 'zen-chime' | 'fanfare' | 'boxing-bell'>('zen-chime');
  const [recurring, setRecurring] = useState<RecurringType>('daily');
  const [dueDate, setDueDate] = useState(getTodayDateString());

  // Homework
  const [subject, setSubject] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [subtasks, setSubtasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Workout
  const [workoutType, setWorkoutType] = useState<WorkoutExercise>('pushups');
  const [targetReps, setTargetReps] = useState(30);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setAlarmTime(editingTask.alarmTime || '17:00');
      setAlarmEnabled(editingTask.alarmEnabled);
      setAlarmSound(editingTask.alarmSound || 'zen-chime');
      setRecurring(editingTask.recurring || 'daily');
      setDueDate(editingTask.dueDate || getTodayDateString());
      setSubject(editingTask.subject || '');
      setEstimatedMinutes(editingTask.estimatedMinutes || 45);
      setSubtasks(editingTask.subtasks || []);
      setWorkoutType(editingTask.workoutType || 'pushups');
      setTargetReps(editingTask.targetReps || 30);
    } else {
      setTitle('');
      setDescription('');
      setCategory('homework');
      setPriority('medium');
      setAlarmTime('17:00');
      setAlarmEnabled(true);
      setAlarmSound('zen-chime');
      setRecurring('daily');
      setDueDate(selectedCalendarDate || getTodayDateString());
      setSubject('');
      setEstimatedMinutes(45);
      setSubtasks([]);
      setWorkoutType('pushups');
      setTargetReps(30);
    }
  }, [editingTask, showNewTaskModal]);

  if (!showNewTaskModal && !editingTask) return null;

  const handleClose = () => {
    setShowNewTaskModal(false);
    setEditingTask(null);
  };

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'sub_' + Date.now(), text: newSubtaskText.trim(), done: false },
    ]);
    setNewSubtaskText('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      alarmTime,
      alarmEnabled,
      alarmSound,
      recurring,
      dueDate,
      subject: category === 'homework' ? (subject.trim() || undefined) : undefined,
      estimatedMinutes: category === 'homework' ? estimatedMinutes : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      workoutType: category === 'workout' ? workoutType : undefined,
      targetReps: category === 'workout' ? targetReps : undefined,
      completedReps: editingTask ? editingTask.completedReps : 0,
      sets: category === 'workout' ? [{ setNumber: 1, reps: targetReps, completed: false }] : undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <h2 className="text-base font-bold text-white">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* Category Selector with vibrant colored icons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'homework', label: 'Homework', icon: BookOpen, color: 'text-sky-400' },
                { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-orange-500' },
                { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'text-purple-400' },
                { id: 'habit', label: 'Habit', icon: Flame, color: 'text-amber-400' },
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id as TaskCategory);
                      if (cat.id === 'workout') {
                        setAlarmSound('boxing-bell');
                      } else if (cat.id === 'cleaning') {
                        setAlarmSound('fanfare');
                        setAlarmTime(get8pmCentralInLocalTime());
                      } else {
                        setAlarmSound('zen-chime');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 border-white text-white font-bold'
                        : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${cat.color}`} />
                    <span className="text-[11px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-300">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 50 Pushups / Calculus HW / Tidy Room"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-white text-sm text-white placeholder-neutral-600 outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-300">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details or notes..."
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-white text-xs text-white placeholder-neutral-600 outline-none resize-none"
            />
          </div>

          {/* Alarm & Timing */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Bell className="w-3.5 h-3.5 text-yellow-400" />
                Alarm &amp; Repeat
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarmEnabled}
                  onChange={e => setAlarmEnabled(e.target.checked)}
                  className="rounded border-neutral-700 accent-white w-3.5 h-3.5"
                />
                <span className="text-neutral-300 text-[11px]">Alarm On</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-neutral-500">Time</label>
                  <span className="text-[10px] text-white font-mono font-semibold">
                    {formatTo12Hour(alarmTime)}
                  </span>
                </div>
                <input
                  type="time"
                  value={alarmTime}
                  onChange={e => setAlarmTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black border border-neutral-800 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Repeat</label>
                <select
                  value={recurring}
                  onChange={e => setRecurring(e.target.value as RecurringType)}
                  className="w-full px-2.5 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs outline-none"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="none">One-time</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-neutral-500">Tone</label>
                  <button
                    type="button"
                    onClick={() => testAlarmSound(alarmSound)}
                    className="text-[9px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Test
                  </button>
                </div>
                <select
                  value={alarmSound}
                  onChange={e => setAlarmSound(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs outline-none"
                >
                  <option value="digital-beep">Beep</option>
                  <option value="zen-chime">Chime</option>
                  <option value="boxing-bell">Bell</option>
                  <option value="fanfare">Fanfare</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
              <label className="text-[10px] text-neutral-500">Scheduled Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-black border border-neutral-800 text-white font-mono text-xs outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Workout Specific */}
          {category === 'workout' && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Exercise</label>
                <select
                  value={workoutType}
                  onChange={e => setWorkoutType(e.target.value as WorkoutExercise)}
                  className="w-full px-2 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs"
                >
                  <option value="pushups">Pushups</option>
                  <option value="squats">Squats</option>
                  <option value="pullups">Pullups</option>
                  <option value="plank">Plank</option>
                  <option value="lunges">Lunges</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Target Reps</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={targetReps}
                  onChange={e => setTargetReps(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Homework Specific */}
          {category === 'homework' && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Math, History"
                  className="w-full px-2 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Est. Minutes</label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  step="5"
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-black border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-300">Checklist Steps (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={e => setNewSubtaskText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a step..."
                className="flex-1 px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 outline-none"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs border border-neutral-700 transition cursor-pointer"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1 pt-1">
                {subtasks.map((st, i) => (
                  <div key={st.id} className="flex items-center justify-between px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-xs">
                    <span className="text-neutral-300 truncate">{i + 1}. {st.text}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(st.id)}
                      className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow transition cursor-pointer"
            >
              {editingTask ? 'Save' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
