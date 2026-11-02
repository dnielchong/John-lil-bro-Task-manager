import React, { useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTask } from '../context/TaskContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { setShowStartupModal } = useTask();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <button
        onClick={() => setShowStartupModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
        title="App is installed on your computer"
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed</span>
      </button>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-neutral-200 px-3 py-1.5 text-xs font-bold text-black shadow-sm transition active:scale-95 cursor-pointer"
        title="Install app locally on your computer"
      >
        <Download className="w-3.5 h-3.5 text-black" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-xs rounded-xl bg-black border border-neutral-800 p-5 shadow-2xl text-neutral-200">
              <h3 className="text-sm font-bold text-white mb-2">Install on iOS</h3>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                1. Tap <strong>Share</strong> in Safari.<br />
                2. Tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-white py-1.5 text-xs font-bold text-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
