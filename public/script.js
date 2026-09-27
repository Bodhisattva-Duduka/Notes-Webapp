const editorContainer = document.getElementById('editorContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const notesList = document.getElementById('notesList');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const addNoteBtn = document.getElementById('addNoteBtn');
const fabBtn = document.getElementById('fabBtn');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeBtn = document.getElementById('closeBtn');
const backBtn = document.getElementById('backBtn');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');
const notesCountEl = document.getElementById('notesCount');
const wordCountEl = document.getElementById('wordCount');
const charCountEl = document.getElementById('charCount');
const statusTextEl = document.getElementById('statusText');

let notes = [];
let activeNoteId = null;
let filteredNotes = [];
const baseURL = window.location.origin;
let isMobile = window.innerWidth <= 860;

init();

async function init() {
  updatePlatformShortcuts();
  await loadNotes();
  setupEventListeners();
  checkMobileView();
}

function updatePlatformShortcuts() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl+';

  const newShortcut = document.getElementById('newShortcut');
  const saveShortcut = document.getElementById('saveShortcut');
  const welcomeNew = document.getElementById('welcomeNewShortcut');
  const welcomeSave = document.getElementById('welcomeSaveShortcut');

  if (newShortcut) newShortcut.textContent = `${modKey}N`;
  if (saveShortcut) saveShortcut.textContent = `${modKey}S`;
  if (welcomeNew) welcomeNew.textContent = `${modKey}N`;
  if (welcomeSave) welcomeSave.textContent = `${modKey}S`;
}

function checkMobileView() {
  isMobile = window.innerWidth <= 860;
}

// API Functions
async function loadNotes() {
  try {
    showLoading();
    const res = await fetch(`${baseURL}/notes/api/info`);
    const data = await res.json();
    notes = Array.isArray(data.note) ? data.note : [];
    filteredNotes = notes;
    renderNotes();
  } catch (error) {
    console.error('Error loading notes:', error);
    showToast('Failed to load notes');
  } finally {
    hideLoading();
  }
}

async function saveNote() {
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();

  if (!title && !body) {
    showToast('Please enter a title or note content');
    return;
  }

  try {
    showLoading();
    const noteData = {
      id: activeNoteId || Date.now().toString(),
      title: title || 'Untitled note',
      noteBody: body,
      date: new Date().toLocaleDateString()
    };

    const res = await fetch(`${baseURL}/notes/api/save-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });

    if (res.ok) {
      const savedData = await res.json();
      activeNoteId = savedData.id;
      showToast('Note saved');
      if (statusTextEl) statusTextEl.textContent = 'Saved';
      await loadNotes();
      
      // Update active highlight
      document.querySelectorAll('.note-card').forEach(card => {
        card.classList.toggle('active', card.dataset.id === activeNoteId);
      });
    } else {
      showToast('Failed to save note');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    showToast('Failed to save note');
  } finally {
    hideLoading();
  }
}

async function deleteNote() {
  if (!activeNoteId) return;

  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    showLoading();
    const res = await fetch(`${baseURL}/notes/api/delete-note`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activeNoteId })
    });

    if (res.ok) {
      showToast('Note deleted');
      activeNoteId = null;
      await loadNotes();
      closeEditor();
    } else {
      showToast('Failed to delete note');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    showToast('Failed to delete note');
  } finally {
    hideLoading();
  }
}

// UI Functions
function renderNotes() {
  if (notesCountEl) {
    notesCountEl.textContent = `${notes.length} note${notes.length === 1 ? '' : 's'}`;
  }

  if (filteredNotes.length === 0) {
    const isSearching = searchInput && searchInput.value.trim().length > 0;
    notesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular ${isSearching ? 'fa-face-frown' : 'fa-clipboard'}"></i>
        <h3>${isSearching ? 'No matching notes' : 'No notes yet'}</h3>
        <p>${isSearching ? 'Try another search query' : 'Create your first note to get started'}</p>
      </div>
    `;
    return;
  }

  notesList.innerHTML = filteredNotes.map(note => `
    <div class="note-card ${note.id === activeNoteId ? 'active' : ''}" data-id="${note.id}">
      <div class="note-card-header">
        <div class="note-card-title">${escapeHtml(note.title || 'Untitled note')}</div>
        ${note.date ? `<span class="note-card-date">${escapeHtml(note.date)}</span>` : ''}
      </div>
      <div class="note-card-preview">${escapeHtml(note.noteBody || 'No content')}</div>
    </div>
  `).join('');

  document.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => openNote(card.dataset.id));
  });
}

