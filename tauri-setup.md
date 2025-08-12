# Tauri Setup for LaunchPad

## Install Tauri (Alternative to Electron)

1. **Install Rust:**
   ```bash
   # Download from https://rustup.rs/
   # Or use winget:
   winget install Rustlang.Rustup
   ```

2. **Install Tauri CLI:**
   ```bash
   npm install -g @tauri-apps/cli
   ```

3. **Initialize Tauri:**
   ```bash
   cd "C:\Users\Mike RT\Desktop\LaunchPad"
   npm install @tauri-apps/api
   tauri init
   ```

4. **Configure for web version:**
   - Set dist folder to current directory
   - Set dev command to serve web-version.html
   - Build creates native Windows .exe

5. **Build Windows app:**
   ```bash
   tauri build
   ```

**Benefits:**
- ✅ Much smaller than Electron (~10MB vs 100MB+)
- ✅ Better performance
- ✅ Native Windows integration
- ✅ Uses your existing web code