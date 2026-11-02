# ⚡ Task Manager

A simple, local-first daily task manager built to keep you disciplined, focused, and consistent. Runs offline, rings sustained alarms on time, and auto-opens on computer startup.

---

## 🌟 Key Features

1. **⏰ 12-Hour Audio Alarms & Desktop Notifications**
   - Synthesized Web Audio API alarms (Digital Beep, Zen Chime, Boxing Bell, Fanfare).
   - Sustained ringing for 25–45 seconds with snooze (5m/15m) and desktop push notification support.
2. **🔔 Hourly Bodyweight Exercise Alarms**
   - Configurable hourly chime reminding you to perform bodyweight exercises (pushups, squats, planks, lunges).
   - Live session companion with set logger, rep counter (+1, +5, +10), and inter-set rest timer with countdown ticks and completion bell.
3. **🧹 8:00 PM Central Time House Cleanup Routine**
   - Automatically converted to your local timezone.
   - Built-in evening tidy checklist: dinner dishes, counters, 10-minute tidy, trash disposal, and tomorrow's prep.
4. **📅 Interactive Calendar**
   - Monthly calendar grid view to schedule important tasks, deadlines, and alarms on specific dates.
5. **🔥 Streak Tracking & Motivation System**
   - Current streak and all-time record tracker.
   - Motivational milestone badges (On Fire, Pushup Pioneer, Calisthenics Beast, Homework Hero, Flawless Day).
   - Confetti bursts on task completion.
6. **💻 Open on Computer Startup**
   - PWA support with "Start app when you sign in".
   - Windows Startup batch file (`shell:startup`).
   - macOS Login Items and Linux autostart guide.
7. **🔒 100% Local & Private**
   - All data saved in your browser's `localStorage`. No accounts, logins, or cloud trackers required.

---

## 🚀 Running Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn

### 2. Setup & Launch
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

Visit `http://localhost:5173` (or port specified in terminal) in your browser.

---

## 📦 How to Upload to GitHub

```bash
# 1. Initialize local git repository
git init

# 2. Add all files and commit
git add .
git commit -m "Changes are: added 12-hour alarms, hourly bodyweight workout reminders, 8 PM Central house cleanup, and interactive calendar schedule"

# 3. Create a new GitHub repo at https://github.com/new
# 4. Link and push to main:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git push -u origin main
```

---

## 🖥️ Auto-Start on System Startup

- **Windows**: Press `Win + R`, type `shell:startup`, and place a shortcut to the app or batch file inside.
- **Chrome / Edge PWA**: Click "Install App", then in `chrome://apps`, right-click Task Manager and select **"Start app when you sign in"**.
- **macOS**: System Settings > General > Login Items > Add Task Manager.
