/**
 * Scratch Notes - Main Application
 * A performant, local-first note-taking app with folder organization and CLI command reference
 */

import { storage } from './storage.js';
import { defaultCliCommands, cliCategories, categoryIcons } from './cli-commands.js';

// ============================================================================
// State Management
// ============================================================================

const state = {
  currentView: 'notes',
  currentFolderId: 'root',
  currentNoteId: null,
  folders: [],
  notes: [],
  cliCommands: [],
  settings: {},
  searchQuery: '',
  cliSearchQuery: '',
  cliCategoryFilter: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  isPreviewMode: false,
  autoSaveTimer: null,
  detailSidebarOpen: false,
  // Resize state
  sidebarWidth: null,
  detailWidth: null
};

// ============================================================================
// DOM Elements Cache
// ============================================================================

const elements = {};

// ============================================================================
// Resize Handles
// ============================================================================

function setupResizeHandles() {
  // Load saved widths from localStorage
  const savedSidebarWidth = localStorage.getItem('sidebarWidth');
  const savedDetailWidth = localStorage.getItem('detailWidth');

  if (savedSidebarWidth) {
    state.sidebarWidth = parseInt(savedSidebarWidth, 10);
    document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`);
  }

  if (savedDetailWidth) {
    state.detailWidth = parseInt(savedDetailWidth, 10);
    document.documentElement.style.setProperty('--detail-width', `${state.detailWidth}px`);
  }

  // Sidebar resize handle
  const sidebarHandle = document.createElement('div');
  sidebarHandle.className = 'resize-handle resize-handle-sidebar';
  sidebarHandle.setAttribute('role', 'separator');
  sidebarHandle.setAttribute('aria-label', 'Resize sidebar');
  sidebarHandle.setAttribute('tabindex', '0');
  document.getElementById('sidebar').appendChild(sidebarHandle);

  // Detail sidebar resize handle
  const detailHandle = document.createElement('div');
  detailHandle.className = 'resize-handle resize-handle-detail';
  detailHandle.setAttribute('role', 'separator');
  detailHandle.setAttribute('aria-label', 'Resize detail panel');
  detailHandle.setAttribute('tabindex', '0');
  document.getElementById('detail-sidebar').appendChild(detailHandle);

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  let currentHandle = null;

  function startResize(e, handle, isSidebar) {
    isResizing = true;
    currentHandle = handle;
    startX = e.clientX;
    startWidth = isSidebar ? state.sidebarWidth || 280 : state.detailWidth || 360;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    handle.classList.add('resizing');

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    e.preventDefault();
    e.stopPropagation();
  }

  function onMouseMove(e) {
    if (!isResizing || !currentHandle) return;

    const deltaX = e.clientX - startX;
    const isSidebar = currentHandle.classList.contains('resize-handle-sidebar');

    if (isSidebar) {
      const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
      state.sidebarWidth = newWidth;
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    } else {
      const newWidth = Math.max(250, Math.min(600, startWidth - deltaX));
      state.detailWidth = newWidth;
      document.documentElement.style.setProperty('--detail-width', `${newWidth}px`);
    }
  }

  function onMouseUp() {
    if (!isResizing) return;

    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (currentHandle) {
      currentHandle.classList.remove('resizing');
    }

    // Save to localStorage
    if (state.sidebarWidth) {
      localStorage.setItem('sidebarWidth', state.sidebarWidth.toString());
    }
    if (state.detailWidth) {
      localStorage.setItem('detailWidth', state.detailWidth.toString());
    }

    currentHandle = null;

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && isResizing) {
      onMouseUp();
    }
  }

  // Mouse events
  sidebarHandle.addEventListener('mousedown', (e) => startResize(e, sidebarHandle, true));
  detailHandle.addEventListener('mousedown', (e) => startResize(e, detailHandle, false));

  // Keyboard support for accessibility
  sidebarHandle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Start keyboard resize mode
      sidebarHandle.classList.add('keyboard-resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleKeydown = (ke) => {
        if (ke.key === 'ArrowRight') {
          const newWidth = Math.min(500, (state.sidebarWidth || 280) + 10);
          state.sidebarWidth = newWidth;
          document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        } else if (ke.key === 'ArrowLeft') {
          const newWidth = Math.max(200, (state.sidebarWidth || 280) - 10);
          state.sidebarWidth = newWidth;
          document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        } else if (ke.key === 'Enter' || ke.key === ' ' || ke.key === 'Escape') {
          ke.preventDefault();
          sidebarHandle.classList.remove('keyboard-resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          if (state.sidebarWidth) {
            localStorage.setItem('sidebarWidth', state.sidebarWidth.toString());
          }
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
    }
  });

  detailHandle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      detailHandle.classList.add('keyboard-resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleKeydown = (ke) => {
        if (ke.key === 'ArrowLeft') {
          const newWidth = Math.min(600, (state.detailWidth || 360) + 10);
          state.detailWidth = newWidth;
          document.documentElement.style.setProperty('--detail-width', `${newWidth}px`);
        } else if (ke.key === 'ArrowRight') {
          const newWidth = Math.max(250, (state.detailWidth || 360) - 10);
          state.detailWidth = newWidth;
          document.documentElement.style.setProperty('--detail-width', `${newWidth}px`);
        } else if (ke.key === 'Enter' || ke.key === ' ' || ke.key === 'Escape') {
          ke.preventDefault();
          detailHandle.classList.remove('keyboard-resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          if (state.detailWidth) {
            localStorage.setItem('detailWidth', state.detailWidth.toString());
          }
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
    }
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function showToast(message, type = 'info', duration = 3000) {
  const container = $('#toast-container');
  const toast = createElement(`
    <div class="toast ${type}">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : ''}
        ${type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' : ''}
        ${type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' : ''}
        ${type === 'info' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>' : ''}
      </svg>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Dismiss">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `);

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.2s ease reverse';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// ============================================================================
// Modal System
// ============================================================================

function showModal(title, bodyHtml, footerHtml = '') {
  const overlay = $('#modal-overlay');
  const modal = overlay.querySelector('.modal');

  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHtml;
  $('#modal-footer').innerHTML = footerHtml;

  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');

  $('#modal-close').onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  // Focus first focusable element
  setTimeout(() => {
    const focusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }, 50);
}

function confirmDialog(title, message) {
  return new Promise((resolve) => {
    showModal(title, `<p>${escapeHtml(message)}</p>`, `
      <button class="btn btn-secondary" data-result="cancel">Cancel</button>
      <button class="btn btn-danger" data-result="confirm">Confirm</button>
    `);

    const checkResult = () => {
      const confirmBtn = $('#modal-footer button[data-result="confirm"]');
      const cancelBtn = $('#modal-footer button[data-result="cancel"]');
      if (confirmBtn && cancelBtn) {
        confirmBtn.onclick = () => {
          resolve(true);
          closeModal();
        };
        cancelBtn.onclick = () => {
          resolve(false);
          closeModal();
        };
      } else {
        setTimeout(checkResult, 50);
      }
    };
    checkResult();
  });
}

function promptDialog(title, label, defaultValue = '', type = 'text') {
  return new Promise((resolve) => {
    showModal(title, `
      <div class="form-group">
        <label>${escapeHtml(label)}</label>
        <input type="${type}" id="prompt-input" value="${escapeHtml(defaultValue)}" autofocus>
      </div>
    `, `
      <button class="btn btn-secondary" data-result="cancel">Cancel</button>
      <button class="btn btn-primary" data-result="ok">OK</button>
    `);

    const input = $('#prompt-input');
    const checkResult = () => {
      const okBtn = $('#modal-footer button[data-result="ok"]');
      const cancelBtn = $('#modal-footer button[data-result="cancel"]');
      if (okBtn && cancelBtn) {
        okBtn.onclick = () => {
          resolve(input.value);
          closeModal();
        };
        cancelBtn.onclick = () => {
          resolve(null);
          closeModal();
        };
      } else {
        setTimeout(checkResult, 50);
      }
    };
    checkResult();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('#modal-footer button[data-result="ok"]').click();
      }
    });
  });
}

function closeModal() {
  const overlay = $('#modal-overlay');
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
}

// ============================================================================
// Markdown Rendering (Simple, Fast)
// ============================================================================

function renderMarkdown(text) {
  if (!text) return '';

  // Escape HTML first
  let html = escapeHtml(text);

  // Code blocks (before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Lists
  html = html.replace(/^\- \[ \] (.*$)/gm, '<li><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^\- \[x\] (.*$)/gm, '<li><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  // Wrap consecutive list items
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    if (match.includes('<input type="checkbox"')) {
      return `<ul class="task-list">${match}</ul>`;
    }
    return `<ul>${match}</ul>`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (simple approach)
  html = html.replace(/^(?!<[hupolb])(.*?)$/gm, (match, line) => {
    if (!line.trim()) return '';
    if (line.startsWith('<')) return match;
    return `<p>${line}</p>`;
  });

  return html;
}

// ============================================================================
// Editor Formatting
// ============================================================================

function applyFormat(textarea, format) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let replacement = '';
  let newCursorPos = start;

  const formats = {
    bold: { prefix: '**', suffix: '**' },
    italic: { prefix: '*', suffix: '*' },
    strikethrough: { prefix: '~~', suffix: '~~' },
    code: { prefix: '`', suffix: '`' },
    heading1: { prefix: '# ', suffix: '' },
    heading2: { prefix: '## ', suffix: '' },
    heading3: { prefix: '### ', suffix: '' },
    bulletList: { prefix: '- ', suffix: '' },
    orderedList: { prefix: '1. ', suffix: '' },
    taskList: { prefix: '- [ ] ', suffix: '' },
    blockquote: { prefix: '> ', suffix: '' },
    codeBlock: { prefix: '```\n', suffix: '\n```' },
    horizontalRule: { prefix: '\n---\n', suffix: '' }
  };

  const fmt = formats[format];
  if (fmt) {
    if (selectedText) {
      replacement = fmt.prefix + selectedText + fmt.suffix;
    } else {
      replacement = fmt.prefix + fmt.suffix;
      newCursorPos = start + fmt.prefix.length;
    }

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    textarea.focus();
    updateWordCount();
    updatePreview();
  }
}

// ============================================================================
// View Management
// ============================================================================

function showView(viewName) {
  state.currentView = viewName;
  $$('.view').forEach(v => v.hidden = true);
  $(`#${viewName}-view`).hidden = false;

  // Update navigation
  $$('.sidebar .folder-item.active').forEach(el => el.classList.remove('active'));
  if (viewName === 'notes') {
    $(`[data-folder-id="${state.currentFolderId}"]`)?.classList.add('active');
  }

  // Update tab buttons
  $$('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
    btn.setAttribute('aria-selected', btn.dataset.view === viewName);
  });

  // Close detail sidebar
  $('#detail-sidebar').hidden = true;
  $('#detail-sidebar').classList.remove('open');
  $('#app').classList.remove('has-detail');

  // Load view-specific data
  switch (viewName) {
    case 'notes':
      renderNotes();
      break;
    case 'cli':
      renderCliCommands();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

function showEditor(noteId = null) {
  state.currentNoteId = noteId;
  showView('editor');

  const titleInput = $('#note-title');
  const contentArea = $('#note-content');
  const folderSelect = $('#note-folder');
  const previewToggle = $('#preview-toggle');

  // Populate folder select
  folderSelect.innerHTML = '<option value="root">All Notes</option>';
  state.folders.filter(f => f.id !== 'root').forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    folderSelect.appendChild(option);
  });

  if (noteId) {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
      titleInput.value = note.title;
      contentArea.value = note.content;
      folderSelect.value = note.folderId || 'root';
      updateWordCount();
      updatePreview();
      previewToggle.checked = state.isPreviewMode;
      $('#note-preview').hidden = !state.isPreviewMode;
      contentArea.hidden = state.isPreviewMode;
    }
  } else {
    titleInput.value = '';
    contentArea.value = '';
    folderSelect.value = state.currentFolderId === 'root' ? 'root' : state.currentFolderId;
    updateWordCount();
    updatePreview();
    previewToggle.checked = false;
    $('#note-preview').hidden = true;
    contentArea.hidden = false;
  }

  titleInput.focus();
}

