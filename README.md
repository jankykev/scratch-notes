# Scratch Notes

A performant, local-first note-taking app with folder organization, auto-save, and a built-in CLI command reference. Runs entirely in your browser - no installation required.

![Scratch Notes](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## Features

### 📝 Notes & Folders
- **Hierarchical folders** - Organize notes in nested folders
- **Auto-save** - Changes saved automatically (configurable interval)
- **Markdown support** - Write with full Markdown syntax
- **Live preview** - Toggle between edit and preview modes
- **Search** - Filter notes by title or content
- **Sort options** - By date, title, or custom order
- **Keyboard shortcuts** - `Ctrl+S` to save, `Ctrl+N` for new note, `Ctrl+B/I` for formatting

### 💻 CLI Command Reference
- **Categorized commands** - PowerShell, CMD, Bash, Git, Docker, Node.js, Python
- **One-click copy** - Copy any command to clipboard instantly
- **Add your own** - Custom commands with tags and categories
- **Search & filter** - Find commands quickly
- **Detail view** - See full command with description on the side

### 🔧 Technical Features
- **Zero dependencies** - Pure vanilla JavaScript (ES Modules)
- **IndexedDB storage** - Fast, persistent local storage
- **PWA ready** - Install as app, works offline
- **Service Worker** - Caches assets for offline use
- **Auto-backup** - Optional sync to Documents folder
- **Import/Export** - Full JSON backup/restore
- **Responsive design** - Works on desktop and mobile
- **Dark/Light/Sepia themes** - Easy on the eyes
- **Accessible** - Keyboard navigation, ARIA labels, reduced motion support

## Quick Start

### Option 1: Double-click to run (Windows)
```bash
# Simply double-click run.bat or run.ps1
# Or run from command line:
./run.bat
# or
./run.ps1
```

### Option 2: Run with Python
```bash
python -m http.server 8765
# Then open http://localhost:8765
```

### Option 3: Run with Node.js
```bash
npx serve . -l 8765
```

### Option 4: Open directly (limited features)
Just double-click `index.html` - works but Service Worker and ES Modules won't function.

## Project Structure

```
scratch-notes/
├── index.html          # Main HTML entry point
├── styles.css          # Complete styling (dark/light/sepia themes)
├── app.js              # Main application logic
├── storage.js          # IndexedDB + file sync storage layer
├── cli-commands.js     # Built-in CLI command reference data
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for offline support
├── run.bat             # Windows batch launcher
├── run.ps1             # PowerShell launcher
└── README.md           # This file
```

## Usage Guide

### Notes

**Creating notes:**
- Click "New Note" button or press `Ctrl+N`
- Notes auto-save as you type (default: 2 seconds)
- Use the toolbar or Markdown shortcuts for formatting

**Organizing with folders:**
- Click "New Folder" in sidebar
- Drag notes between folders (via folder dropdown in editor)
- Nested folders supported
- "All Notes" shows everything regardless of folder

**Search & Sort:**
- Search box in toolbar filters notes in current folder
- Sort dropdown: Recently Updated, Oldest First, Title A-Z, etc.

### CLI Commands

**Browsing:**
- Click "CLI Commands" in navigation (or `Alt+2`)
- Filter by category using dropdown
- Search across all commands

**Using commands:**
- Click the copy button (📋) on any command block
- Click a command card to see details in sidebar
- Tags help categorize (e.g., `daily`, `search`, `admin`)

**Adding your own:**
- Click "Add Command" button
- Fill in name, category, description, command, and tags
- Your commands appear under "Custom" category

### Settings

Access via gear icon or `Alt+3`:

- **Auto-save interval** - 1s to 10s, or manual only
- **Sync to Documents** - Backup JSON to your Documents folder
- **Theme** - System, Dark, Light, or Sepia
- **Font size** - 13px to 18px
- **Compact mode** - Tighter spacing
- **Vim mode** - Experimental Vim keybindings in editor
- **Backup/Restore** - Export all data or import from backup

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New note |
| `Ctrl+S` | Save current note |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Alt+1` | Notes view |
| `Alt+2` | CLI Commands view |
| `Alt+3` | Settings view |
| `Escape` | Close sidebar/modal |

## Data Storage

### Where data lives:
1. **IndexedDB** (primary) - Browser's built-in database, persists across sessions
2. **Documents/ScratchNotes/** (optional) - JSON backup files

### Backup location:
```
Windows: %USERPROFILE%\Documents\ScratchNotes\
macOS/Linux: ~/Documents/ScratchNotes/
```

### Export format:
```json
{
  "version": 1,
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "folders": [...],
  "notes": [...],
  "cliCommands": [...],
  "settings": {...}
}
```

## Future-Proofing

This app is designed to last:

- **No build step** - Runs directly in any modern browser
- **ES Modules** - Native module system, no bundler needed
- **IndexedDB** - Standard browser API, not going anywhere
- **Service Worker** - Standard offline caching
- **PWA Manifest** - Installable on any platform
- **Vanilla JS** - No framework dependencies to rot
- **JSON export** - Your data is portable forever
- **File System Access API** - Ready for direct file sync when widely supported

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 80+ | Full support |
| Firefox | 75+ | Full support |
| Edge | 80+ | Full support |
| Safari | 14+ | Full support |
| Mobile Safari | 14+ | Full support |
| Chrome Android | 80+ | Full support |

Requires: IndexedDB, Service Workers, ES Modules, File System Access API (optional)

## Customization

### Adding CLI command categories:
Edit `cli-commands.js` and add to `cliCategories` array:
```javascript
{ id: 'mycategory', name: 'My Category', icon: '...', color: '#hex', description: '...' }
```

### Theming:
CSS custom properties in `styles.css`:
```css
:root {
  --accent: #7c5cff;
  --bg-primary: #0d0d12;
  /* ... */
}
```

### Adding editor toolbar buttons:
Add button to `index.html` with `data-format="yourFormat"`, then add case in `app.js` `applyFormat()`.

## Troubleshooting

**App won't load / white screen:**
- Must serve via HTTP(S), not `file://` protocol
- Use one of the run scripts or `python -m http.server`

**Service Worker not registering:**
- Requires HTTPS or localhost
- Check DevTools > Application > Service Workers

**Auto-save not working:**
- Check browser storage quota (DevTools > Application > Storage)
- Ensure IndexedDB not blocked by privacy settings

**Data lost?**
- Check Documents/ScratchNotes/ for auto-backups
- Browser DevTools > Application > IndexedDB > ScratchNotesDB

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

This is a personal productivity tool, but suggestions welcome! The code is intentionally simple and hackable.

---

**Built with ❤️ for developers who take too many notes**