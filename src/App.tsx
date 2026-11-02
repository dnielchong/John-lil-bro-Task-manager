import React, { useState } from 'react';
import { TaskProvider, useTask } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { TaskCard } from './components/TaskCard';
import { HourlyExerciseBanner } from './components/HourlyExerciseBanner';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { WorkoutModal } from './components/WorkoutModal';
import { StartupGuideModal } from './components/StartupGuideModal';
import { TaskFormModal } from './components/TaskFormModal';
import { GitHubDownloadModal } from './components/GitHubDownloadModal';
import { SettingsModal } from './components/SettingsModal';
import { CalendarView } from './components/CalendarView';
import { Search, Plus, CheckCircle2 } from 'lucide-react';
import animeBg from './assets/images/anime_study_night_1793591015940.jpg';

const MainDashboard: React.FC = () => {
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    setShowNewTaskModal,
    tasks,
    activeTab,
  } = useTask();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Anime Themed Background Wallpaper */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-45"
        style={{ backgroundImage: `url(${animeBg})` }}
      />
      {/* Dark vignette overlay for contrast and focus */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10">
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {activeTab === 'calendar' ? (
          <CalendarView />
        ) : (
          <>
            {/* Top Hourly Exercise & 8 PM Central Cleanup Section */}
            <HourlyExerciseBanner />

        {/* Task List Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Daily Tasks &amp; Schedule
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              ({completedCount}/{totalCount} done)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-white outline-none"
              />
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center gap-1 shrink-0 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Combined Unified Task List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl bg-neutral-950 border border-neutral-900 space-y-3">
            <CheckCircle2 className="w-8 h-8 mx-auto text-neutral-600" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">No tasks found</h3>
              <p className="text-xs text-neutral-500">
                {searchQuery ? 'Try clearing your search query.' : 'Add your first task to start your daily streak!'}
              </p>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
            >
              Add Task
            </button>
          </div>
        )}
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-neutral-900 bg-black/90 backdrop-blur-md py-3 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span>John's Lock In Schedule • Local &amp; Private</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-neutral-400 transition cursor-pointer"
            >
              GitHub / Local Run
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-neutral-400 transition cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ActiveAlarmModal />
      <WorkoutModal />
      <StartupGuideModal />
      <TaskFormModal />
      <GitHubDownloadModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenGitHubModal={() => {
          setIsSettingsOpen(false);
          setIsGitHubModalOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainDashboard />
    </TaskProvider>
  );
}
