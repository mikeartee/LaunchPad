# LaunchPad User Manual
*Universal Project Management Native Windows Application*

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Core Features](#core-features)
4. [Advanced Features](#advanced-features)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation Options

**Option 1: Standalone Executable**
- Download `LaunchPad.exe`
- Double-click to run (no installation required)
- Portable - runs from any location

**Option 2: Windows Installer**
- Download `LaunchPad_0.1.0_x64-setup.exe`
- Run installer for full Windows integration
- Adds Start Menu shortcuts and uninstaller

**Option 3: Build from Source**
1. **Install Rust** (required for Tauri):
   ```bash
   winget install Rustlang.Rustup
   ```

2. **Install Node.js**:
   - Download from https://nodejs.org

3. **Clone and build**:
   ```bash
   git clone https://github.com/mikeartee/LaunchPad.git
   cd LaunchPad
   npm install
   npm run tauri:build
   ```

### First Launch
- **Native Windows App**: LaunchPad runs as a true Windows application
- **No Browser Required**: All functionality built into the native app
- **Fast Performance**: Rust-powered backend for optimal speed

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

**Gantt Chart.csv** - Required columns (pipe-separated `|`):
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

**Task Display:**
- ✅ Checkbox to mark complete/incomplete
- 📝 Phase and type information
- Task summary and details
- Progress tracking

**Task Management:**
- Mark tasks as complete/incomplete
- Filter by phase or task type
- View task statistics
- Track overall progress

### 🎯 Milestones Tab
**Visual timeline of major project milestones**
- Shows key business milestones
- Progress indicators
- Timeline visualization
- Milestone descriptions and phases

### 📊 Timeline Tab
**Gantt chart visualization**
- Project timeline view from CSV data
- Task dependencies and scheduling
- Phase-based organization
- Duration and date information
- Critical path visualization

### 📈 Analytics Tab
**Comprehensive project analytics**
- **Overall Progress**: Completion percentage circle
- **Tasks by Phase**: Phase-wise breakdown
- **Completion Trends**: Progress over time
- **Visual Charts**: Interactive progress displays

### 💵 Revenue Tab
**Revenue calculator and financial tracking**
- Set hourly rate and weekly hours
- Calculate weekly/monthly revenue
- Track progress toward financial targets
- Survival and expansion thresholds
- Business growth metrics

---

## Advanced Features

### CSV Data Import
**Automatic Data Loading:**
- Detects CSV files in project folder
- Supports both comma and pipe-separated formats
- Handles Task List and Gantt Chart files
- Real-time data processing and display

**Supported Formats:**
- Task List: Comma-separated values (CSV)
- Gantt Chart: Pipe-separated values (PSV)
- Automatic format detection
- Error handling for malformed data

### Progress Tracking
**Task Completion:**
- Click checkboxes to mark tasks complete
- Progress automatically calculated
- Visual progress indicators
- Phase-based completion tracking

**Analytics Dashboard:**
- Real-time progress charts
- Phase breakdown analysis
- Completion percentage tracking
- Visual progress indicators

### Sample Data
**Demo Mode:**
- Click "🔄 Load Sample Data" for demonstration
- Shows all features with example tasks
- Perfect for testing and learning
- No CSV files required

---

## Technology Stack

### Native Windows Application
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Rust (Tauri framework)
- **Performance**: Native speed and efficiency
- **Size**: ~13MB (vs 100MB+ Electron apps)

### Benefits of Tauri
- ✅ **Small file size** - Minimal disk footprint
- ✅ **Native performance** - Rust-powered backend
- ✅ **Better security** - Sandboxed execution
- ✅ **Lower memory usage** - No browser overhead
- ✅ **True Windows integration** - Native OS behavior

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Refresh data from CSV files |
| `Ctrl+Q` | Quit application |

---

## Troubleshooting

### Common Issues

**"No tasks found" message:**
- Verify CSV files exist in `03-Project Management/` folder
- Check CSV file format and required columns
- Use "🔄 Load Sample Data" to test functionality

**App won't start:**
- Ensure you have the correct executable
- Check Windows compatibility (64-bit required)
- Run as administrator if needed

**CSV files not loading:**
- Verify file names: `Task List.csv` and `Gantt Chart.csv`
- Check file format (CSV vs pipe-separated)
- Ensure files are not corrupted or locked

**Performance issues:**
- Close other applications to free memory
- Ensure adequate disk space
- Restart the application

### File Locations

**Executable Locations:**
- Standalone: `LaunchPad.exe` (portable)
- Installed: `%PROGRAMFILES%\LaunchPad\LaunchPad.exe`
- Development: `src-tauri\target\release\app.exe`

**Project Data:**
- CSV files: `YourProject/03-Project Management/`
- Task completion: Stored in memory (resets on restart)

### Getting Help

**Built-in Features:**
- Sample data for testing functionality
- Clear error messages for troubleshooting
- Intuitive interface design

**Development:**
- Source code: https://github.com/mikeartee/LaunchPad
- Issues: Report on GitHub repository
- Documentation: README.md and this manual

---

## Tips for Best Results

### Project Organization
- Use consistent naming for phases and task types
- Keep task summaries concise but descriptive
- Maintain proper CSV file structure

### CSV File Management
- Use UTF-8 encoding for CSV files
- Avoid special characters in file names
- Keep files in the required directory structure

### Performance Optimization
- Close unused applications
- Keep CSV files reasonably sized
- Restart app if performance degrades

### Data Management
- Backup CSV files regularly
- Use version control for project files
- Test with sample data before importing large datasets

---

**Need more help?** Check the GitHub repository at https://github.com/mikeartee/LaunchPad for additional documentation and support.

*LaunchPad - Your Universal Project Management Solution* 🚀