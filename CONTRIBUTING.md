# Contributing to LaunchPad

## Pre-Commit Checklist

Before pushing any changes to the public repository, **ALWAYS** check for personalization:

### 🔍 Search for Personal References
```bash
# Search for common personal identifiers
findstr /s /i "mike\|zoomed\|nz\|business.*plan\|course" *
```

### ❌ Remove These Items
- [ ] Personal names (Mike, Mike RT, etc.)
- [ ] Specific business references (Zoomed In, Business Plan, etc.)
- [ ] Personal currency/locale (NZ$, en-NZ)
- [ ] Personal targets/rates (190, 4500, 7500)
- [ ] Course materials (.pdf, .bat files)
- [ ] Development files (.vscode, .amazonq, data/)
- [ ] Personal project paths

### ✅ Ensure Generic Defaults
- [ ] Default team member: "Team Member"
- [ ] Default currency: $ (USD)
- [ ] Default rates: $50/hr, 40hrs/week
- [ ] Default targets: $3,000/$5,000
- [ ] Generic locale: en-US

### 📝 Final Check
```bash
git status
# Ensure working tree is clean before push
```

**Remember: This is a public repository - keep it professional and generic!**