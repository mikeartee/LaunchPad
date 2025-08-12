# Contributing to LaunchPad

Thank you for your interest in contributing to LaunchPad! This document provides guidelines for contributing to this Tauri-based project management application.

## Development Setup

### Prerequisites
- **Rust** (latest stable version)
- **Node.js** (LTS version)
- **Git**

### Installation
```bash
# Install Rust
winget install Rustlang.Rustup

# Clone the repository
git clone https://github.com/mikeartee/LaunchPad.git
cd LaunchPad

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

## Project Structure

```
LaunchPad/
├── src/                    # Frontend (HTML/CSS/JS)
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── tutorial.js        # Tutorial system
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Tauri main process
│   │   └── lib.rs         # Library code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies
└── README.md              # Project documentation
```

## Development Commands

```bash
# Development mode (hot reload)
npm run tauri:dev

# Build production executable
npm run tauri:build

# Tauri CLI commands
npm run tauri info          # System info
npm run tauri deps          # Check dependencies
```

## Code Style Guidelines

### Frontend (HTML/CSS/JS)
- Use semantic HTML elements
- Follow BEM methodology for CSS classes
- Use modern JavaScript (ES6+)
- Keep functions small and focused
- Add comments for complex logic

### Backend (Rust)
- Follow Rust naming conventions
- Use `cargo fmt` for formatting
- Run `cargo clippy` for linting
- Add documentation for public functions
- Handle errors appropriately

### File Organization
- Keep related functionality together
- Use descriptive file and function names
- Separate concerns (UI, data, logic)
- Maintain consistent indentation (2 spaces)

## Feature Development

### Adding New Features
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Implement the feature with tests
3. Update documentation if needed
4. Test thoroughly on Windows
5. Submit a pull request

### CSV Processing
- Support both comma and pipe-separated formats
- Handle malformed data gracefully
- Provide clear error messages
- Test with various CSV structures

### UI Components
- Maintain consistent styling
- Ensure accessibility compliance
- Test responsive behavior
- Add appropriate ARIA labels

## Testing

### Manual Testing
- Test all tabs and features
- Verify CSV import functionality
- Check task completion tracking
- Test with various project structures
- Verify analytics calculations

### Cross-Platform Considerations
- Primary target: Windows 10/11
- Test with different screen resolutions
- Verify file path handling
- Check CSV encoding support

## Pull Request Process

### Before Submitting
1. **Test thoroughly** - Ensure all features work
2. **Check for personal data** - Remove any personal references
3. **Update documentation** - Keep README and manual current
4. **Follow commit conventions** - Use clear, descriptive messages

### PR Requirements
- [ ] Code builds successfully (`npm run tauri:build`)
- [ ] All features tested manually
- [ ] Documentation updated if needed
- [ ] No personal data or references
- [ ] Clear description of changes

### Commit Message Format
```
type: brief description

Longer description if needed
- Bullet points for multiple changes
- Reference issues: Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Security Considerations

### Tauri Security
- Follow Tauri security best practices
- Minimize API surface area
- Validate all user inputs
- Use secure file operations

### Data Handling
- Never store sensitive data
- Validate CSV file contents
- Handle file permissions properly
- Sanitize user inputs

## Release Process

### Version Numbering
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `package.json` and `Cargo.toml`
- Tag releases in Git

### Building Releases
```bash
# Build production version
npm run tauri:build

# Outputs:
# - src-tauri/target/release/app.exe (standalone)
# - src-tauri/target/release/bundle/nsis/*.exe (installer)
# - src-tauri/target/release/bundle/msi/*.msi (MSI package)
```

## Troubleshooting Development Issues

### Common Problems
- **Rust not found**: Ensure Rust is in PATH
- **Build failures**: Check Rust and Node.js versions
- **Hot reload issues**: Restart `tauri:dev`
- **Permission errors**: Run as administrator if needed

### Debug Mode
```bash
# Enable debug logging
RUST_LOG=debug npm run tauri:dev
```

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn
- Focus on the code, not the person

### Getting Help
- Check existing issues first
- Provide minimal reproduction cases
- Include system information
- Be patient and respectful

## Pre-Commit Checklist

Before pushing changes:

### 🔍 Remove Personal References
- [ ] No personal names or identifiers
- [ ] No specific business references
- [ ] Generic currency and locale settings
- [ ] Default rates and targets
- [ ] No development files (.vscode, .amazonq, etc.)

### ✅ Code Quality
- [ ] Code builds successfully
- [ ] All features tested
- [ ] Documentation updated
- [ ] Commit messages clear
- [ ] No sensitive data

### 📝 Final Verification
```bash
# Check for personal references
findstr /s /i "mike\|zoomed\|nz\|business.*plan" *

# Verify build
npm run tauri:build

# Check git status
git status
```

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Project Repository](https://github.com/mikeartee/LaunchPad)

---

**Thank you for contributing to LaunchPad!** 🚀

Your contributions help make this universal project management tool better for everyone.