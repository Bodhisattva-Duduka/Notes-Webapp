const editorContainer = document.getElementById('editorContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const notesList = document.getElementById('notesList');
const searchInput = document.getElementById('searchInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const fabBtn = document.getElementById('fabBtn');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeBtn = document.getElementById('closeBtn');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');

// State
let notes = [];
let activeNoteId = null;
let filteredNotes = [];
const baseURL = window.location.origin;
let isMobile = window.innerWidth <= 768;

// Initialize
init();

async function init() {
  await loadNotes();
  setupEventListeners();
  checkMobileView();
}

// Check if mobile view
function checkMobileView() {
  isMobile = window.innerWidth <= 768;
}

// API Functions
async function loadNotes() {
  try {
    showLoading();
    const res = await fetch(`${baseURL}/notes/api/info`);
    const data = await res.json();
    notes = data.note || [];
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
  if (!noteTitle.value.trim() || !noteBody.value.trim()) {
    showToast('Please fill in both title and content');
    return;
  }

  try {
    showLoading();
    const noteData = {
      id: activeNoteId || Date.now().toString(),
      title: noteTitle.value.trim(),
      noteBody: noteBody.value.trim(),
      date: new Date().toLocaleDateString() // Still saved but not displayed
    };

    const res = await fetch(`${baseURL}/notes/api/save-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });

    if (res.ok) {
      showToast('Note saved successfully');
      await loadNotes();
      closeEditor();
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
      showToast('Note deleted successfully');
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
  if (filteredNotes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No notes yet</h3>
        <p>Create your first note to get started</p>
      </div>
    `;
    return;
  }

  // Removed date from display
  notesList.innerHTML = filteredNotes.map(note => `
    <div class="note-card" data-id="${note.id}">
      <div class="note-card-title">${escapeHtml(note.title)}</div>
      <div class="note-card-preview">${escapeHtml(note.noteBody)}</div>
    </div>
  `).join('');

  // Add click listeners
  document.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => openNote(card.dataset.id));
  });
}

function openNote(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  activeNoteId = noteId;
  noteTitle.value = note.title;
  noteBody.value = note.noteBody;

  // Update UI
  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === noteId);
  });

  showEditor();
}

function createNewNote() {
  activeNoteId = null;
  noteTitle.value = '';
  noteBody.value = '';
  
  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.remove('active');
  });

  showEditor();
  
  // Focus on title input
  setTimeout(() => {
    noteTitle.focus();
  }, 300);
}

function showEditor() {
  editorContainer.classList.remove('hidden');
  
  if (isMobile) {
    // Add mobile-active class for mobile animation
    setTimeout(() => {
      editorContainer.classList.add('mobile-active');
    }, 10);
  } else {
    welcomeScreen.style.display = 'none';
  }
}

function closeEditor() {
  if (isMobile) {
    editorContainer.classList.remove('mobile-active');
    // Wait for animation to complete before hiding
    setTimeout(() => {
      editorContainer.classList.add('hidden');
    }, 300);
  } else {
    editorContainer.classList.add('hidden');
    welcomeScreen.style.display = 'flex';
  }

  document.querySelectorAll('.note-card').forEach(card => {
    card.classList.remove('active');
  });
  
  activeNoteId = null;
}

function searchNotes(query) {
  const searchTerm = query.toLowerCase();
  filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm) ||
    note.noteBody.toLowerCase().includes(searchTerm)
  );
  renderNotes();
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
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showLoading() {
  loading.classList.add('active');
}

function hideLoading() {
  loading.classList.remove('active');
}

// Event Listeners
function setupEventListeners() {
  // Button clicks with null checks
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

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchNotes(e.target.value);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        if (!editorContainer.classList.contains('hidden')) {
          saveNote();
        }
      }
      if (e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
    }
    
    // ESC to close editor
    if (e.key === 'Escape' && !editorContainer.classList.contains('hidden')) {
      closeEditor();
    }
  });

  // Auto-save draft (optional feature)
  let saveTimeout;
  [noteTitle, noteBody].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (activeNoteId && noteTitle.value && noteBody.value) {
            // You could implement auto-save here if needed
            console.log('Auto-save ready (not implemented)');
          }
        }, 2000);
      });
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    checkMobileView();
    
    // Reset mobile states when switching to desktop
    if (!isMobile && editorContainer.classList.contains('mobile-active')) {
      editorContainer.classList.remove('mobile-active');
    }
  });

  // Prevent scroll on mobile when editor is open
  if (isMobile) {
    editorContainer.addEventListener('touchmove', (e) => {
      if (e.target === editorContainer) {
        e.preventDefault();
      }
    });
  }
}