function updateWordCount() {
  const content = $('#note-content').value;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  $('#word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;
  $('#char-count').textContent = `${chars} char${chars !== 1 ? 's' : ''}`;
}

function updatePreview() {
  if (!state.isPreviewMode) return;
  const content = $('#note-content').value;
  $('#note-preview').innerHTML = renderMarkdown(content);
}

function togglePreview() {
  state.isPreviewMode = $('#preview-toggle').checked;
  $('#note-preview').hidden = !state.isPreviewMode;
  $('#note-content').hidden = state.isPreviewMode;
  if (state.isPreviewMode) updatePreview();
}

// ============================================================================
// Folder Tree Rendering
// ============================================================================

function renderFolderTree(folders = state.folders, parentId = 'root', level = 0) {
  const childFolders = folders.filter(f => f.parentId === parentId);
  if (childFolders.length === 0) return '';

  return `
    <ul class="folder-children${level === 0 ? '' : ' nested'}" role="group">
      ${childFolders.map(folder => `
        <li class="folder-item${getFolderChildren(folders, folder.id).length > 0 ? ' has-children' : ''}" data-folder-id="${folder.id}">
          <div class="folder-header" role="treeitem" aria-expanded="false" tabindex="0">
            ${getFolderChildren(folders, folder.id).length > 0 ? `
              <button class="folder-toggle" aria-label="Toggle folder">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            ` : '<span class="folder-toggle"></span>'}
            <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="folder-name">${escapeHtml(folder.name)}</span>
            <span class="folder-count">${countNotesInFolder(folder.id, folders)}</span>
            <div class="folder-actions">
              <button class="folder-action-btn" data-action="rename" aria-label="Rename folder">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="folder-action-btn danger" data-action="delete" aria-label="Delete folder">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          ${renderFolderTree(folders, folder.id, level + 1)}
        </li>
      `).join('')}
    </ul>
  `;
}

function getFolderChildren(folders, parentId) {
  return folders.filter(f => f.parentId === parentId);
}

function countNotesInFolder(folderId, folders) {
  let count = state.notes.filter(n => n.folderId === folderId).length;
  const children = getFolderChildren(folders, folderId);
  for (const child of children) {
    count += countNotesInFolder(child.id, folders);
  }
  return count;
}

function updateFolderTree() {
  const tree = $('#folder-tree');
  tree.innerHTML = `
    <li class="folder-item" data-folder-id="root">
      <div class="folder-header" role="treeitem" tabindex="0">
        <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="folder-name">All Notes</span>
        <span class="folder-count">${state.notes.length}</span>
      </div>
    </li>
    ${renderFolderTree()}
  `;

  // Highlight current folder
  $$('.folder-item').forEach(item => {
    if (item.dataset.folderId === state.currentFolderId) {
      item.classList.add('active');
    }
  });

  attachFolderListeners();
}

function attachFolderListeners() {
  // Folder click
  $$('.folder-header').forEach(header => {
    header.onclick = (e) => {
      if (e.target.closest('.folder-action-btn') || e.target.closest('.folder-toggle')) return;
      const folderId = header.closest('.folder-item').dataset.folderId;
      if (folderId) {
        state.currentFolderId = folderId;
        showView('notes');
      }
    };

    header.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    };
  });

  // Folder toggle
  $$('.folder-toggle').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const item = btn.closest('.folder-item');
      item.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', item.classList.contains('expanded'));
    };
  });

  // Folder actions
  $$('.folder-action-btn[data-action="rename"]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const item = btn.closest('.folder-item');
      const folderId = item.dataset.folderId;
      if (folderId === 'root') return;

      const folder = state.folders.find(f => f.id === folderId);
      const newName = await promptDialog('Rename Folder', 'Folder name', folder.name);
      if (newName && newName !== folder.name) {
        await storage.updateFolder(folderId, { name: newName });
        await loadData();
      }
    };
  });

  $$('.folder-action-btn[data-action="delete"]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const item = btn.closest('.folder-item');
      const folderId = item.dataset.folderId;
      if (folderId === 'root') return;

      const folder = state.folders.find(f => f.id === folderId);
      const noteCount = countNotesInFolder(folderId, state.folders);
      const childCount = getFolderChildren(state.folders, folderId).length;

      let message = `Delete folder "${folder.name}"?`;
      if (noteCount > 0 || childCount > 0) {
        message += ` This will also move ${noteCount} note${noteCount !== 1 ? 's' : ''} and ${childCount} subfolder${childCount !== 1 ? 's' : ''} to the parent folder.`;
      }

      if (await confirmDialog('Delete Folder', message)) {
        await storage.deleteFolder(folderId, false);
        if (state.currentFolderId === folderId) {
          state.currentFolderId = 'root';
        }
        await loadData();
        showToast('Folder deleted', 'success');
      }
    };
  });
}

