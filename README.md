# LaunchPad - Universal Project Manager

A custom Electron desktop application for managing any structured project.

## Features

- 📋 **Task Management** - View and track all 45 project tasks
- 🎯 **Milestone Tracking** - Visual timeline of key business milestones  
- 📊 **Timeline View** - Gantt chart visualization of project dependencies
- 💰 **Revenue Calculator** - Calculate hourly rates and monthly targets
- 🔄 **Auto-sync** - Automatically loads data from your CSV files
- ✅ **Progress Tracking** - Mark tasks complete and see overall progress

## Installation

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org
   - Choose the LTS version

2. **Install dependencies**:
   ```bash
   cd "C:\Users\Mike RT\Desktop\LaunchPad"
   npm install
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

## Usage

### First Launch
The app automatically loads your business plan data from:
- `../Zoomed In Business Plan/03-Project Management/Task List.csv`
- `../Zoomed In Business Plan/03-Project Management/Gantt Chart.csv`

### Features Overview

**Tasks Tab:**
- View all 45 project tasks organized by phase
- Filter by phase or task type
- Check off completed tasks
- See progress statistics

**Milestones Tab:**
- Visual timeline of major business milestones
- Track progress from legal setup to team expansion

**Timeline Tab:**
- Gantt chart view of project dependencies
- Critical path visualization

**Revenue Tab:**
- Calculate weekly/monthly revenue based on hourly rate
- Track progress toward survival target (NZ$4,500/month)
- Monitor team expansion trigger (NZ$7,500/month)

### Keyboard Shortcuts
- `F5` - Refresh data from CSV files
- `Ctrl+Q` - Quit application

## File Structure
```
LaunchPad/
├── main.js           # Main Electron process
├── package.json      # Dependencies and scripts
├── src/
│   ├── index.html    # Main UI
│   ├── styles.css    # Styling
│   └── renderer.js   # UI logic
└── data/             # Local data storage
```

## Customization

You can modify the app by editing:
- `src/styles.css` - Change colors, fonts, layout
- `src/renderer.js` - Add new features or calculations
- `src/index.html` - Modify the interface

## Troubleshooting

**App won't start:**
- Make sure Node.js is installed
- Run `npm install` in the app directory

**No data showing:**
- Check that CSV files exist in the Business Plan folder
- Click the "Refresh" button to reload data

**Tasks not saving:**
- Task completion is stored in memory only
- Restart the app to reset task states

## Building for Distribution

To create an executable file:
```bash
npm run build
```

This creates a Windows installer in the `dist/` folder.

## Development with Amazon Q

To resume development conversations with Amazon Q:
```
Resume LaunchPad development - check @LaunchPad folder and CHAT_LOG.md
```

**What this does:**
- Loads the entire LaunchPad project context
- Reviews CHAT_LOG.md for previous development sessions
- Provides Amazon Q with current project status and features
- Enables immediate continuation of development work without re-explaining the project

---

**Your universal project management app for any structured project!**