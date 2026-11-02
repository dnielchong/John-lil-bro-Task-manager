import React, { useState } from 'react';
import { X, Monitor, CheckCircle, Copy, Download, ExternalLink, Sparkles } from 'lucide-react';
import { useTask } from '../context/TaskContext';

export const StartupGuideModal: React.FC = () => {
  const { showStartupModal, setShowStartupModal } = useTask();
  const [activeOS, setActiveOS] = useState<'chrome' | 'windows' | 'mac'>('chrome');
  const [copiedText, setCopiedText] = useState(false);

  if (!showStartupModal) return null;

  const appUrl = window.location.href;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const downloadWindowsBat = () => {
    const batContent = `@echo off
echo Starting TaskPulse...
start "" "${appUrl}"
exit
`;
    const blob = new Blob([batContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Launch-TaskPulse-At-Startup.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openAppWindow = () => {
    window.open(appUrl, 'TaskPulseApp', 'width=900,height=750,menubar=no,toolbar=no,location=no,status=no');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Open on Computer Startup
              </h2>
              <p className="text-xs text-neutral-400">
                Alarms &amp; tasks load immediately when you turn on your PC.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStartupModal(false)}
            className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 pt-2.5 gap-2 text-xs">
          <button
            onClick={() => setActiveOS('chrome')}
            className={`pb-2 px-2 font-medium border-b-2 transition cursor-pointer ${
              activeOS === 'chrome' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Chrome / Edge (Easiest)
          </button>
          <button
            onClick={() => setActiveOS('windows')}
            className={`pb-2 px-2 font-medium border-b-2 transition cursor-pointer ${
              activeOS === 'windows' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Windows (.bat)
          </button>
          <button
            onClick={() => setActiveOS('mac')}
            className={`pb-2 px-2 font-medium border-b-2 transition cursor-pointer ${
              activeOS === 'mac' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            macOS
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {activeOS === 'chrome' && (
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2.5 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <li className="leading-relaxed">
                  <strong className="text-white">Install App:</strong> Click the <strong className="text-white">"Install App"</strong> button in the top bar.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Enable Auto-Launch:</strong> In Chrome or Edge, open <code className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-200 font-mono text-[11px]">chrome://apps</code>, right-click <strong className="text-white">TaskPulse</strong>, and check <strong className="text-emerald-400">Start app when you sign in</strong>.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Done:</strong> The app will automatically open in a dedicated window each time you boot up your computer.
                </li>
              </ol>

              <button
                onClick={openAppWindow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Standalone Window</span>
              </button>
            </div>
          )}

          {activeOS === 'windows' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Download Windows Startup File (.bat)</span>
                  <button
                    onClick={downloadWindowsBat}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Press <kbd className="px-1 rounded bg-neutral-900 border border-neutral-800 font-mono">Win + R</kbd>, type <code className="text-white font-mono">shell:startup</code>, and drag the downloaded .bat file inside.
                </p>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-300">
                <span className="truncate pr-2">{`start "" "${appUrl}"`}</span>
                <button
                  onClick={() => copyToClipboard(`start "" "${appUrl}"`)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {copiedText ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {activeOS === 'mac' && (
            <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                <li>Install TaskPulse as a web app.</li>
                <li>Open <strong className="text-white">System Settings</strong> on your Mac.</li>
                <li>Go to <strong className="text-white">General</strong> &gt; <strong className="text-white">Login Items</strong>.</li>
                <li>Under "Open at Login", click the <strong className="text-white">+</strong> button and select <strong className="text-white">TaskPulse</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-black flex justify-end">
          <button
            onClick={() => setShowStartupModal(false)}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
