# ⚡ TaskPulse: Focus, Workout & Streak Tracker

A simple, local-first daily task manager built for students, athletes, and achievers. Designed to run offline, keep you focused, ring alarms on time, and auto-open on computer startup.

---

## 🌟 Key Features

1. **⏰ Audio Alarms & Desktop Notifications**
   - Synthesized Web Audio API alarms (Digital Beep, Zen Chime, Boxing Bell, Fanfare).
   - Snooze (5m/15m), complete now (+streak), and desktop push notification support.
2. **🔔 Hourly Bodyweight Exercise Alarms**
   - Configurable hourly chime reminding you to perform bodyweight exercises (pushups, squats, planks, lunges).
   - Live session modal with set logger, rep counter (+1, +5, +10), and inter-set rest timer with countdown ticks and completion bell.
3. **🧹 8:00 PM Central Time House Cleanup Routine**
   - Automatically converted to your local timezone.
   - Built-in evening tidy checklist: dinner dishes, counters, 10-minute tidy, trash disposal, and tomorrow's prep.
4. **🔥 Streak Tracking & Motivation System**
   - Live activity heatmap matrix.
   - Current streak and all-time record tracker.
   - Motivational milestone badges (On Fire, Pushup Pioneer, Calisthenics Beast, Homework Hero, Flawless Day).
   - Confetti bursts on task completion.
5. **💻 Open on Computer Startup**
   - PWA support with "Start app when you sign in".
   - Windows Startup batch file (`shell:startup`).
   - macOS Login Items and Linux autostart guide.
6. **📊 End-of-Week Summary Report (Optional)**
   - Weekly digest summarizing tasks completed, total pushup reps, study hours, consistency %, and personal reflection notes.
   - Print or copy as Markdown for records.
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
git clone https://github.com/YOUR_USERNAME/taskpulse.git
cd taskpulse

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
git commit -m "feat: TaskPulse task and workout manager"

# 3. Create a new GitHub repo at https://github.com/new
# 4. Link and push to main:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskpulse.git
git push -u origin main
```

---

## 🖥️ Auto-Start on System Startup

- **Windows**: Press `Win + R`, type `shell:startup`, and place a shortcut to the app or batch file inside.
- **Chrome / Edge PWA**: Click "Install App", then in `chrome://apps`, right-click TaskPulse and select **"Start app when you sign in"**.
- **macOS**: System Settings > General > Login Items > Add TaskPulse.
