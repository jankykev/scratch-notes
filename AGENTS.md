# AGENTS.md - Scratch Notes Project

## Project Overview
Scratch Notes is a performant, local-first note-taking app with folder organization and CLI command reference. Runs entirely in the browser - no installation required. Built with vanilla JavaScript ES Modules, IndexedDB, and Service Workers.

## Architecture

### Core Files
| File | Purpose |
|------|---------|
| `app.js` | Main application - UI, state management, event handlers |
| `storage.js` | IndexedDB wrapper class - all persistence logic |
| `cli-commands.js` | Default CLI command reference data |
| `index.html` | Single-page app structure |
| `styles.css` | Design system and component styles |
| `sw.js` | Service worker for offline support |
| `manifest.json` | PWA manifest |

### State Management (`app.js`)
```javascript
const state = {
  currentView: 'notes',        // 'notes' | 'cli' | 'settings' | 'editor'
  currentFolderId: 'root',     // Active folder in notes view
  currentNoteId: null,         // Active note in editor
  folders: [],                 // All folders from IndexedDB
  notes: [],                   // All notes from IndexedDB
  cliCommands: [],             // All CLI commands from IndexedDB
  settings: {},                // User settings
  searchQuery: '',             // Notes search filter
  cliSearchQuery: '',          // CLI search filter
  cliCategoryFilter: 'all',    // CLI category filter
  sortBy: 'updatedAt',         // Notes sort field
  sortOrder: 'desc',           // Notes sort direction
  isPreviewMode: false,        // Editor preview toggle
  autoSaveTimer: null,         // Debounced auto-save
  detailSidebarOpen: false,    // Right detail panel state
  sidebarWidth: null,          // Persisted sidebar width
  detailWidth: null            // Persisted detail panel width
};
```

### Storage Layer (`storage.js`)
- **IndexedDB** with 5 stores: `folders`, `notes`, `cliCommands`, `settings`, `metadata`
- Singleton `storage` instance exported
- All operations return Promises
- Auto-initializes defaults on first run (root folder, 4 default folders, 100+ CLI commands, default settings)
- Debounced auto-save for note content changes
- Optional sync to Documents folder via File System Access API

### Key Functions
| Function | File | Purpose |
|----------|------|---------|
| `showView(viewName)` | app.js | Switch between notes/cli/settings/editor |
| `showEditor(noteId)` | app.js | Open editor for new or existing note |
| `renderNotes()` | app.js | Render note grid for current folder |
| `renderCliCommands()` | app.js | Render CLI command cards |
| `updateFolderTree()` | app.js | Render sidebar folder tree with counts |
| `loadData()` | app.js | Load all data from storage, re-render |
| `setupResizeHandles()` | app.js | Draggable resize handles with localStorage persistence |
| `confirmDialog()` / `promptDialog()` | app.js | Modal dialogs with Promise return |

