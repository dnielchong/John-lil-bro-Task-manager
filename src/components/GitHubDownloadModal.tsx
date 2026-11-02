import React, { useState } from 'react';
import { X, Github, Download, Check, Copy, Terminal, FolderArchive, Laptop } from 'lucide-react';
import { generateProjectZip } from '../utils/projectExporter';

interface GitHubDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDownloadModal: React.FC<GitHubDownloadModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'taskpulse-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setIsExporting(false);
    }
  };

  const gitSnippet = `# 1. Open terminal inside the unzipped folder:
git init
git add .
git commit -m "Initial commit of TaskPulse"
git branch -M main

# 2. Link your personal GitHub repo and push:
git remote add origin https://github.com/YOUR_USERNAME/taskpulse.git
git push -u origin main`;

  const installSnippet = `# Install dependencies and run locally on your PC
npm install
npm run dev`;

  const copyToClipboard = (text: string, type: 'git' | 'install') => {
    navigator.clipboard.writeText(text);
    if (type === 'git') {
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 2000);
    } else {
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Github className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Download Locally &amp; Push to GitHub
              </h2>
              <p className="text-xs text-neutral-400">
                Run offline on your PC or host from your own repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* Download ZIP */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-sky-400" />
                Complete Source Code (.ZIP)
              </span>
              <p className="text-neutral-400 text-[11px]">
                Full React + TypeScript project with all components and PWA config.
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isExporting ? 'Creating ZIP...' : 'Download .ZIP'}
            </button>
          </div>

          {/* Run locally */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                Run Locally (Node.js)
              </span>
              <button
                onClick={() => copyToClipboard(installSnippet, 'install')}
                className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedInstall ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedInstall ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              {installSnippet}
            </pre>
          </div>

          {/* Push to GitHub */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                Push to GitHub
              </span>
              <button
                onClick={() => copyToClipboard(gitSnippet, 'git')}
                className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedGit ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedGit ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
              {gitSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
