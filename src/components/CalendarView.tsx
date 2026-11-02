import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { formatDatePretty, formatTo12Hour } from '../utils/defaults';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    selectedCalendarDate,
    setSelectedCalendarDate,
    setShowNewTaskModal,
  } = useTask();

  const [currentDisplayDate, setCurrentDisplayDate] = useState(() => {
    return new Date();
  });

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth(); // 0-11

  const monthName = currentDisplayDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDisplayDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDisplayDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDisplayDate(today);
    const yStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedCalendarDate(yStr);
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Days array
  const calendarCells: { dateString: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Trailing previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateString: dateStr, dayNumber: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateString: dateStr, dayNumber: d, isCurrentMonth: true });
  }

  // Leading next month days to complete grid to 35 or 42
  const totalCellsNeeded = calendarCells.length <= 35 ? 35 : 42;
  const remaining = totalCellsNeeded - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateString: dateStr, dayNumber: d, isCurrentMonth: false });
  }

  // Get tasks matching the selected date
  const selectedDateTasks = tasks.filter(task => {
    if (task.dueDate === selectedCalendarDate) return true;
    if (task.recurring === 'daily') return true;
    if (task.recurring === 'hourly') return true;
    if (task.recurring === 'weekdays') {
      try {
        const [y, m, d] = selectedCalendarDate.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      } catch {
        return false;
      }
    }
    return false;
  });

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {monthName}
            </h2>
            <p className="text-xs text-neutral-400">
              Schedule important tasks, deadlines &amp; alarms on specific dates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-white transition cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow transition active:scale-95 cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Month Grid */}
      <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-neutral-500 pb-1 border-b border-neutral-900">
          {weekDayLabels.map(day => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map(cell => {
            const isSelected = cell.dateString === selectedCalendarDate;
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isToday = cell.dateString === todayStr;

            // Find tasks scheduled on this day
            const dayTasks = tasks.filter(t => {
              if (t.dueDate === cell.dateString) return true;
              if (t.recurring === 'daily') return true;
              return false;
            });

            return (
              <button
                key={cell.dateString}
                onClick={() => setSelectedCalendarDate(cell.dateString)}
                className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 border-white ring-1 ring-white'
                    : isToday
                    ? 'bg-neutral-950 border-neutral-700 hover:border-neutral-500'
                    : cell.isCurrentMonth
                    ? 'bg-black border-neutral-900 hover:border-neutral-800'
                    : 'bg-black/40 border-transparent opacity-30 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-semibold ${
                      isToday
                        ? 'text-white font-bold underline decoration-sky-400 decoration-2 underline-offset-2'
                        : isSelected
                        ? 'text-white'
                        : cell.isCurrentMonth
                        ? 'text-neutral-300'
                        : 'text-neutral-600'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayTasks.some(t => t.alarmEnabled) && (
                    <Bell className="w-2.5 h-2.5 text-yellow-400" />
                  )}
                </div>

                {/* Task indicators */}
                <div className="space-y-0.5 w-full overflow-hidden">
                  {dayTasks.slice(0, 2).map(t => (
                    <div
                      key={t.id}
                      className="text-[9px] px-1 py-0.5 rounded truncate text-neutral-300 bg-neutral-900/80 border border-neutral-800"
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <span className="text-[9px] text-neutral-500 block text-right pr-0.5">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda & Alarms */}
      <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">
              Schedule for {formatDatePretty(selectedCalendarDate)}
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              ({selectedDateTasks.length} tasks)
            </span>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Add to this Date</span>
          </button>
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-2">
            {selectedDateTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500 space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-neutral-700" />
            <p className="text-xs">
              No tasks scheduled for {formatDatePretty(selectedCalendarDate)}.
            </p>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black text-xs font-semibold cursor-pointer"
            >
              Schedule Task &amp; Alarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
