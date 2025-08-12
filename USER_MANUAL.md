# LaunchPad User Manual
*Universal Project Management Desktop Application*

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Core Features](#core-features)
4. [Advanced Features](#advanced-features)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation
1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org
   - Choose the LTS version

2. **Install LaunchPad**:
   ```bash
   cd "path/to/LaunchPad"
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

### First Launch
- **Welcome Tour**: On first launch, you'll see a welcome modal offering a guided tour
- **Take the Tour**: Recommended for new users - shows key features and navigation
- **Skip Tour**: You can always restart it later using `F1` or the "📚 Take Tour" button

---

## Project Setup

### Required Project Structure
Your project folder must contain these directories:

```
YourProject/
├── 01-Planning Documents/
│   └── Business Summary.md
└── 03-Project Management/
    ├── Task List.csv
    └── Gantt Chart.csv
```

### CSV File Formats

**Task List.csv** - Required columns:
- `UUID` - Unique identifier for each task
- `Milestone Phase` - Project phase (e.g., "Planning", "Development")
- `Task Type` - Type of task (e.g., "Research", "Implementation")
- `Summary` - Task description

**Gantt Chart.csv** - Required columns (pipe-separated):
- `UUID` - Unique identifier
- `Task` - Task name
- `Start Date` - Start date (YYYY-MM-DD)
- `End Date` - End date (YYYY-MM-DD)
- `Duration` - Duration description
- `Plan Phase Type` - Phase category

### Selecting Your Project
1. Click **"📁 Open Project"** button
2. Navigate to your project folder
3. Select the folder containing the required structure
4. LaunchPad will automatically load your data

---

## Core Features

### 📋 Tasks Tab
**Main task management interface**

**Task Cards Display:**
- ✅ Checkbox to mark complete/incomplete
- 📝 Phase and type badges
- 👤 Assignment information
- ⏱️ Time tracking display
- 💭 Notes preview

**Task Actions:**
- **▶️/⏹️ Timer**: Start/stop time tracking
- **📝 Notes**: Add detailed task notes
- **👤 Assign**: Assign to team members
- **🔍 Details**: View complete task information

**Filtering:**
- Filter by phase using dropdown
- Filter by task type
- Filters work together for precise results

**Bulk Operations:**
- **📤 Export All**: Export all tasks to CSV
- **✅ Export Completed**: Export only completed tasks
- **🔄 Sync to Files**: Update original CSV files

### 🎯 Milestones Tab
**Visual timeline of major project milestones**
- Shows key business milestones
- Progress indicators
- Timeline visualization
- Milestone descriptions and dates

### 📊 Timeline Tab
**Gantt chart visualization**
- Project timeline view
- Task dependencies
- Phase-based organization
- Duration and date information

### 💰 Budget Tab
**Budget management features**
- Add budget items
- Track expenses
- Budget vs actual reporting
- Financial overview

### ⚠️ Risks Tab
**Risk management system**
- Risk matrix visualization
- Add and categorize risks
- Impact and probability assessment
- Mitigation tracking

### 👥 Stakeholders Tab
**Stakeholder management**
- Stakeholder matrix
- Contact information
- Influence and interest mapping
- Communication tracking

### 📈 Analytics Tab
**Comprehensive project analytics**
- **Overall Progress**: Completion percentage
- **Progress by Phase**: Phase-wise completion
- **Team Workload**: Task distribution by team member
- **Time Distribution**: Time spent by phase
- **Completion Timeline**: Progress over time

### 💵 Revenue Tab
**Revenue calculator and tracking**
- Set hourly rate and weekly hours
- Calculate weekly/monthly revenue
- Track progress toward targets
- Survival and expansion thresholds

---

## Advanced Features

### Time Tracking
1. **Start Timer**: Click ▶️ button on any task
2. **Stop Timer**: Click ⏹️ button (timer shows elapsed time)
3. **View Time**: Time spent appears in task card
4. **Export Time**: Time data included in CSV exports

### Team Management
1. **Assign Tasks**: Click 👤 button on task card
2. **Manage Team**: Click "📝 Manage Team" in assignment modal
3. **Add Members**: Type name and click "➕ Add"
4. **Remove Members**: Click ❌ next to member name
5. **Save Changes**: Click "Save Team" to persist changes

### Notes System
1. **Add Notes**: Click 📝 button on task card
2. **Edit Notes**: Modify text in modal dialog
3. **Save Notes**: Click "Save Notes" to store
4. **View Notes**: Notes preview appears in task card

### Export & Sync
**Export Options:**
- **Export All**: All tasks with current status
- **Export Completed**: Only finished tasks
- **Export Charts**: Analytics charts as PNG images

**Sync to Original:**
- Updates your source CSV files
- Adds completion status, assignments, notes
- ⚠️ **Warning**: This modifies your original files

### Analytics & Reporting
**Chart Types:**
- Doughnut charts for progress overview
- Bar charts for phase and team analysis
- Line charts for timeline tracking
- Time distribution visualization

**Export Charts:**
- Saves all charts as PNG images
- Includes project name and date
- Professional presentation quality

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F1` | Start guided tutorial |
| `Ctrl+H` | Start guided tutorial |
| `F5` | Refresh data from CSV files |
| `Ctrl+Q` | Quit application |

---

## Troubleshooting

### Common Issues

**"No tasks found" message:**
- Verify CSV files exist in `03-Project Management/` folder
- Check CSV file format and required columns
- Click 🔄 Refresh button to reload data

**App won't start:**
- Ensure Node.js is installed
- Run `npm install` in LaunchPad directory
- Check console for error messages

**Data not saving:**
- Ensure project folder is writable
- Check disk space availability
- Verify folder permissions

**Charts not displaying:**
- Switch to Analytics tab to trigger rendering
- Click "🔄 Refresh" button in Analytics tab
- Ensure Chart.js library loaded properly

### Getting Help

**Built-in Help:**
- Click **?** buttons next to features for contextual help
- Use **F1** to restart the guided tutorial
- Hover over buttons for tooltip information

**File Locations:**
- Progress data: `YourProject/.launchpad-progress.json`
- Original CSV files: `YourProject/03-Project Management/`
- Exported files: User-selected location

### Data Recovery

**If progress is lost:**
1. Check for `.launchpad-progress.json` in project folder
2. Restore from backup if available
3. Re-complete tasks (progress auto-saves)

**If CSV files are corrupted:**
1. Restore from version control or backup
2. Ensure proper CSV format and encoding
3. Verify required columns exist

---

## Tips for Best Results

### Project Organization
- Use consistent naming for phases and task types
- Keep task summaries concise but descriptive
- Regularly update CSV files with new tasks

### Team Collaboration
- Assign tasks to specific team members
- Use notes for detailed task instructions
- Export completed tasks for progress reports

### Time Management
- Start timers when beginning work
- Stop timers during breaks
- Review time reports to optimize workflow

### Data Management
- Export data regularly for backups
- Sync to original files for version control
- Use consistent date formats in CSV files

---

**Need more help?** Use the built-in tutorial system (`F1`) or click the help buttons (?) throughout the interface for contextual assistance.

*LaunchPad - Your Universal Project Management Solution* 🚀