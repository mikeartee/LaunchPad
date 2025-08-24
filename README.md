# LaunchPad - Universal Project Manager

A native Windows desktop application built with Tauri for managing any structured project.

I created this because I didn't want to pay for software and needed something custom for my Project Management Course at TWOA.

## Features

- 📋 **Task Management** - Import and track project tasks from CSV files
- 🎯 **Milestone Tracking** - Visual timeline of key business milestones  
- 📊 **Timeline View** - Gantt chart visualization of project dependencies
- 💰 **Revenue Calculator** - Calculate hourly rates and monthly targets
- 🔄 **CSV Import** - Automatically loads data from your CSV files
- ✅ **Progress Tracking** - Mark tasks complete and see overall progress
- 📈 **Analytics** - Progress charts and phase breakdown

## Installation

### Option 1: Download Executable
- Download `LaunchPad.exe` and run directly (no installation required)

### Option 2: Use Installer
- Download `LaunchPad_0.1.0_x64-setup.exe` for full Windows installation

### Option 3: Build from Source
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

## Usage

### First Launch
1. Click "📁 Open Project" to choose your project folder
2. Your project should have this structure:
   ```
   YourProject/
   ├── 01-Planning Documents/
   │   └── Business Summary.md
   └── 03-Project Management/
       ├── Task List.csv
       └── Gantt Chart.csv
   ```

### Features Overview

**📋 Tasks Tab:**
- Import tasks from CSV files
- Filter by phase or task type
- Check off completed tasks
- See progress statistics

**🎯 Milestones Tab:**
- Visual timeline of major project milestones
- Track progress through project phases

**📊 Timeline Tab:**
- Gantt chart view of project dependencies
- Task scheduling and duration visualization

**📈 Analytics Tab:**
- Overall progress tracking
- Tasks breakdown by phase
- Completion trends

**💵 Revenue Tab:**
- Calculate weekly/monthly revenue based on hourly rate
- Track progress toward financial targets
- Monitor business growth metrics

## File Structure
```
LaunchPad/
├── src/
│   ├── index.html      # Main UI
│   ├── styles.css      # Styling
│   └── tutorial.js     # Tutorial system
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs     # Tauri main process
│   │   └── lib.rs      # Library code
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
└── package.json        # Node.js dependencies
```

## Development

**Development mode:**
```bash
npm run tauri:dev
```

**Build production:**
```bash
npm run tauri:build
```

**Available commands:**
- `npm run tauri:dev` - Run in development mode
- `npm run tauri:build` - Build production executable and installers

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Rust (Tauri)
- **Build System**: Tauri CLI
- **Package Manager**: npm

## Benefits of Tauri

- ✅ **Small file size** (~13MB vs 100MB+ Electron)
- ✅ **Native performance** - Rust-powered backend
- ✅ **Better security** - Sandboxed execution
- ✅ **Lower memory usage** - No Chromium overhead
- ✅ **Native OS integration** - True Windows app behavior

## CSV File Format

**Task List.csv** should contain columns like:
- UUID, Phase, Type, Summary, Description

**Gantt Chart.csv** should contain columns like:
- UUID, Task, Plan Phase Type, Start Date, End Date, Duration

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Your universal project management app for any structured project!**
