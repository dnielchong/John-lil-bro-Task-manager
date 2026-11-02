import React from 'react';
import { Plus, Flame, Settings, Github, Monitor, ListTodo, Calendar } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenGitHubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenGitHubModal }) => {
  const {
    activeTab,
    setActiveTab,
    setShowNewTaskModal,
    setShowStartupModal,
    streakStats,
  } = useTask();

  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm">⚡</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base text-white tracking-tight">John's Lock In Schedule</span>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{streakStats.currentStreak}d Streak</span>
              </div>
            </div>
          </div>

          {/* Center Tabs: Schedule vs Calendar */}
          <div className="flex items-center p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-sky-400" />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              onClick={() => setShowStartupModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
              title="Launch on Computer Startup"
            >
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Startup</span>
            </button>

            <button
              onClick={onOpenGitHubModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
              title="Download or Push to GitHub"
            >
              <Github className="w-3.5 h-3.5 text-purple-400" />
              <span>GitHub</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
              title="Settings & Alarms"
            >
              <Settings className="w-4 h-4 text-neutral-300" />
            </button>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
