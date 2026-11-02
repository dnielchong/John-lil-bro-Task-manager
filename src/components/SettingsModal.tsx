import React, { useState } from 'react';
import { X, Volume2, Bell, Dumbbell, Sparkles, Download, ShieldCheck } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { get8pmCentralInLocalTime } from '../utils/defaults';
import { WorkoutExercise } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGitHubModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenGitHubModal }) => {
  const {
    settings,
    updateSettings,
    testAlarmSound,
    requestNotificationPermission,
    sendTestScreenNotification,
    notificationPermission,
  } = useTask();
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    updateSettings({ desktopNotifications: granted });
  };

  const handleTestScreenNotification = async () => {
    const success = await sendTestScreenNotification();
    if (success) {
      setTestSentMessage("Alert sent! Check your computer's screen corner.");
    } else {
      setTestSentMessage("Notification blocked or not supported by system.");
    }
    setTimeout(() => setTestSentMessage(null), 4000);
  };

  const local8pm = get8pmCentralInLocalTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <h2 className="text-base font-bold text-white">
            Settings &amp; Alarms
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* Sound & Volume */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-yellow-400" />
                Alarm Volume
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => updateSettings({ soundEnabled: e.target.checked })}
                  className="rounded border-neutral-700 accent-white w-3.5 h-3.5"
                />
                <span className="text-[11px] text-neutral-300">Audio On</span>
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Volume</span>
                <span className="font-mono text-white">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={e => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['digital-beep', 'zen-chime', 'boxing-bell', 'fanfare'].map(sound => (
                <button
                  key={sound}
                  onClick={() => testAlarmSound(sound)}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] transition cursor-pointer"
                >
                  Test {sound.replace('-', ' ')} (25s)
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Screen Notifications */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  Screen Notifications (Desktop Toasts)
                </span>
                <p className="text-[11px] text-neutral-400">
                  Creates a native pop-up alert on your computer screen even when minimized.
                </p>
              </div>

              {notificationPermission === 'granted' ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Enabled
                </span>
              ) : (
                <button
                  onClick={handleRequestNotification}
                  className="px-2.5 py-1 rounded bg-white hover:bg-neutral-200 text-black text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Enable Screen Popups
                </button>
              )}
            </div>

            {/* Test Button & System Information */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] text-neutral-400">
                Pops up in bottom-right (Windows) or top-right (macOS)
              </span>

              <button
                onClick={handleTestScreenNotification}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-sky-400" />
                <span>Test Screen Notification</span>
              </button>
            </div>

            {testSentMessage && (
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800 text-sky-300 text-[11px] flex items-center justify-between">
                <span>{testSentMessage}</span>
              </div>
            )}
          </div>

          {/* Hourly Body Exercise Settings */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-orange-500" />
                Hourly Exercise Alarm
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.hourlyExerciseEnabled}
                  onChange={e => updateSettings({ hourlyExerciseEnabled: e.target.checked })}
                  className="rounded border-neutral-700 accent-white w-3.5 h-3.5"
                />
                <span className="text-[11px] text-neutral-300">Active</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Exercise</label>
                <select
                  value={settings.hourlyExerciseType || 'pushups'}
                  onChange={e => updateSettings({ hourlyExerciseType: e.target.value as WorkoutExercise })}
                  className="w-full px-2 py-1 rounded bg-black border border-neutral-800 text-white text-xs"
                >
                  <option value="pushups">Pushups</option>
                  <option value="squats">Squats</option>
                  <option value="plank">Plank</option>
                  <option value="lunges">Lunges</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Reps Per Hour</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={settings.hourlyTargetReps || 15}
                  onChange={e => updateSettings({ hourlyTargetReps: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-black border border-neutral-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 8:00 PM Central Cleanup */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                8:00 PM Central House Cleanup
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.houseCleanupCentralTimeEnabled}
                  onChange={e => updateSettings({ houseCleanupCentralTimeEnabled: e.target.checked })}
                  className="rounded border-neutral-700 accent-white w-3.5 h-3.5"
                />
                <span className="text-[11px] text-neutral-300">Active</span>
              </label>
            </div>
            <p className="text-[11px] text-neutral-400">
              Corresponds to <span className="text-white font-mono">{local8pm}</span> local time.
            </p>
          </div>

          {/* GitHub / Local Export */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenGitHubModal();
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Download Project ZIP / GitHub Guide</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
