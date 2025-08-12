# Project Structure Requirements

For any project to work with this Project Manager app, it must follow this folder structure:

```
Your Project Name/
├── 01-Planning Documents/
│   ├── Business Summary.md          # First line becomes project description
│   ├── High Level Plan.md
│   └── Milestones.md
├── 02-Implementation Guides/
│   ├── [Any implementation guides]
│   └── [Custom guides for your project]
└── 03-Project Management/
    ├── Task List.csv               # REQUIRED - Tasks with columns: UUID, Milestone Phase, Task Type, Summary
    └── Gantt Chart.csv            # REQUIRED - Timeline with columns: UUID, Task, Start Date, End Date, Duration, Plan Phase Type
```

## Required CSV Format

### Task List.csv
```csv
UUID,Milestone Phase,Task Type,Summary
1,Phase Name,Task Type,Task description here
2,Phase Name,Task Type,Another task description
```

### Gantt Chart.csv (pipe-separated)
```csv
UUID|Plan Phase Type|Task|Start Date|End Date|Duration|Plan Phase Type
G001|Foundation|Register business|2025-01-13|2025-01-20|7 days|Foundation
G002|Foundation|Open bank account|2025-01-20|2025-01-27|7 days|Foundation
```

## How to Use

1. **Create your project folder** with the above structure
2. **Open the Project Manager app**
3. **Click "Open Project"** or use File → Open Project Folder
4. **Select your project folder**
5. **The app loads your data automatically**

## Features Available for Any Project

- ✅ Task management with completion tracking
- ✅ Milestone timeline visualization  
- ✅ Gantt chart timeline view
- ✅ Progress statistics
- ✅ Revenue calculator (customizable rates)
- ✅ Phase-based organization
- ✅ Filtering by phase and task type

## Example Projects

This structure works for any type of project:
- Business launches
- Software development projects
- Event planning
- Personal goal tracking
- Academic research projects
- Home renovation projects

**The app is now completely generic and can manage any project that follows this structure!**