function openNote(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  activeNoteId = noteId;
  noteTitle.value = note.title || '';
  noteBody.value = note.noteBody || '';

  if (statusTextEl) statusTextEl.textContent = 'Editing';
  updateWordCount();

  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === noteId);
  });

  showEditor();
}

function createNewNote() {
  activeNoteId = null;
  noteTitle.value = '';
  noteBody.value = '';

  if (statusTextEl) statusTextEl.textContent = 'Draft';
  updateWordCount();

  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.remove('active');
  });

  showEditor();

  setTimeout(() => {
    noteTitle.focus();
  }, 100);
}

function showEditor() {
  editorContainer.classList.remove('hidden');

  if (isMobile) {
    setTimeout(() => {
      editorContainer.classList.add('mobile-active');
    }, 10);
  } else {
    if (welcomeScreen) welcomeScreen.style.display = 'none';
  }
}

function closeEditor() {
  if (isMobile) {
    editorContainer.classList.remove('mobile-active');
    setTimeout(() => {
      editorContainer.classList.add('hidden');
    }, 250);
  } else {
    editorContainer.classList.add('hidden');
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
  }

  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.remove('active');
  });

  activeNoteId = null;
}

function searchNotes(query) {
  const searchTerm = query.toLowerCase().trim();

  if (searchClear) {
    searchClear.classList.toggle('hidden', searchTerm.length === 0);
  }

  if (!searchTerm) {
    filteredNotes = notes;
  } else {
    filteredNotes = notes.filter(note =>
      (note.title && note.title.toLowerCase().includes(searchTerm)) ||
      (note.noteBody && note.noteBody.toLowerCase().includes(searchTerm))
    );
  }
  renderNotes();
}

function updateWordCount() {
  const text = (noteBody ? noteBody.value : '') + ' ' + (noteTitle ? noteTitle.value : '');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = (noteBody ? noteBody.value.length : 0);

  if (wordCountEl) wordCountEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
  if (charCountEl) charCountEl.textContent = `${chars} char${chars === 1 ? '' : 's'}`;
}

// Utility Functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

let toastTimer = null;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function showLoading() {
  if (loading) loading.classList.add('active');
}

function hideLoading() {
  if (loading) loading.classList.remove('active');
}

// Event Listeners
function setupEventListeners() {
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', createNewNote);
  }

  if (fabBtn) {
    fabBtn.addEventListener('click', createNewNote);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', saveNote);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteNote);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeEditor);
  }

  if (backBtn) {
    backBtn.addEventListener('click', closeEditor);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchNotes(e.target.value);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchNotes('');
        searchInput.focus();
      }
    });
  }

  if (noteBody) {
    noteBody.addEventListener('input', () => {
      updateWordCount();
      if (statusTextEl && statusTextEl.textContent === 'Saved') {
        statusTextEl.textContent = 'Draft';
      }
    });
  }

  if (noteTitle) {
    noteTitle.addEventListener('input', () => {
      updateWordCount();
      if (statusTextEl && statusTextEl.textContent === 'Saved') {
        statusTextEl.textContent = 'Draft';
      }
    });
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!editorContainer.classList.contains('hidden')) {
          saveNote();
        }
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        createNewNote();
      }
    }

    if (e.key === 'Escape' && !editorContainer.classList.contains('hidden')) {
      closeEditor();
    }
  });

  // Window Resize
  window.addEventListener('resize', () => {
    checkMobileView();
    if (!isMobile && editorContainer.classList.contains('mobile-active')) {
      editorContainer.classList.remove('mobile-active');
    }
  });
}