// ============================================================================
// Notes Rendering
// ============================================================================

function renderNotes() {
  const grid = $('#notes-grid');
  const emptyState = $('#empty-state');

  let notes = state.notes.filter(n => n.folderId === state.currentFolderId);

  // Apply search
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  notes = storage.sortNotes(notes, state.sortBy, state.sortOrder);

  if (notes.length === 0) {
    grid.hidden = true;
    emptyState.hidden = false;
    updateBreadcrumb();
    return;
  }

  grid.hidden = false;
  emptyState.hidden = true;

  grid.innerHTML = notes.map(note => `
    <article class="note-card" data-note-id="${note.id}" role="listitem" tabindex="0">
      <div class="note-card-header">
        <h3 class="note-title">${escapeHtml(note.title || 'Untitled')}</h3>
        <div class="note-card-actions">
          <button class="note-action-btn" data-action="duplicate" aria-label="Duplicate note">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="note-action-btn danger" data-action="delete" aria-label="Delete note">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="note-preview">${escapeHtml((note.content || '').substring(0, 200))}${note.content.length > 200 ? '...' : ''}</div>
      <div class="note-meta">
        <span class="note-folder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          ${getFolderName(note.folderId)}
        </span>
        <span class="note-date">${formatDate(note.updatedAt)}</span>
      </div>
    </article>
  `).join('');

  // Attach listeners
  $$('.note-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.note-action-btn')) return;
      showEditor(card.dataset.noteId);
    };

    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    };
  });

  $$('.note-action-btn[data-action="duplicate"]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const noteId = btn.closest('.note-card').dataset.noteId;
      const note = state.notes.find(n => n.id === noteId);
      if (note) {
        const newNote = await storage.createNote(note.folderId, `${note.title} (Copy)`, note.content);
        await loadData();
        showEditor(newNote.id);
        showToast('Note duplicated', 'success');
      }
    };
  });

  $$('.note-action-btn[data-action="delete"]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const noteId = btn.closest('.note-card').dataset.noteId;
      if (await confirmDialog('Delete Note', 'Are you sure you want to delete this note?')) {
        await storage.deleteNote(noteId);
        await loadData();
        showToast('Note deleted', 'success');
      }
    };
  });

  updateBreadcrumb();
}