## Known Issues (from ISSUES.md)
1. **ISSUE-001**: Copying a note doesn't work (duplicate button exists but handler incomplete)
2. **ISSUE-002**: Deleted note persists in detail viewer until navigation
3. **ISSUE-003**: Empty state doesn't hide after first note creation
4. **ISSUE-004**: Documents folder picker says "not supported" but was working
5. **ISSUE-005**: New folder doesn't appear in sidebar tree
6. **ISSUE-006**: All Notes counter inaccurate (doesn't match sum of folder counts)
7. **ISSUE-007**: Can't close detail panel (no working close button)
8. **ISSUE-008**: "No commands yet" text inaccurate (should say "No custom commands yet")
9. **ISSUE-009**: Can't resize CLI empty state panel (missing resize handle)
10. **ISSUE-010**: Detail panel shows on Settings tab (should be hidden)
11. **ISSUE-011**: Notes detail panel lacks metadata area (enhancement)
12. **ISSUE-012**: Note click doesn't open detail panel at correct height
13. **ISSUE-013**: No maximize button for note editor (enhancement)
14. **ISSUE-014**: ScratchNotes logo needs animation (enhancement)
15. **ISSUE-015**: Base font size too small (enhancement)
16. **ISSUE-016**: Detail panel auto-resize on visibility change (enhancement)

## Development Workflow

### Running the App
```bash
# Start local server (required for ES modules and File System Access API)
python -m http.server 53943
# Then open http://localhost:53943
```

### Running Tests
```bash
# Requires Playwright and server running on port 53943
node test-app.js
```

### Syntax Check
```bash
node --check app.js
node --check storage.js
node --check cli-commands.js
```

## Bug Fix Guidelines (MANDATORY)
1. **Smallest targeted fix** - Fix the root cause once in shared code, not symptoms
2. **Label bugfix attempts** - Add code comments: `// BUGFIX ATTEMPT: [issue description]`
3. **Update NOTES.md** - Document what was attempted, even if not verified
4. **Nothing is fixed until user tests** - User must specifically notify success
5. **Verification distinction** - "Automated tests pass" = my verification; "User tested and confirmed" = user verification (ONLY this counts for guideline #4). Never claim "user verified" unless human explicitly says "this works" or "verified".
6. **Don't guess or hallucinate** - Read the code, trace the logic, verify the fix
7. **Commit messages reflect reality** - Use "tests pass" or "verified via automated tests" NOT "user verified" unless human explicitly confirmed. After user confirms fix works, commit with official prefix (`fix:`, `ui:`, `data:`); in-progress work uses `wip:` prefix.

## UI Conventions
- **Tab navigation**: Alt+1 (Notes), Alt+2 (CLI), Alt+3 (Settings)
- **Resize handles**: Draggable on sidebar (right edge) and detail panel (left edge)
- **Detail sidebar**: Opens on CLI command click, should close on Settings tab
- **Empty states**: Notes view has large empty state; CLI view has smaller `.cli-empty-state`
- **Modal system**: `showModal()`, `confirmDialog()`, `promptDialog()` - all attach handlers synchronously

## CSS Custom Properties (Key)
```css
--sidebar-width: 280px;     /* Controlled by resize handle, persisted to localStorage */
--detail-width: 360px;      /* Controlled by resize handle, persisted to localStorage */
--font-size-base: 14px;     /* Controlled by settings, applied to html */
--header-height: 56px;
--toolbar-height: 44px;
```

## Testing Checklist for Bug Fixes
After any fix, verify:
- [ ] App loads without console errors
- [ ] Tab navigation works (Notes/CLI/Settings)
- [ ] Folder tree renders with correct counts
- [ ] Note CRUD operations work
- [ ] CLI commands display and filter correctly
- [ ] Settings persist and apply immediately
- [ ] Resize handles work and persist
- [ ] Detail sidebar opens/closes correctly
- [ ] Modals work (create folder, rename, delete confirmations)
- [ ] Import/Export functions

## File Change Patterns
- **Bug fixes (in-progress)**: Modify `app.js` or `storage.js` - commit as `wip: fix [issue description]`
- **Bug fixes (verified)**: After user confirms fix works - commit as `fix: [issue description]` (no `wip:` prefix)
- **UI tweaks (in-progress)**: Modify `styles.css` or `index.html` - commit as `wip: ui [description]`
- **UI tweaks (verified)**: After user confirms - commit as `ui: [description]` (no `wip:` prefix)
- **Data changes**: Modify `cli-commands.js` - commit as `wip: data [description]`
- **Never commit**: `node_modules/`, `package-lock.json`, build output, `AGENTS.md`, `CLAUDE.md`

## Commit Message Verification Tags (REQUIRED)
- `verified via automated tests` - Agent's Playwright/unit tests pass
- `user verified` - Human explicitly confirmed "this works" or "verified" (ONLY this enables `fix:`/`ui:`/`data:` prefix per guideline #4)
- Never use "user verified" based on agent tests alone

## Debugging Tips
- Check browser console for IndexedDB errors
- `storage.getStats()` in console shows current data counts
- `localStorage.getItem('sidebarWidth')` / `detailWidth` for resize persistence
- `state` object in console shows current app state
- Modal system uses polling (`setTimeout(checkResult, 50)`) - check for handler attachment issues

## Common Pitfalls
1. **ES Modules require HTTP server** - Won't work with `file://` protocol
2. **File System Access API requires HTTPS or localhost** - Won't work on HTTP
3. **IndexedDB is async** - All storage operations return Promises
4. **Modal handlers attach asynchronously** - Use `checkResult` polling pattern
5. **Resize handles created dynamically** - Must exist in DOM before `setupResizeHandles()` runs
6. **Detail sidebar state** - Hidden by `showView()`, shown by `showCliDetail()`

## Priority Order for Bug Fixes
1. **Core UX bugs** (001-006): Note operations, folder tree, counters
2. **Settings/CLI bugs** (007-010): Detail panel, empty states, folder picker
3. **Enhancements** (011-016): Metadata, maximize, animations, font scale