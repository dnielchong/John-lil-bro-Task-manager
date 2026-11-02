import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root config files
  zip.file('package.json', JSON.stringify({
    name: "taskpulse",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      preview: "vite preview"
    },
    dependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@vitejs/plugin-react": "^6.1.1",
      "canvas-confetti": "^1.9.4",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "tailwindcss": "^4.3.3",
      "vite": "^8.3.0",
      "vite-plugin-pwa": "^1.2.0"
    },
    devDependencies: {
      "@types/canvas-confetti": "^1.9.0",
      "@types/jszip": "^3.4.1",
      "@types/node": "^22.14.0",
      "@types/react": "^19.3.0",
      "@types/react-dom": "^19.3.0",
      "typescript": "^7.0.2"
    }
  }, null, 2));

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      isolatedModules: true,
      moduleDetection: "force",
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      types: ["vite/client", "vite-plugin-pwa/client"]
    },
    include: ["src"]
  }, null, 2));

  zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: 'TaskPulse: Focus, Workout & Streak Tracker',
        short_name: 'TaskPulse',
        description: 'Local task manager with alarms for homework, bodyweight workouts, streaks, and weekly summaries.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ]
      }
    })
  ]
});
`);

  zip.file('.gitignore', `node_modules
dist
dist-ssr
*.local
.DS_Store
`);

  zip.file('README.md', `# ⚡ TaskPulse: Focus, Workout & Streak Tracker

A fast, local-first daily task manager designed to keep you disciplined and motivated:
- ⏰ **Audio Alarms & Desktop Notifications**: Scheduled reminders for assignments, homework, and routines.
- 🏋️ **Hourly Body Exercise Alarm**: Reminds you every hour to complete bodyweight exercises (pushups, squats, planks) with an interactive set logger and rest countdown.
- 🧹 **8:00 PM Central House Cleanup**: Built-in daily reminder to tidy up your space, wash dishes, and prep for tomorrow.
- 🔥 **Streak & Motivation Engine**: Live activity heatmap, current & longest streak tracking, and unlockable achievement badges.
- 💻 **Computer Startup Launcher**: Instructions and batch script to open automatically on Windows, Mac, Linux, or as a native PWA on boot.
- 📊 **Weekly Summary Report**: Comprehensive end-of-week analytics, consistency metrics, and self-reflection notes.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📦 How to Push to GitHub

\`\`\`bash
# 1. Initialize a Git repository
git init

# 2. Stage and commit all files
git add .
git commit -m "feat: TaskPulse task and workout manager"

# 3. Create a repository on GitHub (https://github.com/new)
# Then link your remote and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskpulse.git
git push -u origin main
\`\`\`

---

## 🪟 How to Open on Computer Startup

### Method A: Install as Chrome / Edge PWA (Easiest)
1. Open the app in Chrome or Edge.
2. Click the **"Install App"** button in the top bar.
3. Once installed, go to \`chrome://apps\`, right-click **TaskPulse**, and check **"Start app when you sign in"**.

### Method B: Windows Startup Folder
1. Press \`Win + R\`, type \`shell:startup\`, and press Enter.
2. Create a shortcut to \`http://localhost:5173\` (or your hosted URL) in that folder.
`);

  return await zip.generateAsync({ type: 'blob' });
}