function getFolderName(folderId) {
  if (folderId === 'root') return 'All Notes';
  const folder = state.folders.find(f => f.id === folderId);
  return folder ? folder.name : 'Unknown';
}

function updateBreadcrumb() {
  const breadcrumb = $('#breadcrumb');
  let html = '<span class="breadcrumb-item" data-folder-id="root">All Notes</span>';

  if (state.currentFolderId !== 'root') {
    const path = getFolderPath(state.currentFolderId);
    path.forEach((folder, i) => {
      html += `<span class="breadcrumb-separator">/</span>`;
      html += `<span class="breadcrumb-item" data-folder-id="${folder.id}">${escapeHtml(folder.name)}</span>`;
    });
  }

  breadcrumb.innerHTML = html;

  $$('.breadcrumb-item').forEach(item => {
    item.onclick = () => {
      state.currentFolderId = item.dataset.folderId;
      showView('notes');
    };
  });
}

function getFolderPath(folderId) {
  const path = [];
  let current = state.folders.find(f => f.id === folderId);
  while (current && current.parentId !== 'root' && current.parentId !== null) {
    path.unshift(current);
    current = state.folders.find(f => f.id === current.parentId);
  }
  if (current && current.id !== 'root') path.unshift(current);
  return path;
}

// ============================================================================
// CLI Commands Rendering
// ============================================================================

