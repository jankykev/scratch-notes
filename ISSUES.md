# Issue Tracker - Scratch Notes

Agent-oriented issue tracker. Each issue is a structured entry for easy parsing.

Format:
```
### ISSUE-XXX: [Title]
- **Type**: bug|enhancement|feature
- **Priority**: high|medium|low
- **Status**: open|in-progress|done
- **Component**: notes|cli|settings|ui|storage|modal|resize
- **Description**: ...
- **Acceptance Criteria**: ...
- **Notes**: ...
```

---

### ISSUE-001: Copying a note doesn't work
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: notes
- **Description**: Duplicate button exists in note card but copy functionality not implemented
- **Acceptance Criteria**: Clicking duplicate creates a copy of the note with "Copy of " prefix, appears in same folder, All Notes count increments
- **Notes**: Button has `data-action="duplicate"` in note card template

---

### ISSUE-002: Deleted note persists in detail viewer
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: notes
- **Description**: After deleting a note, the detail view in middle of screen still shows the deleted note until navigation
- **Acceptance Criteria**: Delete note → detail view clears/hides → shows empty state or next note
- **Notes**: `delete-note-btn` handler calls `showView('notes')` but detail panel may not update

---

### ISSUE-003: Empty state doesn't hide after first note creation
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: notes
- **Description**: "No notes yet / Create your first note..." message and button remain visible after creating first note
- **Acceptance Criteria**: Create first note → empty state hidden → note grid shows note
- **Notes**: Check `renderNotes()` empty state logic

---

### ISSUE-004: Documents folder picker says "not supported" but was working
- **Type**: bug
- **Priority**: medium
- **Status**: open
- **Component**: settings
- **Description**: Settings > Open folder for documents shows fallback message, but File System Access API was working before
- **Acceptance Criteria**: Click "Open Documents" → `showDirectoryPicker()` opens native picker → path saved to settings
- **Notes**: Check browser permissions, HTTPS requirement, user gesture requirement

---

### ISSUE-005: New folder doesn't appear in sidebar tree
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: notes
- **Description**: Creating a folder doesn't show it in the left sidebar under "All Notes"
- **Acceptance Criteria**: Create folder → folder appears in tree under All Notes → clickable → shows notes in that folder
- **Notes**: Folder counter should also update accurately

---

### ISSUE-006: All Notes counter inaccurate
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: notes
- **Description**: All Notes count doesn't equal sum of individual folder counts
- **Acceptance Criteria**: All Notes count === sum of all folder counts (including root)
- **Notes**: Check `renderFolderTree()` counting logic

---

### ISSUE-007: Can't close detail panel
- **Type**: bug
- **Priority**: high
- **Status**: open
- **Component**: ui
- **Description**: No way to dismiss the detail panel; should close and reappear on new CLI command click
- **Acceptance Criteria**: Close button (X) hides detail panel → clicking CLI command reopens it → layout adjusts
- **Notes**: `#close-detail` exists but may not work properly

---

### ISSUE-008: "No commands yet" text inaccurate
- **Type**: bug
- **Priority**: medium
- **Status**: open
- **Component**: cli
- **Description**: CLI empty state says "No commands yet" but there are pre-loaded default commands
- **Acceptance Criteria**: Text changed to "No custom commands yet" or similar
- **Notes**: Check `renderCliCommands()` empty state logic

---

### ISSUE-009: Can't resize CLI empty state panel
- **Type**: bug
- **Priority**: low
- **Status**: open
- **Component**: resize
- **Description**: Resize handle missing on "No commands yet" panel
- **Acceptance Criteria**: Resize handle appears on CLI view empty state
- **Notes**: May need conditional render in `renderCliCommands()`

---

### ISSUE-010: Detail panel shows on Settings tab
- **Type**: bug
- **Priority**: medium
- **Status**: open
- **Component**: ui
- **Description**: Detail panel (bottom left) appears on Settings tab but should be completely hidden
- **Acceptance Criteria**: Switch to Settings → detail panel hidden → switch to Notes/CLI → detail panel shows appropriately
- **Notes**: Check `showView('settings')` logic

---

### ISSUE-011: Notes detail panel lacks metadata area
- **Type**: enhancement
- **Priority**: medium
- **Status**: open
- **Component**: notes
- **Description**: Notes detail panel should have area for tags, links, metadata (like CLI detail panel)
- **Acceptance Criteria**: Click note → detail panel shows title, folder, created/modified dates, tags, links
- **Notes**: Design similar to CLI detail panel

---

### ISSUE-012: Note click doesn't open detail panel at correct height
- **Type**: bug
- **Priority**: medium
- **Status**: open
- **Component**: notes
- **Description**: Clicking a note should open detail panel at same height/position as CLI detail panel (bottom left)
- **Acceptance Criteria**: Note click → detail panel opens bottom-left, same dimensions as CLI detail
- **Notes**: May need shared detail panel component

---

### ISSUE-013: No maximize button for note editor
- **Type**: enhancement
- **Priority**: low
- **Status**: open
- **Component**: notes
- **Description**: Add maximize button to expand note editor to take more screen space
- **Acceptance Criteria**: Maximize button in editor toolbar → expands editor to full width/height → restore button returns
- **Notes**: Could toggle a CSS class on main container

---

### ISSUE-014: ScratchNotes logo needs animation
- **Type**: enhancement
- **Priority**: low
- **Status**: open
- **Component**: ui
- **Description**: Logo in top right is static; add simple breathing animation
- **Acceptance Criteria**: Logo has subtle pulse/breathe animation (CSS keyframes)
- **Notes**: Keep it simple and tasteful

---

### ISSUE-015: Base font size too small
- **Type**: enhancement
- **Priority**: medium
- **Status**: open
- **Component**: ui
- **Description**: Buttons and text feel too small; increase base font scale by 1.2x
- **Acceptance Criteria**: `--font-size-base` increased by 1.2x (e.g., 14px → 16.8px) → all text scales proportionally
- **Notes**: Check rem-based scaling in CSS

---

### ISSUE-016: Detail panel auto-resize on visibility change
- **Type**: enhancement
- **Priority**: low
- **Status**: open
- **Component**: resize
- **Description**: Page should auto-resize/account for detail panel visibility changes
- **Acceptance Criteria**: Detail panel open/close → main content area smoothly adjusts → no layout shift
- **Notes**: CSS Grid/Flexbox should handle this automatically

---

## Parsing Notes for Agents

To parse this file programmatically:
1. Split by `### ISSUE-` 
2. Extract fields using regex for each `- **Field**: value` line
3. Description and Acceptance Criteria may span multiple lines
4. Status values: open, in-progress, done
5. Priority values: high, medium, low
6. Type values: bug, enhancement, feature

Example parser (JavaScript):
```javascript
const issues = content
  .split('### ISSUE-')
  .slice(1)
  .map(block => {
    const lines = block.trim().split('\n');
    const id = lines[0].split(':')[0];
    const title = lines[0].split(':')[1].trim();
    const fields = {};
    let currentField = null;
    for (const line of lines.slice(1)) {
      const match = line.match(/-\s*\*\*(\w+)\*\*:\s*(.*)/);
      if (match) {
        currentField = match[1].toLowerCase();
        fields[currentField] = match[2];
      } else if (currentField && line.trim()) {
        fields[currentField] += '\n' + line.trim();
      }
    }
    return { id, title, ...fields };
  });
```