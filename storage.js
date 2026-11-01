/**
 * Storage Layer - IndexedDB with Documents folder sync
 * Provides persistent, performant local storage with optional file backup
 */

const DB_NAME = 'ScratchNotesDB';
const DB_VERSION = 2;
const STORES = {
  FOLDERS: 'folders',
  NOTES: 'notes',
  CLI_COMMANDS: 'cliCommands',
  SETTINGS: 'settings',
  METADATA: 'metadata'
};

class Storage {
  constructor() {
    this.db = null;
    this.ready = this.init();
    this.syncQueue = [];
    this.syncing = false;
    this.documentsPath = null;
    this.syncEnabled = true;
    this.autoSaveTimer = null;
    this.autoSaveInterval = 2000;
    this.pendingChanges = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.setupEventListeners();
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Folders store
        if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
          const folderStore = db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
          folderStore.createIndex('parentId', 'parentId', { unique: false });
          folderStore.createIndex('order', 'order', { unique: false });
        }

        // Notes store
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          noteStore.createIndex('folderId', 'folderId', { unique: false });
          noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          noteStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // CLI Commands store
        if (!db.objectStoreNames.contains(STORES.CLI_COMMANDS)) {
          const cliStore = db.createObjectStore(STORES.CLI_COMMANDS, { keyPath: 'id' });
          cliStore.createIndex('category', 'category', { unique: false });
          cliStore.createIndex('order', 'order', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Metadata store (for sync info, version, etc.)
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };
    });
  }

  setupEventListeners() {
    this.db.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
    };
  }

  // Generic CRUD operations
  async get(storeName, key) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName, indexName = null, query = null) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = query ? source.getAll(query) : source.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, value) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Batch operations for performance
  async batch(operations) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const storeNames = [...new Set(operations.map(op => op.store))];
      const transaction = this.db.transaction(storeNames, 'readwrite');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const op of operations) {
        const store = transaction.objectStore(op.store);
        switch (op.type) {
          case 'put':
            store.put(op.value);
            break;
          case 'delete':
            store.delete(op.key);
            break;
          case 'clear':
            store.clear();
            break;
        }
      }
    });
  }

  // ========================================================================
  // Folders
  // ========================================================================

  async getFolders(parentId = 'root') {
    const folders = await this.getAll(STORES.FOLDERS, 'parentId', parentId);
    return folders.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getAllFolders() {
    return this.getAll(STORES.FOLDERS);
  }

  async getFolder(id) {
    return this.get(STORES.FOLDERS, id);
  }

  async createFolder(name, parentId = 'root') {
    const folders = await this.getFolders(parentId);
    const order = folders.length > 0 ? Math.max(...folders.map(f => f.order || 0)) + 1 : 0;

    const folder = {
      id: this.generateId(),
      name,
      parentId,
      order,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.put(STORES.FOLDERS, folder);
    await this.queueSync();
    return folder;
  }

  async updateFolder(id, updates) {
    const folder = await this.get(STORES.FOLDERS, id);
    if (!folder) return null;

    const updated = {
      ...folder,
      ...updates,
      updatedAt: Date.now()
    };

    await this.put(STORES.FOLDERS, updated);
    await this.queueSync();
    return updated;
  }

  async deleteFolder(id, recursive = false) {
    const folder = await this.get(STORES.FOLDERS, id);
    if (!folder) return false;

    if (recursive) {
      // Delete child folders recursively
      const children = await this.getFolders(id);
      for (const child of children) {
        await this.deleteFolder(child.id, true);
      }

      // Delete notes in this folder
      const notes = await this.getNotesByFolder(id);
      for (const note of notes) {
        await this.deleteNote(note.id);
      }
    } else {
      // Move children to parent
      const children = await this.getFolders(id);
      for (const child of children) {
        await this.updateFolder(child.id, { parentId: folder.parentId });
      }

      // Move notes to parent folder
      const notes = await this.getNotesByFolder(id);
      for (const note of notes) {
        await this.updateNote(note.id, { folderId: folder.parentId });
      }
    }

    await this.delete(STORES.FOLDERS, id);
    await this.queueSync();
    return true;
  }

  async reorderFolders(folderIds) {
    const operations = folderIds.map((id, index) =>
      this.get(STORES.FOLDERS, id).then(folder => ({
        store: STORES.FOLDERS,
        type: 'put',
        value: { ...folder, order: index }
      }))
    );

    const updates = await Promise.all(operations);
    await this.batch(updates);
    await this.queueSync();
  }

  // ========================================================================
  // Notes
  // ========================================================================

  async getNotesByFolder(folderId, sortBy = 'updatedAt', sortOrder = 'desc') {
    const notes = await this.getAll(STORES.NOTES, 'folderId', folderId);
    return this.sortNotes(notes, sortBy, sortOrder);
  }

  async getAllNotes() {
    return this.getAll(STORES.NOTES);
  }

  async getNote(id) {
    return this.get(STORES.NOTES, id);
  }

  async searchNotes(query, folderId = null) {
    const notes = folderId
      ? await this.getNotesByFolder(folderId)
      : await this.getAllNotes();

    const lowerQuery = query.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
  }

  sortNotes(notes, sortBy, sortOrder) {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return [...notes].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'title') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
      return 0;
    });
  }

  async createNote(folderId = 'root', title = 'Untitled', content = '') {
    const note = {
      id: this.generateId(),
      folderId,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.put(STORES.NOTES, note);
    await this.queueSync();
    return note;
  }

  async updateNote(id, updates) {
    const note = await this.get(STORES.NOTES, id);
    if (!note) return null;

    const updated = {
      ...note,
      ...updates,
      updatedAt: Date.now()
    };

    await this.put(STORES.NOTES, updated);
    this.scheduleAutoSave();
    return updated;
  }

  async deleteNote(id) {
    await this.delete(STORES.NOTES, id);
    await this.queueSync();
    return true;
  }

  async moveNote(noteId, folderId) {
    return this.updateNote(noteId, { folderId });
  }

  // Debounced auto-save for content changes
  scheduleAutoSave() {
    if (this.autoSaveInterval <= 0) return;

    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.queueSync();
    }, this.autoSaveInterval);
  }

  // ========================================================================
  // CLI Commands
  // ========================================================================

  async getCliCommands(category = null) {
    if (category && category !== 'all') {
      return this.getAll(STORES.CLI_COMMANDS, 'category', category);
    }
    const commands = await this.getAll(STORES.CLI_COMMANDS);
    return commands.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getCliCommand(id) {
    return this.get(STORES.CLI_COMMANDS, id);
  }

  async createCliCommand(data) {
    const commands = await this.getCliCommands(data.category);
    const order = commands.length > 0 ? Math.max(...commands.map(c => c.order || 0)) + 1 : 0;

    const command = {
      id: this.generateId(),
      ...data,
      order,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.put(STORES.CLI_COMMANDS, command);
    await this.queueSync();
    return command;
  }

  async updateCliCommand(id, updates) {
    const command = await this.get(STORES.CLI_COMMANDS, id);
    if (!command) return null;

    const updated = {
      ...command,
      ...updates,
      updatedAt: Date.now()
    };

    await this.put(STORES.CLI_COMMANDS, updated);
    await this.queueSync();
    return updated;
  }

  async deleteCliCommand(id) {
    await this.delete(STORES.CLI_COMMANDS, id);
    await this.queueSync();
    return true;
  }

  async reorderCliCommands(commandIds) {
    const operations = commandIds.map((id, index) =>
      this.get(STORES.CLI_COMMANDS, id).then(cmd => ({
        store: STORES.CLI_COMMANDS,
        type: 'put',
        value: { ...cmd, order: index }
      }))
    );

    const updates = await Promise.all(operations);
    await this.batch(updates);
    await this.queueSync();
  }

  // ========================================================================
  // Settings
  // ========================================================================

  async getSetting(key, defaultValue = null) {
    const setting = await this.get(STORES.SETTINGS, key);
    return setting ? setting.value : defaultValue;
  }

  async getAllSettings() {
    const settings = await this.getAll(STORES.SETTINGS);
    return Object.fromEntries(settings.map(s => [s.key, s.value]));
  }

  async setSetting(key, value) {
    await this.put(STORES.SETTINGS, { key, value, updatedAt: Date.now() });
  }

  async setSettings(settings) {
    const operations = Object.entries(settings).map(([key, value]) => ({
      store: STORES.SETTINGS,
      type: 'put',
      value: { key, value, updatedAt: Date.now() }
    }));
    await this.batch(operations);
  }

  // ========================================================================
  // Sync to Documents Folder
  // ========================================================================

  async setDocumentsPath(path) {
    this.documentsPath = path;
    await this.setSetting('documentsPath', path);
  }

  async setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
    await this.setSetting('syncEnabled', enabled);
  }

  async setAutoSaveInterval(interval) {
    this.autoSaveInterval = interval;
    await this.setSetting('autoSaveInterval', interval);
  }

  async queueSync() {
    if (!this.syncEnabled || !this.documentsPath) return;
    this.syncQueue.push(Date.now());
    this.processSyncQueue();
  }

  async processSyncQueue() {
    if (this.syncing || this.syncQueue.length === 0) return;
    this.syncing = true;

    try {
      await this.exportToFile();
      this.syncQueue = [];
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncing = false;
      if (this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }
  }

  async exportToFile() {
    if (typeof window === 'undefined' || !window.showSaveFilePicker) {
      // Fallback for non-supporting environments
      return this.downloadBackup();
    }

    try {
      const data = await this.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

      const handle = await window.showSaveFilePicker({
        suggestedName: `scratch-notes-backup-${new Date().toISOString().split('T')[0]}.json`,
        types: [{
          description: 'JSON Backup',
          accept: { 'application/json': ['.json'] }
        }]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }

  async downloadBackup() {
    const data = await this.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratch-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportAll() {
    const [folders, notes, cliCommands, settings] = await Promise.all([
      this.getAllFolders(),
      this.getAllNotes(),
      this.getAll(STORES.CLI_COMMANDS),
      this.getAllSettings()
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      folders,
      notes,
      cliCommands,
      settings
    };
  }

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          await this.importData(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async importData(data) {
    if (!data.folders || !data.notes || !data.cliCommands) {
      throw new Error('Invalid backup format');
    }

    // Clear existing data
    await Promise.all([
      this.clear(STORES.FOLDERS),
      this.clear(STORES.NOTES),
      this.clear(STORES.CLI_COMMANDS)
    ]);

    // Import folders first (notes depend on them)
    const folderOps = data.folders.map(f => ({
      store: STORES.FOLDERS,
      type: 'put',
      value: f
    }));
    await this.batch(folderOps);

    // Import notes
    const noteOps = data.notes.map(n => ({
      store: STORES.NOTES,
      type: 'put',
      value: n
    }));
    await this.batch(noteOps);

    // Import CLI commands
    const cliOps = data.cliCommands.map(c => ({
      store: STORES.CLI_COMMANDS,
      type: 'put',
      value: c
    }));
    await this.batch(cliOps);

    // Import settings
    if (data.settings) {
      await this.setSettings(data.settings);
    }

    await this.queueSync();
  }

  // ========================================================================
  // Utility
  // ========================================================================

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async initializeDefaults(defaultCliCommands) {
    // Check if already initialized
    const initialized = await this.getSetting('initialized');
    if (initialized) return;

    // Create root folder
    await this.put(STORES.FOLDERS, {
      id: 'root',
      name: 'All Notes',
      parentId: null,
      order: -1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Create default folders
    const defaultFolders = [
      { name: 'Personal', parentId: 'root' },
      { name: 'Work', parentId: 'root' },
      { name: 'Projects', parentId: 'root' },
      { name: 'Reference', parentId: 'root' }
    ];

    for (const folder of defaultFolders) {
      await this.createFolder(folder.name, folder.parentId);
    }

    // Import default CLI commands
    for (const cmd of defaultCliCommands) {
      await this.createCliCommand(cmd);
    }

    // Default settings
    await this.setSettings({
      theme: 'dark',
      fontSize: 14,
      tabSize: 4,
      autoPreview: true,
      vimMode: false,
      lineNumbers: false,
      compactMode: false,
      syncEnabled: true,
      autoSaveInterval: 2000,
      initialized: true
    });
  }

  // Get storage usage stats
  async getStats() {
    const [folders, notes, cliCommands] = await Promise.all([
      this.getAllFolders(),
      this.getAllNotes(),
      this.getAll(STORES.CLI_COMMANDS)
    ]);

    return {
      folders: folders.length,
      notes: notes.length,
      cliCommands: cliCommands.length,
      totalCharacters: notes.reduce((sum, n) => sum + (n.content?.length || 0) + (n.title?.length || 0), 0)
    };
  }
}

// Export singleton
export const storage = new Storage();