function renderCliCommands() {
  const container = $('#cli-categories');
  const emptyState = $('#cli-empty');

  let commands = state.cliCommands;

  // Apply category filter
  if (state.cliCategoryFilter !== 'all') {
    commands = commands.filter(c => c.category === state.cliCategoryFilter);
  }

  // Apply search
  if (state.cliSearchQuery) {
    const query = state.cliSearchQuery.toLowerCase();
    commands = commands.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.command.toLowerCase().includes(query) ||
      (c.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }

  if (commands.length === 0) {
    container.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  // Group by category
  const grouped = {};
  commands.forEach(cmd => {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  });

  container.innerHTML = cliCategories
    .filter(cat => grouped[cat.id] && grouped[cat.id].length > 0)
    .map(cat => `
      <section class="cli-category" data-category="${cat.id}">
        <header class="cli-category-header">
          <h3 class="cli-category-title">
            ${categoryIcons[cat.id] || ''}
            ${cat.name}
            <span class="cli-category-count">${grouped[cat.id].length}</span>
          </h3>
        </header>
        <div class="cli-commands-list">
          ${grouped[cat.id].map(cmd => `
            <article class="cli-command-card" data-command-id="${cmd.id}" tabindex="0">
              <div class="cli-command-header">
                <h4 class="cli-command-name">${escapeHtml(cmd.name)}</h4>
                <span class="cli-command-category ${cmd.category}">${cat.name}</span>
              </div>
              <p class="cli-command-desc">${escapeHtml(cmd.description)}</p>
              <div class="cli-command-code">
                <button class="copy-btn" aria-label="Copy command" data-command="${escapeHtml(cmd.command)}">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <pre><code>${escapeHtml(cmd.command)}</code></pre>
              </div>
              ${cmd.tags && cmd.tags.length > 0 ? `
                <div class="cli-command-tags">
                  ${cmd.tags.map(tag => `<span class="cli-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
              ` : ''}
              <div class="cli-command-actions">
                <button class="btn btn-ghost btn-sm" data-action="edit" aria-label="Edit command">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button class="btn btn-ghost btn-sm danger" data-action="delete" aria-label="Delete command">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');

  attachCliListeners();
}

function attachCliListeners() {
  // Copy buttons
  $$('.copy-btn').forEach(btn => {
    btn.onclick = async () => {
      const command = btn.dataset.command;
      await navigator.clipboard.writeText(command);
      btn.classList.add('copied');
      btn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      showToast('Command copied!', 'success', 1500);
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
      }, 1500);
    };
  });

  // Edit command
  $$('.cli-command-card [data-action="edit"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const card = btn.closest('.cli-command-card');
      const commandId = card.dataset.commandId;
      showCliCommandModal(commandId);
    };
  });

  // Delete command
  $$('.cli-command-card [data-action="delete"]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const card = btn.closest('.cli-command-card');
      const commandId = card.dataset.commandId;
      const cmd = state.cliCommands.find(c => c.id === commandId);
      if (await confirmDialog('Delete Command', `Delete "${cmd.name}"?`)) {
        await storage.deleteCliCommand(commandId);
        await loadData();
        showToast('Command deleted', 'success');
      }
    };
  });

  // Card click to show detail (on mobile/desktop)
  $$('.cli-command-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.cli-command-actions') || e.target.closest('.copy-btn')) return;
      const commandId = card.dataset.commandId;
      showCliDetail(commandId);
    };
  });
}

function showCliDetail(commandId) {
  const cmd = state.cliCommands.find(c => c.id === commandId);
  if (!cmd) return;

  const sidebar = $('#detail-sidebar');
  const content = $('#detail-content');

  content.innerHTML = `
    <div class="cli-detail">
      <div class="cli-detail-header">
        <h4>${escapeHtml(cmd.name)}</h4>
        <span class="cli-command-category ${cmd.category}">${cliCategories.find(c => c.id === cmd.category)?.name || cmd.category}</span>
      </div>
      <p class="cli-detail-desc">${escapeHtml(cmd.description)}</p>
      <div class="cli-detail-code">
        <pre><code>${escapeHtml(cmd.command)}</code></pre>
      </div>
      ${cmd.tags && cmd.tags.length > 0 ? `
        <div class="cli-detail-tags">
          ${cmd.tags.map(tag => `<span class="cli-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="cli-detail-actions">
        <button class="btn btn-secondary" data-action="copy" aria-label="Copy command">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
        <button class="btn btn-secondary" data-action="edit">Edit</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    </div>
  `;

  content.querySelector('[data-action="copy"]').onclick = async () => {
    await navigator.clipboard.writeText(cmd.command);
    showToast('Command copied!', 'success', 1500);
  };

  content.querySelector('[data-action="edit"]').onclick = () => {
    sidebar.hidden = true;
    showCliCommandModal(commandId);
  };

  content.querySelector('[data-action="delete"]').onclick = async () => {
    if (await confirmDialog('Delete Command', `Delete "${cmd.name}"?`)) {
      await storage.deleteCliCommand(commandId);
      await loadData();
      sidebar.hidden = true;
      showToast('Command deleted', 'success');
    }
  };

  sidebar.hidden = false;
  $('#app').classList.add('has-detail');
  if (window.innerWidth < 900) {
    sidebar.classList.add('open');
  }
}

function showCliCommandModal(commandId = null) {
  const isEdit = !!commandId;
  const cmd = commandId ? state.cliCommands.find(c => c.id === commandId) : {};
  const categories = cliCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  showModal(
    isEdit ? 'Edit Command' : 'Add Command',
    `
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="cli-name" value="${escapeHtml(cmd.name || '')}" placeholder="e.g., Find Large Files" required>
    </div>
    <div class="form-group">
      <label>Category</label>
      <select id="cli-category" required>${categories}</select>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="cli-desc" rows="3" placeholder="What does this command do?">${escapeHtml(cmd.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Command</label>
      <textarea id="cli-command" rows="8" placeholder="Enter the command(s)" required>${escapeHtml(cmd.command || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="cli-tags" value="${(cmd.tags || []).join(', ')}" placeholder="search, files, daily">
    </div>
    `,
    `
    <button class="btn btn-secondary" data-result="cancel">Cancel</button>
    <button class="btn btn-primary" data-result="save">Save</button>
    `
  );

  const checkResult = () => {
    const saveBtn = $('#modal-footer button[data-result="save"]');
    const cancelBtn = $('#modal-footer button[data-result="cancel"]');
    if (saveBtn && cancelBtn) {
      saveBtn.onclick = async () => {
        const name = $('#cli-name').value.trim();
        const category = $('#cli-category').value;
        const description = $('#cli-desc').value.trim();
        const command = $('#cli-command').value.trim();
        const tags = $('#cli-tags').value.split(',').map(t => t.trim()).filter(Boolean);

        if (!name || !command) {
          showToast('Name and command are required', 'error');
          return;
        }

        if (isEdit) {
          await storage.updateCliCommand(commandId, { name, category, description, command, tags });
          showToast('Command updated', 'success');
        } else {
          await storage.createCliCommand({ name, category, description, command, tags });
          showToast('Command added', 'success');
        }

        closeModal();
        await loadData();
      };
      cancelBtn.onclick = () => closeModal();
    } else {
      setTimeout(checkResult, 50);
    }
  };
  checkResult();

  $('#cli-category').value = cmd.category || 'custom';
}

// ============================================================================
// Settings
// ============================================================================

async function loadSettings() {
  state.settings = await storage.getAllSettings();

  // Apply settings to UI
  $('#autosave-interval').value = state.settings.autoSaveInterval || 2000;
  $('#sync-documents').checked = state.settings.syncEnabled !== false;
  $('#auto-preview').checked = state.settings.autoPreview !== false;
  $('#vim-mode').checked = state.settings.vimMode || false;
  $('#line-numbers').checked = state.settings.lineNumbers || false;
  $('#tab-size').value = state.settings.tabSize || 4;
  $('#theme-select').value = state.settings.theme || 'dark';
  $('#font-size').value = state.settings.fontSize || 14;
  $('#compact-mode').checked = state.settings.compactMode || false;

  // Apply theme
  applyTheme(state.settings.theme || 'dark');
  applyFontSize(state.settings.fontSize || 14);
  applyCompactMode(state.settings.compactMode || false);

  // Documents path
  const docsPath = state.settings.documentsPath || getDefaultDocumentsPath();
  $('#documents-path').value = docsPath;
}

function getDefaultDocumentsPath() {
  // Return a display-friendly default path (actual path requires File System Access API)
  if (navigator.userAgentData?.platform === 'Windows') {
    return 'Documents\\ScratchNotes';
  }
  return 'Documents/ScratchNotes';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function applyFontSize(size) {
  document.documentElement.style.setProperty('--font-size-base', `${size}px`);
}

function applyCompactMode(enabled) {
  document.documentElement.classList.toggle('compact-mode', enabled);
}

async function saveSettings() {
  const settings = {
    autoSaveInterval: parseInt($('#autosave-interval').value),
    syncEnabled: $('#sync-documents').checked,
    autoPreview: $('#auto-preview').checked,
    vimMode: $('#vim-mode').checked,
    lineNumbers: $('#line-numbers').checked,
    tabSize: parseInt($('#tab-size').value),
    theme: $('#theme-select').value,
    fontSize: parseInt($('#font-size').value),
    compactMode: $('#compact-mode').checked,
    documentsPath: $('#documents-path').value
  };

  await storage.setSettings(settings);
  state.settings = settings;

  // Apply immediately
  applyTheme(settings.theme);
  applyFontSize(settings.fontSize);
  applyCompactMode(settings.compactMode);

  // Update auto-save interval
  storage.autoSaveInterval = settings.autoSaveInterval;

  showToast('Settings saved', 'success');
}

// ============================================================================
// Data Loading
// ============================================================================

async function loadData() {
  try {
    state.folders = await storage.getAllFolders();
    state.notes = await storage.getAllNotes();
    state.cliCommands = await storage.getAll('cliCommands');
    state.settings = await storage.getAllSettings();

    // Initialize defaults if empty
    if (state.folders.length === 0) {
      await storage.initializeDefaults(defaultCliCommands);
      state.folders = await storage.getAllFolders();
      state.notes = await storage.getAllNotes();
      state.cliCommands = await storage.getAll('cliCommands');
      state.settings = await storage.getAllSettings();
    }

    updateFolderTree();

    // Apply settings
    applyTheme(state.settings.theme || 'dark');
    applyFontSize(state.settings.fontSize || 14);
    applyCompactMode(state.settings.compactMode || false);
    storage.autoSaveInterval = state.settings.autoSaveInterval || 2000;

    // Render current view
    if (state.currentView === 'notes') renderNotes();
    else if (state.currentView === 'cli') renderCliCommands();
    else if (state.currentView === 'settings') loadSettings();

  } catch (error) {
    console.error('Failed to load data:', error);
    showToast('Failed to load data', 'error');
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

function setupEventListeners() {
  // Navigation
  $('#new-folder-btn').onclick = async () => {
    const name = await promptDialog('New Folder', 'Folder name');
    if (name) {
      await storage.createFolder(name, state.currentFolderId);
      await loadData();
      showToast('Folder created', 'success');
    }
  };

  $('#new-note-btn').onclick = () => showEditor();
  $('#empty-new-note').onclick = () => showEditor();
  const emptyNewFolder = $('#empty-new-folder');
  if (emptyNewFolder) emptyNewFolder.onclick = () => $('#new-folder-btn').click();

  $('#back-btn').onclick = () => showView('notes');

  // Tab navigation
  $$('.tab-btn').forEach(btn => {
    btn.onclick = () => showView(btn.dataset.view);
  });

  // Search
  $('#folder-search').addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    $$('.folder-item').forEach(item => {
      const name = item.querySelector('.folder-name')?.textContent.toLowerCase() || '';
      item.style.display = name.includes(query) ? '' : 'none';
    });
  }, 150));

  $('#notes-search').addEventListener('input', debounce((e) => {
    state.searchQuery = e.target.value;
    renderNotes();
  }, 150));

  // Sort
  $('#sort-select').addEventListener('change', (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    state.sortBy = sortBy;
    state.sortOrder = sortOrder;
    renderNotes();
  });

  // Editor
  $('#note-title').addEventListener('input', debounce(async () => {
    if (state.currentNoteId) {
      await storage.updateNote(state.currentNoteId, { title: $('#note-title').value });
      updateFolderTree();
    }
  }, 500));

  $('#note-content').addEventListener('input', debounce(async () => {
    if (state.currentNoteId) {
      await storage.updateNote(state.currentNoteId, { content: $('#note-content').value });
      storage.scheduleAutoSave();
    }
    updateWordCount();
    updatePreview();
  }, 500));

  $('#note-folder').addEventListener('change', async (e) => {
    if (state.currentNoteId) {
      await storage.moveNote(state.currentNoteId, e.target.value);
      await loadData();
    }
  });

  $('#save-note-btn').onclick = async () => {
    const title = $('#note-title').value.trim();
    const content = $('#note-content').value;
    const folderId = $('#note-folder').value;

    if (!title) {
      showToast('Note title is required', 'error');
      return;
    }

    if (state.currentNoteId) {
      await storage.updateNote(state.currentNoteId, { title, content, folderId });
      showToast('Saved', 'success');
    } else {
      const newNote = await storage.createNote(folderId, title, content);
      state.currentNoteId = newNote.id;
      showToast('Note created', 'success');
    }
    await loadData();
  };

  $('#delete-note-btn').onclick = async () => {
    if (state.currentNoteId && await confirmDialog('Delete Note', 'Are you sure?')) {
      await storage.deleteNote(state.currentNoteId);
      state.currentNoteId = null;
      await loadData();
      showView('notes');
      showToast('Note deleted', 'success');
    }
  };

  // Editor toolbar
  $$('.editor-toolbar [data-format]').forEach(btn => {
    btn.onclick = () => applyFormat($('#note-content'), btn.dataset.format);
  });

  $('#preview-toggle').addEventListener('change', togglePreview);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          if (state.currentView === 'editor') {
            $('#save-note-btn').click();
          }
          break;
        case 'n':
          e.preventDefault();
          if (state.currentView === 'notes') showEditor();
          break;
        case 'b':
          if (state.currentView === 'editor') {
            e.preventDefault();
            applyFormat($('#note-content'), 'bold');
          }
          break;
        case 'i':
          if (state.currentView === 'editor') {
            e.preventDefault();
            applyFormat($('#note-content'), 'italic');
          }
          break;
      }
    }

    // Escape to close detail sidebar
    if (e.key === 'Escape') {
      $('#detail-sidebar')?.classList.remove('open');
      $('#modal-overlay')?.hidden && ($('#modal-overlay').hidden = true);
    }
  });

  // CLI View
  $('#new-cli-btn').onclick = () => showCliCommandModal();
  $('#cli-empty-add').onclick = () => showCliCommandModal();

  $('#cli-category-filter').addEventListener('change', (e) => {
    state.cliCategoryFilter = e.target.value;
    renderCliCommands();
  });

  $('#cli-search').addEventListener('input', debounce((e) => {
    state.cliSearchQuery = e.target.value;
    renderCliCommands();
  }, 150));

  // Settings
  $('#autosave-interval').addEventListener('change', saveSettings);
  $('#sync-documents').addEventListener('change', saveSettings);
  $('#auto-preview').addEventListener('change', saveSettings);
  $('#vim-mode').addEventListener('change', saveSettings);
  $('#line-numbers').addEventListener('change', saveSettings);
  $('#tab-size').addEventListener('change', saveSettings);
  $('#theme-select').addEventListener('change', saveSettings);
  $('#font-size').addEventListener('change', saveSettings);
  $('#compact-mode').addEventListener('change', saveSettings);

  $('#backup-now-btn').onclick = async () => {
    await storage.exportToFile();
    showToast('Backup saved', 'success');
  };

  $('#open-documents-btn').onclick = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        const path = dirHandle.name;
        $('#documents-path').value = path;
        await storage.setSetting('documentsPath', path);
        showToast('Documents folder selected', 'success');
      } else {
        // Fallback for browsers without File System Access API
        showToast('Folder picker not supported in this browser. Enter path manually.', 'warning', 5000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Folder picker error:', error);
        showToast('Failed to open folder picker', 'error');
      }
    }
  };

  $('#export-all-btn').onclick = async () => {
    await storage.exportToFile();
  };

  $('#import-data-btn').onclick = () => $('#import-data-file').click();
  $('#import-data-file').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
      if (await confirmDialog('Import Data', 'This will replace all current data. Continue?')) {
        await storage.importFromFile(e.target.files[0]);
        await loadData();
        showToast('Data imported', 'success');
      }
      e.target.value = '';
    }
  });

  $('#clear-all-btn').onclick = async () => {
    if (await confirmDialog('Clear All Data', 'This will delete ALL notes, folders, and CLI commands. This cannot be undone!')) {
      if (await confirmDialog('Confirm Clear', 'Are you absolutely sure?')) {
        await storage.clear('folders');
        await storage.clear('notes');
        await storage.clear('cliCommands');
        await storage.setSetting('initialized', false);
        await loadData();
        showToast('All data cleared', 'warning');
      }
    }
  };

  // Import/Export sidebar
  $('#import-btn').onclick = () => $('#import-file').click();
  $('#import-file').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
      await storage.importFromFile(e.target.files[0]);
      await loadData();
      showToast('Imported successfully', 'success');
      e.target.value = '';
    }
  });

  $('#export-btn').onclick = () => storage.exportToFile();

  // View switching (keyboard shortcuts)
  document.addEventListener('keydown', (e) => {
    if (e.altKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          showView('notes');
          break;
        case '2':
          e.preventDefault();
          showView('cli');
          break;
        case '3':
          e.preventDefault();
          showView('settings');
          break;
      }
    }
  });

  // Close detail sidebar
  $('#close-detail').onclick = () => {
    $('#detail-sidebar').hidden = true;
    $('#detail-sidebar').classList.remove('open');
  };

  // Mobile sidebar toggle (would need a hamburger button)
  // For now, we'll handle via CSS
}

// ============================================================================
// Initialization
// ============================================================================

async function init() {
  // Cache DOM elements
  Object.assign(elements, {
    app: $('#app'),
    sidebar: $('#sidebar'),
    main: $('.main'),
    detailSidebar: $('#detail-sidebar')
  });

  setupEventListeners();
  setupResizeHandles();

  // Load data
  await loadData();

  // Show initial view
  showView('notes');

  // Handle visibility change for auto-save
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.currentNoteId) {
      storage.updateNote(state.currentNoteId, {
        title: $('#note-title').value,
        content: $('#note-content').value
      });
    }
  });

  console.log('Scratch Notes initialized');
}

// Start the app
init();