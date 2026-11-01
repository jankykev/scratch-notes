# Scratch Notes

A lightweight, offline-first note-taking and CLI command manager built with vanilla JavaScript, IndexedDB, and the File System Access API.

## Features

- **Notes Management**: Create, edit, delete, and organize notes in folders
- **CLI Commands**: Store and search command snippets with categories and tags
- **Offline-First**: Full IndexedDB persistence with service worker for offline access
- **File System Access**: Export/import data, pick documents folder
- **Theming**: Dark, Light, and Sepia themes with customizable font size
- **Resizable Panels**: Drag to resize sidebar and detail panel
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+N for new note, Alt+1/2/3 for tabs
- **Markdown Support**: Live preview with GitHub-flavored markdown rendering

## What's New

### v1.0.0 (Current Release)

#### Major Fixes
- **All Notes counter** now accurately reflects total notes across all folders (was showing 3 instead of 0 on fresh load)
- **Folder creation** now properly appears in sidebar tree under "All Notes"
- **Note deletion** works correctly and updates UI immediately
- **Note duplication** (copy) functionality implemented
- **Resizable panels** - both sidebar and detail panel can be dragged to resize, with widths persisted to localStorage
- **Import/Export** buttons in sidebar now functional
- **CLI empty state** reduced in size when commands exist
- **Detail panel close button** (X) now properly closes instead of copying
- **Dedicated copy button** added to detail panel for CLI commands (next to Edit/Delete)
- **Documents folder picker** uses File System Access API (`showDirectoryPicker`)

#### New Features
- **Tab Navigation** - Visible tabs at top for Notes / CLI / Settings with icons
- **Modal Dialog System** - Rewritten to work reliably without Promise chain issues
- **Keyboard Shortcuts** - Ctrl+S saves new and existing notes, Ctrl+N creates new note
- **Resize Handles** - Draggable handles on sidebar and detail panel with localStorage persistence
- **Default Data** - 4 default folders (Personal, Work, Projects, Reference) and categorized CLI commands on first run

#### Improvements
- Cleaner modal dialogs with proper button selectors
- Better empty state handling
- Improved accessibility (ARIA labels, roles, keyboard navigation)
- Theme persistence across sessions

---

## Known Issues

### Bugs (Observed in Current Release)

1. **Copying a note doesn't work** - Duplicate button exists but copy functionality needs implementation
2. **After deleting a note, it doesn't remove from the note viewer in middle of screen** - Detail view persists deleted note until navigation
3. **After creating first note, the "No notes yet / Create your first note..." info and button should go away** - Empty state not hiding properly after note creation
4. **Settings > Open folder for documents says "Folder picker not supported in this browser"** - But it was working before; `showDirectoryPicker` may need permission handling
5. **Creating a folder doesn't show it on the left sidebar** - Folder should appear tree'd under "All Notes" with accurate counter
6. **All Notes counter should add up all folder notes accurately** - Count discrepancy between root and sum of folders
7. **Can't close the details panel** - Need a way to dismiss detail panel; should reappear when clicking new CLI command
8. **"No commands yet" panel isn't accurate** - There are pre-loaded commands; should say "No custom commands yet"
9. **Can't resize the "No commands yet" panel** - Resize handle missing on CLI empty state
10. **Details panel appears on Settings tab** - Should be completely hidden on Settings tab
11. **Notes detail panel lacks metadata area** - Should have area for tags, links, metadata
12. **Clicking a note doesn't default to bottom detail panel** - Should open at same height as CLI detail panel
13. **No maximize button for note editor** - Should expand editor to take more screen space

### Recommendations (Not Bugs - Enhancement Requests)

1. **ScratchNotes logo** - Add a simple, breathing animation to the logo in top right
2. **Font scale** - Increase base font size by 1.2x (buttons and text feel too small)
3. **Detail panel auto-resize** - Page should auto-resize/account for detail panel visibility changes
4. **Notes detail panel enhancements** - Add metadata, tags, links section
5. **Maximize button** - For note creation area to take up more screen

---

## Issue Tracker

This project uses a simple agent-oriented issue tracker in `ISSUES.md`. Issues are formatted for easy parsing by AI agents.

See [ISSUES.md](ISSUES.md) for the current issue list.

---

## Getting Started

```bash
# Serve locally (any static server)
npx http-server -p 8080 -c-1 .
# Or
python -m http.server 8080
```

Then open http://localhost:8080

### Requirements
- Modern browser with IndexedDB and File System Access API support
- HTTPS or localhost for File System Access API

---

## Project Structure

```
scratch-notes/
├── index.html      # Main HTML structure
├── app.js          # Main application logic
├── styles.css      # Complete design system
├── storage.js      # IndexedDB wrapper
├── cli-commands.js # Default CLI commands
├── sw.js           # Service worker
├── README.md       # This file
├── NOTES.md        # Handoff notes
├── ISSUES.md       # Issue tracker
└── test-app.js     # Playwright E2E tests
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save note |
| `Ctrl+N` | New note (in Notes view) |
| `Ctrl+B` | Bold (in editor) |
| `Ctrl+I` | Italic (in editor) |
| `Alt+1` | Notes tab |
| `Alt+2` | CLI tab |
| `Alt+3` | Settings tab |
| `Escape` | Close detail panel / modal |

---

## Data Storage

All data stored locally in IndexedDB:
- `folders` - Folder hierarchy
- `notes` - Note content and metadata
- `cliCommands` - CLI command snippets
- `settings` - User preferences

Export/Import via JSON file for backup/restore.

---

## License

MIT