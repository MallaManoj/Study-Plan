/**
 * Academic Resource Hub - Core Application Logic
 * Fast, keyboard-friendly semester & subject organizer for notes, docs, and YouTube videos.
 */

// State Object
const AppState = {
  data: {
    semesters: [],
    subjects: [],
    resources: []
  },
  currentSemesterId: null,
  currentSubjectId: 'all',
  currentTypeFilter: 'all',
  searchQuery: '',
  theme: localStorage.getItem('hub_theme') || 'auto'
};

// Storage Key
const STORAGE_KEY = 'academic_hub_my_plan_v2';

// YouTube URL parser
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// ==========================================================================
// Initialization & Persistence
// ==========================================================================

function initApp() {
  loadData();
  applyTheme(AppState.theme);
  setupEventListeners();
  setupKeyboardShortcuts();
  setupDialogFallbacks();

  // Set default active semester
  if (AppState.data.semesters.length > 0) {
    AppState.currentSemesterId = AppState.data.semesters[0].id;
  }

  renderAll();
}

function loadData() {
  // Clear any older keys
  localStorage.removeItem('academic_resource_hub_v1');
  localStorage.removeItem('academic_hub_single_semester_v1');
  localStorage.removeItem('academic_hub_custom_user_v1');

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      AppState.data = JSON.parse(stored);
      if (!AppState.data.semesters || AppState.data.semesters.length === 0) {
        AppState.data.semesters = DEFAULT_ACADEMIC_DATA.semesters;
      }
      if (!Array.isArray(AppState.data.subjects)) AppState.data.subjects = DEFAULT_ACADEMIC_DATA.subjects;
      if (!Array.isArray(AppState.data.resources)) AppState.data.resources = DEFAULT_ACADEMIC_DATA.resources;
    } catch (e) {
      AppState.data = DEFAULT_ACADEMIC_DATA;
      saveData();
    }
  } else {
    // Load user's exact plan data
    AppState.data = DEFAULT_ACADEMIC_DATA;
    saveData();
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    showToast('Warning: LocalStorage quota exceeded!', 'error');
  }
}

// ==========================================================================
// Theme Management
// ==========================================================================

function applyTheme(theme) {
  AppState.theme = theme;
  localStorage.setItem('hub_theme', theme);

  const html = document.documentElement;
  if (theme === 'auto') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', theme);
  }

  // Update theme toggle button icon
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    if (theme === 'dark') {
      themeBtn.innerHTML = '🌙';
      themeBtn.title = 'Current: Dark theme (click to switch to Auto)';
    } else if (theme === 'light') {
      themeBtn.innerHTML = '☀️';
      themeBtn.title = 'Current: Light theme (click to switch to Dark)';
    } else {
      themeBtn.innerHTML = '🌓';
      themeBtn.title = 'Current: System theme (click to switch to Light)';
    }
  }
}

function toggleNextTheme() {
  if (AppState.theme === 'auto') {
    applyTheme('light');
  } else if (AppState.theme === 'light') {
    applyTheme('dark');
  } else {
    applyTheme('auto');
  }
}

// ==========================================================================
// Rendering Logic
// ==========================================================================

function renderAll() {
  renderSidebar();
  renderSemesterBanner();
  renderSubjectChips();
  renderResourcesGrid();
  updateGlobalStats();
}

function renderSidebar() {
  const currentSem = AppState.data.semesters[0] || { id: 'sem-1', title: 'Semester 1' };
  const semResourcesCount = AppState.data.resources.filter(r => r.semesterId === currentSem.id).length;

  const titleEl = document.getElementById('sidebarSemTitle');
  const countEl = document.getElementById('sidebarSemCount');
  if (titleEl) titleEl.textContent = `🎓 ${currentSem.title}`;
  if (countEl) countEl.textContent = semResourcesCount;

  // Render subject list in sidebar for fast 1-click retrieval
  const container = document.getElementById('sidebarSubjectList');
  if (!container) return;

  container.innerHTML = '';

  const subjects = AppState.data.subjects.filter(s => s.semesterId === currentSem.id);
  const allCount = AppState.data.resources.filter(r => r.semesterId === currentSem.id).length;

  if (subjects.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.25rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <p style="margin-bottom: 0.75rem;">No subjects yet</p>
        <button type="button" class="btn btn-secondary" onclick="openAddSubjectModal()" style="font-size: 0.82rem; width: 100%;">
          ➕ Add Subject
        </button>
      </div>
    `;
    return;
  }

  // "All Subjects" button
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `semester-item-btn ${AppState.currentSubjectId === 'all' ? 'active' : ''}`;
  allBtn.innerHTML = `
    <span>📁 All Subjects</span>
    <span class="semester-badge">${allCount}</span>
  `;
  allBtn.addEventListener('click', () => {
    AppState.currentSubjectId = 'all';
    renderSubjectChips();
    renderSidebar();
    renderResourcesGrid();
  });
  container.appendChild(allBtn);

  // Each subject button
  subjects.forEach(sub => {
    const subCount = AppState.data.resources.filter(r => r.subjectId === sub.id).length;
    const isSubActive = AppState.currentSubjectId === sub.id;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `semester-item-btn ${isSubActive ? 'active' : ''}`;
    btn.innerHTML = `
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${sub.code ? `<strong>${escapeHtml(sub.code)}:</strong> ` : ''}${escapeHtml(sub.name)}
      </span>
      <span class="semester-badge">${subCount}</span>
    `;

    btn.addEventListener('click', () => {
      AppState.currentSubjectId = sub.id;
      renderSubjectChips();
      renderSidebar();
      renderResourcesGrid();
    });

    container.appendChild(btn);
  });
}

function renderSemesterBanner() {
  const currentSem = AppState.data.semesters[0] || { id: 'sem-1', title: 'Semester 1' };
  const titleEl = document.getElementById('currentSemesterTitle');
  const countEl = document.getElementById('currentSemesterSubtitle');

  const semSubjects = AppState.data.subjects.filter(s => s.semesterId === currentSem.id);
  const semResources = AppState.data.resources.filter(r => r.semesterId === currentSem.id);

  if (titleEl) titleEl.innerHTML = `🎓 ${escapeHtml(currentSem.title)}`;
  if (countEl) {
    countEl.textContent = `${semSubjects.length} Subject${semSubjects.length === 1 ? '' : 's'} • ${semResources.length} Total Resource${semResources.length === 1 ? '' : 's'}`;
  }
}

function renderSubjectChips() {
  const container = document.getElementById('subjectChipsContainer');
  if (!container) return;

  container.innerHTML = '';

  const subjects = AppState.data.subjects.filter(s => s.semesterId === AppState.currentSemesterId);
  const allCount = AppState.data.resources.filter(r => r.semesterId === AppState.currentSemesterId).length;

  if (subjects.length === 0) {
    container.innerHTML = `
      <button type="button" class="btn btn-secondary" onclick="openAddSubjectModal()" style="font-size: 0.85rem;">
        ➕ Add Your First Subject
      </button>
    `;
    return;
  }

  // "All Subjects" chip
  const allChip = document.createElement('button');
  allChip.type = 'button';
  allChip.className = `subject-chip ${AppState.currentSubjectId === 'all' ? 'active' : ''}`;
  allChip.innerHTML = `All Subjects <span class="subject-chip-count">${allCount}</span>`;
  allChip.addEventListener('click', () => {
    AppState.currentSubjectId = 'all';
    renderSubjectChips();
    renderSidebar();
    renderResourcesGrid();
  });
  container.appendChild(allChip);

  // Individual Subject Chips
  subjects.forEach(sub => {
    const subCount = AppState.data.resources.filter(r => r.subjectId === sub.id).length;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `subject-chip ${AppState.currentSubjectId === sub.id ? 'active' : ''}`;
    chip.innerHTML = `${sub.code ? `<strong>${escapeHtml(sub.code)}:</strong> ` : ''}${escapeHtml(sub.name)} <span class="subject-chip-count">${subCount}</span>`;
    chip.addEventListener('click', () => {
      AppState.currentSubjectId = sub.id;
      renderSubjectChips();
      renderSidebar();
      renderResourcesGrid();
    });
    container.appendChild(chip);
  });
}

function renderResourcesGrid() {
  const container = document.getElementById('resourcesGrid');
  if (!container) return;

  container.innerHTML = '';

  // Filter logic
  let filtered = AppState.data.resources.filter(r => r.semesterId === AppState.currentSemesterId);

  if (AppState.currentSubjectId !== 'all') {
    filtered = filtered.filter(r => r.subjectId === AppState.currentSubjectId);
  }

  if (AppState.currentTypeFilter !== 'all') {
    if (AppState.currentTypeFilter === 'starred') {
      filtered = filtered.filter(r => r.isStarred);
    } else {
      filtered = filtered.filter(r => r.type === AppState.currentTypeFilter);
    }
  }

  // Quick text filter from toolbar
  const searchBarText = document.getElementById('quickFilterInput')?.value.trim().toLowerCase() || '';
  if (searchBarText) {
    filtered = filtered.filter(r => {
      const matchTitle = r.title.toLowerCase().includes(searchBarText);
      const matchDesc = (r.description || '').toLowerCase().includes(searchBarText);
      const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(searchBarText));
      return matchTitle || matchDesc || matchTags;
    });
  }

  // Clean empty state if no subjects exist yet
  if (AppState.data.subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <h3>No Subjects Added Yet</h3>
        <p>Start by adding your subjects (e.g. Mathematics, Operating Systems, Data Structures), then add your PDF notes, docs, and YouTube lectures under them.</p>
        <button class="btn btn-primary" onclick="openAddSubjectModal()">
          <span>➕ Add Your First Subject</span>
        </button>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <h3>No resources found</h3>
        <p>Add PDF notes, Google Docs, Notion links, or YouTube videos to this subject.</p>
        <button class="btn btn-primary" onclick="openAddResourceModal()">
          <span>➕ Add Study Resource</span>
        </button>
      </div>
    `;
    return;
  }

  // Render cards
  filtered.forEach(res => {
    const card = createResourceCard(res);
    container.appendChild(card);
  });
}

function createResourceCard(res) {
  const card = document.createElement('article');
  card.className = `resource-card ${res.isStarred ? 'starred' : ''}`;
  card.id = `card-${res.id}`;

  const subject = AppState.data.subjects.find(s => s.id === res.subjectId);
  const subjectName = subject ? `${subject.code ? subject.code + ' - ' : ''}${subject.name}` : 'General';

  // Badge mapping
  const badgeConfig = {
    pdf: { label: '📄 PDF Notes', class: 'badge-pdf' },
    doc: { label: '📝 Doc / Notes', class: 'badge-doc' },
    youtube: { label: '🎥 YouTube', class: 'badge-youtube' },
    link: { label: '🔗 Web Link', class: 'badge-link' }
  };
  const badge = badgeConfig[res.type] || { label: '🔗 Resource', class: 'badge-link' };

  // YouTube preview thumbnail
  let previewHtml = '';
  if (res.type === 'youtube' && res.youtubeId) {
    previewHtml = `
      <div class="yt-thumbnail-wrapper" onclick="openYouTubeViewer('${escapeHtml(res.youtubeId)}', '${escapeHtml(res.title)}')">
        <img class="yt-thumbnail-img" src="https://img.youtube.com/vi/${res.youtubeId}/mqdefault.jpg" alt="${escapeHtml(res.title)}" loading="lazy">
        <div class="yt-play-overlay">▶</div>
      </div>
    `;
  }

  // Tags HTML
  const tagsHtml = (res.tags && res.tags.length > 0)
    ? `<div class="tags-container">
        ${res.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
       </div>`
    : '';

  // Primary Action Button
  let primaryBtnHtml = '';
  if (res.type === 'youtube') {
    primaryBtnHtml = `
      <button type="button" class="card-btn-action" onclick="openYouTubeViewer('${escapeHtml(res.youtubeId || '')}', '${escapeHtml(res.title)}')">
        ▶ Watch Video
      </button>
    `;
  } else if (res.fileId) {
    const sizeStr = res.fileSize ? `(${formatBytes(res.fileSize)})` : '';
    primaryBtnHtml = `
      <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
        <button type="button" class="card-btn-action" onclick="openOfflineFile('${res.fileId}', '${escapeHtml(res.title)}')">
          📂 Read Notes ${sizeStr}
        </button>
        <button type="button" class="btn btn-secondary" onclick="downloadOfflineFile('${res.fileId}')" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" title="Download file to computer">
          ⬇️
        </button>
      </div>
    `;
  } else if (res.url) {
    primaryBtnHtml = `
      <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="card-btn-action">
        ↗ Open Link
      </a>
    `;
  }

  card.innerHTML = `
    <div class="card-top">
      <span class="resource-badge ${badge.class}">${badge.label}</span>
      <div class="card-top-actions">
        <button type="button" class="star-btn ${res.isStarred ? 'active' : ''}" onclick="toggleStar('${res.id}')" title="${res.isStarred ? 'Unpin' : 'Pin to favorites'}">
          ${res.isStarred ? '★' : '☆'}
        </button>
        <button type="button" class="card-options-btn" onclick="copyResourceLink('${res.id}')" title="Copy link">
          📋
        </button>
        <button type="button" class="card-options-btn" onclick="deleteResource('${res.id}')" title="Delete resource">
          🗑️
        </button>
      </div>
    </div>

    ${previewHtml}

    <div class="card-title-group">
      <span class="card-subject-tag">${escapeHtml(subjectName)}</span>
      <h3>${escapeHtml(res.title)}</h3>
      ${res.description ? `<p class="card-description">${escapeHtml(res.description)}</p>` : ''}
    </div>

    ${tagsHtml}

    <div class="card-footer">
      ${primaryBtnHtml}
      <button type="button" class="card-options-btn" onclick="openEditResourceModal('${res.id}')" title="Edit resource">
        ✏️ Edit
      </button>
    </div>
  `;

  return card;
}

function updateGlobalStats() {
  const totalNotes = AppState.data.resources.filter(r => r.type === 'pdf').length;
  const totalDocs = AppState.data.resources.filter(r => r.type === 'doc').length;
  const totalVideos = AppState.data.resources.filter(r => r.type === 'youtube').length;
  const totalSubjects = AppState.data.subjects.length;

  document.getElementById('statTotalSubjects').textContent = totalSubjects;
  document.getElementById('statTotalPDFs').textContent = totalNotes;
  document.getElementById('statTotalDocs').textContent = totalDocs;
  document.getElementById('statTotalVideos').textContent = totalVideos;
}

// ==========================================================================
// Actions: Star, Delete, Copy
// ==========================================================================

function toggleStar(resId) {
  const resource = AppState.data.resources.find(r => r.id === resId);
  if (!resource) return;

  resource.isStarred = !resource.isStarred;
  saveData();
  renderResourcesGrid();
  showToast(resource.isStarred ? '⭐ Pinned to favorites!' : 'Unpinned from favorites');
}

function deleteResource(resId) {
  const resource = AppState.data.resources.find(r => r.id === resId);
  if (!resource) return;

  if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
    // If it had a local file in IndexedDB, remove it
    if (resource.fileId && window.resourceDB) {
      window.resourceDB.deleteFile(resource.fileId).catch(console.error);
    }
    AppState.data.resources = AppState.data.resources.filter(r => r.id !== resId);
    saveData();
    renderAll();
    showToast('Resource deleted');
  }
}

function copyResourceLink(resId) {
  const resource = AppState.data.resources.find(r => r.id === resId);
  if (!resource) return;

  const textToCopy = resource.url || window.location.href;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('📋 Link copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

// Utility to format byte sizes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ==========================================================================
// Modals & Forms Management (Modern Web Guidance)
// ==========================================================================

function openUploadNotesModal() {
  if (AppState.data.subjects.length === 0) {
    showToast('Please add a subject first before adding notes!', 'info');
    openAddSubjectModal();
    return;
  }

  openAddResourceModal();
  selectResourceType('pdf');
  document.getElementById('resourceModalTitle').textContent = '📤 Upload Subject Notes';

  // Pre-select currently filtered subject if applicable
  if (AppState.currentSubjectId && AppState.currentSubjectId !== 'all') {
    const subSelect = document.getElementById('resSubjectSelect');
    if (subSelect) subSelect.value = AppState.currentSubjectId;
  }
}

function openAddResourceModal() {
  if (AppState.data.subjects.length === 0) {
    showToast('Please add a subject first before adding notes!', 'info');
    openAddSubjectModal();
    return;
  }

  const modal = document.getElementById('resourceDialog');
  const form = document.getElementById('resourceForm');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('resourceModalTitle').textContent = 'Add Study Resource';
  document.getElementById('resourceEditId').value = '';

  // Reset file dropzone UI
  const dropzone = document.getElementById('fileDropzone');
  const promptEl = document.getElementById('fileUploadPrompt');
  const hintEl = document.getElementById('fileUploadHint');
  const iconEl = document.getElementById('fileDropzoneIcon');
  if (dropzone) dropzone.classList.remove('has-file', 'dragover');
  if (promptEl) promptEl.textContent = 'Drag & drop your PDF notes here, or click to browse';
  if (hintEl) hintEl.textContent = 'Supports PDF, DOC, DOCX, PPT, PPTX, TXT (Saved offline in your browser IndexedDB)';
  if (iconEl) iconEl.textContent = '📤';

  const activeSemId = AppState.data.semesters[0]?.id || 'sem-1';
  const semInput = document.getElementById('resSemesterSelect');
  if (semInput) semInput.value = activeSemId;

  // Populate subject dropdown (pre-selecting current active subject)
  const defaultSubjectId = AppState.currentSubjectId !== 'all' ? AppState.currentSubjectId : null;
  updateSubjectDropdown(activeSemId, defaultSubjectId);

  // Default type selection to 'pdf'
  selectResourceType('pdf');

  // Open modal using native showModal()
  modal.showModal();
}

function openEditResourceModal(resId) {
  const resource = AppState.data.resources.find(r => r.id === resId);
  if (!resource) return;

  const modal = document.getElementById('resourceDialog');
  if (!modal) return;

  document.getElementById('resourceModalTitle').textContent = 'Edit Study Resource';
  document.getElementById('resourceEditId').value = resource.id;

  const activeSemId = AppState.data.semesters[0]?.id || 'sem-1';
  const semInput = document.getElementById('resSemesterSelect');
  if (semInput) semInput.value = activeSemId;

  // Update subjects and select
  updateSubjectDropdown(activeSemId, resource.subjectId);

  // Type
  selectResourceType(resource.type);

  // Fields
  document.getElementById('resTitleInput').value = resource.title || '';
  document.getElementById('resUrlInput').value = resource.url || '';
  document.getElementById('resDescInput').value = resource.description || '';
  document.getElementById('resTagsInput').value = (resource.tags || []).join(', ');

  modal.showModal();
}

function updateSubjectDropdown(semesterId, selectedSubjectId = null) {
  const subSelect = document.getElementById('resSubjectSelect');
  if (!subSelect) return;

  subSelect.innerHTML = '';
  const subjects = AppState.data.subjects.filter(s => s.semesterId === semesterId);

  if (subjects.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No subjects in this semester. Add one first!';
    subSelect.appendChild(opt);
    return;
  }

  subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = `${sub.code ? sub.code + ' - ' : ''}${sub.name}`;
    if (selectedSubjectId ? sub.id === selectedSubjectId : sub.id === AppState.currentSubjectId) {
      opt.selected = true;
    }
    subSelect.appendChild(opt);
  });
}

function selectResourceType(type) {
  document.getElementById('resTypeInput').value = type;
  document.querySelectorAll('.type-option-btn').forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Toggle file upload area vs URL field
  const fileArea = document.getElementById('fileUploadSection');
  const urlLabel = document.getElementById('resUrlLabel');
  const urlInput = document.getElementById('resUrlInput');

  if (type === 'pdf' || type === 'doc') {
    if (fileArea) fileArea.style.display = 'block';
    if (urlLabel) urlLabel.textContent = 'Or Paste Resource Web / Drive URL';
    if (urlInput) urlInput.placeholder = 'https://drive.google.com/... or https://...pdf';
  } else if (type === 'youtube') {
    if (fileArea) fileArea.style.display = 'none';
    if (urlLabel) urlLabel.textContent = 'YouTube Video or Playlist URL *';
    if (urlInput) urlInput.placeholder = 'https://www.youtube.com/watch?v=...';
  } else {
    if (fileArea) fileArea.style.display = 'none';
    if (urlLabel) urlLabel.textContent = 'Resource URL *';
    if (urlInput) urlInput.placeholder = 'https://...';
  }
}

// Handle Resource Form Save
async function handleResourceFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('resourceEditId').value;
  const semesterId = document.getElementById('resSemesterSelect')?.value || AppState.data.semesters[0]?.id || 'sem-1';
  const subjectId = document.getElementById('resSubjectSelect').value;
  const type = document.getElementById('resTypeInput').value || 'pdf';
  const rawTitle = document.getElementById('resTitleInput').value.trim();
  const url = document.getElementById('resUrlInput').value.trim();
  const description = document.getElementById('resDescInput').value.trim();
  const tagsRaw = document.getElementById('resTagsInput').value;
  const fileInput = document.getElementById('resFileInput');

  if (!subjectId) {
    showToast('Please select or create a subject first!', 'error');
    return;
  }

  const hasFile = fileInput && fileInput.files && fileInput.files[0];
  const file = hasFile ? fileInput.files[0] : null;

  // Auto-fill title from file name if title is empty
  let finalTitle = rawTitle;
  if (!finalTitle && file) {
    finalTitle = file.name.replace(/\.[^/.]+$/, "");
  }

  if (!finalTitle) {
    showToast('Please enter a title or select a file to upload', 'error');
    return;
  }

  // Parse tags
  const tags = tagsRaw.split(',')
    .map(t => t.trim().replace(/^#/, ''))
    .filter(t => t.length > 0);

  // Check YouTube ID
  let youtubeId = null;
  if (type === 'youtube' && url) {
    youtubeId = extractYouTubeId(url);
  }

  // Check file upload (stores in IndexedDB)
  let fileId = null;
  let fileName = null;
  let fileSize = null;
  if (file) {
    fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    fileName = file.name;
    fileSize = file.size;
    try {
      await window.resourceDB.saveFile(fileId, file, file.name, file.type);
      showToast(`Uploaded ${file.name} to offline library!`);
    } catch (err) {
      console.error('Failed to save file to IndexedDB', err);
      showToast('Warning: Failed to save file offline.', 'error');
    }
  }

  if (editId) {
    // Update existing
    const existing = AppState.data.resources.find(r => r.id === editId);
    if (existing) {
      existing.semesterId = semesterId;
      existing.subjectId = subjectId;
      existing.type = type;
      existing.title = finalTitle;
      existing.url = url;
      existing.description = description;
      existing.tags = tags;
      if (youtubeId) existing.youtubeId = youtubeId;
      if (fileId) {
        existing.fileId = fileId;
        existing.fileName = fileName;
        existing.fileSize = fileSize;
      }
    }
    showToast('Resource updated successfully!');
  } else {
    // Create new
    const newRes = {
      id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      semesterId,
      subjectId,
      type,
      title: finalTitle,
      url,
      youtubeId,
      fileId,
      fileName,
      fileSize,
      description,
      tags,
      isStarred: false,
      createdAt: new Date().toISOString()
    };
    AppState.data.resources.unshift(newRes);
    showToast(`✨ Notes added: "${finalTitle}"!`);
  }

  saveData();
  document.getElementById('resourceDialog').close();
  renderAll();
}

// Add Subject Modal
function openAddSubjectModal() {
  const modal = document.getElementById('subjectDialog');
  const form = document.getElementById('subjectForm');
  if (!modal || !form) return;

  form.reset();
  const activeSemId = AppState.data.semesters[0]?.id || 'sem-1';
  const semInput = document.getElementById('subSemesterSelect');
  if (semInput) semInput.value = activeSemId;

  modal.showModal();
}

function handleSubjectFormSubmit(e) {
  e.preventDefault();

  const semesterId = document.getElementById('subSemesterSelect')?.value || AppState.data.semesters[0]?.id || 'sem-1';
  const name = document.getElementById('subNameInput').value.trim();
  const code = document.getElementById('subCodeInput').value.trim().toUpperCase();

  if (!name) {
    showToast('Please enter a subject name', 'error');
    return;
  }

  const newSub = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    semesterId,
    code,
    name
  };

  AppState.data.subjects.push(newSub);
  saveData();

  document.getElementById('subjectDialog').close();
  AppState.currentSubjectId = newSub.id;
  renderAll();
  showToast(`📚 Subject "${name}" created!`);
}

// Rename Semester Modal
function openRenameSemesterModal() {
  const modal = document.getElementById('semesterDialog');
  if (!modal) return;

  const currentSem = AppState.data.semesters[0] || { title: 'Semester 1' };
  const input = document.getElementById('semTitleInput');
  if (input) input.value = currentSem.title;

  modal.showModal();
}

function handleSemesterFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('semTitleInput').value.trim();
  if (!title) {
    showToast('Please enter a semester title', 'error');
    return;
  }

  if (AppState.data.semesters[0]) {
    AppState.data.semesters[0].title = title;
  } else {
    AppState.data.semesters = [{ id: 'sem-1', number: 1, title }];
  }

  saveData();
  document.getElementById('semesterDialog').close();
  renderAll();
  showToast(`🎓 Semester renamed to "${title}"!`);
}

// ==========================================================================
// Media Viewers: YouTube & Offline PDF Viewer
// ==========================================================================

function openYouTubeViewer(youtubeId, title) {
  if (!youtubeId) {
    showToast('No YouTube video ID found', 'error');
    return;
  }

  const dialog = document.getElementById('videoViewerDialog');
  const container = document.getElementById('videoIframeContainer');
  const titleEl = document.getElementById('videoModalTitle');
  const openExternalBtn = document.getElementById('videoExternalLinkBtn');

  if (titleEl) titleEl.textContent = title || 'Watch Lecture';
  if (openExternalBtn) {
    openExternalBtn.href = `https://www.youtube.com/watch?v=${youtubeId}`;
  }

  container.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0"
      title="${escapeHtml(title)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  `;

  dialog.showModal();
}

async function openOfflineFile(fileId, title) {
  if (!window.resourceDB) return;

  try {
    const record = await window.resourceDB.getFile(fileId);
    if (!record || !record.blob) {
      showToast('File not found in local offline storage', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(record.blob);
    const dialog = document.getElementById('pdfViewerDialog');
    const container = document.getElementById('pdfIframeContainer');
    const titleEl = document.getElementById('pdfModalTitle');
    const downloadBtn = document.getElementById('pdfDownloadBtn');

    const cleanTitle = title || record.name || 'View Notes';
    if (titleEl) titleEl.textContent = cleanTitle;
    if (downloadBtn) {
      downloadBtn.href = objectUrl;
      downloadBtn.download = record.name || 'study-notes.pdf';
    }

    const name = (record.name || '').toLowerCase();
    const type = (record.type || '').toLowerCase();
    const isEmbeddable = type === 'application/pdf' || name.endsWith('.pdf') || type.startsWith('image/') || type.startsWith('text/') || name.endsWith('.txt');

    if (isEmbeddable) {
      container.innerHTML = `
        <iframe src="${objectUrl}" title="${escapeHtml(cleanTitle)}" style="width: 100%; height: 75vh; border: none; border-radius: var(--radius-md);"></iframe>
      `;
    } else {
      container.innerHTML = `
        <div style="padding: 3rem 1.5rem; text-align: center;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">📄</div>
          <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${escapeHtml(record.name || cleanTitle)}</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.95rem;">
            This file (${record.name ? record.name.split('.').pop().toUpperCase() : 'Doc'}) is stored offline in your browser. Click below to download and view it.
          </p>
          <a href="${objectUrl}" download="${record.name || 'notes'}" class="btn btn-primary" style="font-size: 0.95rem; padding: 0.65rem 1.25rem;">
            ⬇️ Download ${escapeHtml(record.name || 'File')}
          </a>
        </div>
      `;
    }

    dialog.showModal();
  } catch (err) {
    console.error('Error opening file:', err);
    showToast('Could not open offline file', 'error');
  }
}

async function downloadOfflineFile(fileId) {
  if (!window.resourceDB) return;
  try {
    const record = await window.resourceDB.getFile(fileId);
    if (!record || !record.blob) {
      showToast('File not found in offline storage', 'error');
      return;
    }
    const url = URL.createObjectURL(record.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.name || 'study-notes.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`⬇️ Downloaded: ${record.name}`);
  } catch (err) {
    showToast('Download failed', 'error');
  }
}

// Clean up video or PDF when modal closes
function cleanUpViewers() {
  const videoContainer = document.getElementById('videoIframeContainer');
  if (videoContainer) videoContainer.innerHTML = '';

  const pdfContainer = document.getElementById('pdfIframeContainer');
  if (pdfContainer) pdfContainer.innerHTML = '';
}

// Master Action Plan Viewer
function openMasterPlanModal() {
  const modal = document.getElementById('masterPlanDialog');
  const content = document.getElementById('masterPlanContent');
  if (modal && content) {
    content.textContent = MASTER_PLAN_RAW_TEXT;
    modal.showModal();
  }
}

function copyMasterPlanText() {
  if (navigator.clipboard && window.MASTER_PLAN_RAW_TEXT) {
    navigator.clipboard.writeText(window.MASTER_PLAN_RAW_TEXT).then(() => {
      showToast('📋 Plan copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  } else if (typeof MASTER_PLAN_RAW_TEXT !== 'undefined') {
    navigator.clipboard.writeText(MASTER_PLAN_RAW_TEXT).then(() => {
      showToast('📋 Plan copied to clipboard!');
    });
  }
}

// ==========================================================================
// Global Quick Search (Cmd+K)
// ==========================================================================

function openQuickSearchModal() {
  const modal = document.getElementById('searchDialog');
  const input = document.getElementById('globalSearchInput');
  if (!modal) return;

  modal.showModal();
  if (input) {
    input.value = '';
    input.focus();
    renderSearchResults('');
  }
}

function handleGlobalSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  renderSearchResults(query);
}

function renderSearchResults(query) {
  const container = document.getElementById('searchResultsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!query) {
    // Show starred or recent resources
    const favorites = AppState.data.resources.filter(r => r.isStarred).slice(0, 8);
    if (favorites.length === 0) {
      container.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          Type anything to search across all semesters, subjects, notes, docs, and YouTube videos...
        </div>
      `;
      return;
    }

    const heading = document.createElement('div');
    heading.style.padding = '0.4rem 0.6rem';
    heading.style.fontSize = '0.78rem';
    heading.style.fontWeight = '700';
    heading.style.textTransform = 'uppercase';
    heading.style.color = 'var(--text-muted)';
    heading.textContent = '⭐ Pinned & Favorite Resources';
    container.appendChild(heading);

    favorites.forEach(res => {
      container.appendChild(createSearchResultItem(res));
    });
    return;
  }

  // Filter across ALL semesters and subjects
  const matches = AppState.data.resources.filter(r => {
    const sem = AppState.data.semesters.find(s => s.id === r.semesterId);
    const sub = AppState.data.subjects.find(s => s.id === r.subjectId);

    const semTitle = sem ? sem.title.toLowerCase() : '';
    const subName = sub ? sub.name.toLowerCase() : '';
    const subCode = sub ? (sub.code || '').toLowerCase() : '';
    const title = r.title.toLowerCase();
    const desc = (r.description || '').toLowerCase();
    const tags = (r.tags || []).join(' ').toLowerCase();

    return semTitle.includes(query) ||
           subName.includes(query) ||
           subCode.includes(query) ||
           title.includes(query) ||
           desc.includes(query) ||
           tags.includes(query);
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        No resources matched "<strong>${escapeHtml(query)}</strong>"
      </div>
    `;
    return;
  }

  matches.forEach(res => {
    container.appendChild(createSearchResultItem(res));
  });
}

function createSearchResultItem(res) {
  const item = document.createElement('div');
  item.className = 'search-result-item';

  const sem = AppState.data.semesters.find(s => s.id === res.semesterId);
  const sub = AppState.data.subjects.find(s => s.id === res.subjectId);

  const typeIcons = {
    pdf: '📄',
    doc: '📝',
    youtube: '🎥',
    link: '🔗'
  };

  item.innerHTML = `
    <div class="result-item-left">
      <span class="result-type-icon">${typeIcons[res.type] || '🔗'}</span>
      <div style="min-width: 0;">
        <div class="result-item-title">${escapeHtml(res.title)}</div>
        <div class="result-item-meta">
          <span>🎓 ${escapeHtml(sem ? sem.title : 'General')}</span>
          <span>•</span>
          <span>📚 ${escapeHtml(sub ? sub.name : 'Subject')}</span>
        </div>
      </div>
    </div>
    <span class="search-shortcut-badge">Jump ↵</span>
  `;

  item.addEventListener('click', () => {
    document.getElementById('searchDialog').close();
    jumpToResource(res);
  });

  return item;
}

function jumpToResource(res) {
  AppState.currentSemesterId = res.semesterId;
  AppState.currentSubjectId = res.subjectId;
  AppState.currentTypeFilter = 'all';

  renderAll();

  // Scroll to and highlight card
  setTimeout(() => {
    const card = document.getElementById(`card-${res.id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '3px solid var(--color-primary)';
      card.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)';
      setTimeout(() => {
        card.style.outline = '';
        card.style.boxShadow = '';
      }, 2500);
    }
  }, 100);
}

// ==========================================================================
// Backup, Export & Import
// ==========================================================================

function exportDataBackup() {
  const jsonStr = JSON.stringify(AppState.data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `academic-resources-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('💾 Backup exported successfully!');
}

function importDataBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.semesters || !imported.subjects || !imported.resources) {
        throw new Error('Invalid JSON format');
      }

      if (confirm('Importing will merge with or replace your current library. Proceed?')) {
        AppState.data = imported;
        saveData();
        if (AppState.data.semesters.length > 0) {
          AppState.currentSemesterId = AppState.data.semesters[0].id;
          AppState.currentSubjectId = 'all';
        }
        renderAll();
        showToast('🎉 Library restored successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error: Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
}

function resetToDefaultSample() {
  if (confirm('Reset your library back to the preloaded sample university courses and notes?')) {
    AppState.data = DEFAULT_ACADEMIC_DATA;
    saveData();
    AppState.currentSemesterId = AppState.data.semesters[0].id;
    AppState.currentSubjectId = 'all';
    renderAll();
    showToast('Reset to default course library');
  }
}

// ==========================================================================
// Modern Web Guidance: Light Dismiss Fallback for Safari (<dialog closedby>)
// ==========================================================================

function setupDialogFallbacks() {
  const dialogs = document.querySelectorAll('dialog');

  dialogs.forEach(dialog => {
    // Light dismiss fallback for browsers without closedby support (Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          dialog.close();
        }
      });
    }

    // Clean up iframes on close
    dialog.addEventListener('close', cleanUpViewers);
  });
}

// ==========================================================================
// Event Listeners & Keyboard Shortcuts
// ==========================================================================

function setupEventListeners() {
  // Theme Toggle
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleNextTheme);

  // Quick Search Header Box
  document.getElementById('headerSearchBox')?.addEventListener('click', openQuickSearchModal);
  document.getElementById('globalSearchInput')?.addEventListener('input', handleGlobalSearchInput);

  // Filter Toolbar Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      AppState.currentTypeFilter = e.currentTarget.getAttribute('data-filter');
      renderResourcesGrid();
    });
  });

  // Quick Filter Input inside toolbar
  document.getElementById('quickFilterInput')?.addEventListener('input', () => {
    renderResourcesGrid();
  });

  // Resource Form Submit
  document.getElementById('resourceForm')?.addEventListener('submit', handleResourceFormSubmit);

  // Subject Form Submit
  document.getElementById('subjectForm')?.addEventListener('submit', handleSubjectFormSubmit);

  // Semester Form Submit
  document.getElementById('semesterForm')?.addEventListener('submit', handleSemesterFormSubmit);

  // Dynamic dropdown update when semester changes in resource modal
  document.getElementById('resSemesterSelect')?.addEventListener('change', (e) => {
    updateSubjectDropdown(e.target.value);
  });

  // Resource Type Buttons in Modal
  document.querySelectorAll('.type-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-type');
      selectResourceType(type);
    });
  });

  // File dropzone click & drag-and-drop
  const dropzone = document.getElementById('fileDropzone');
  const fileInput = document.getElementById('resFileInput');
  const promptEl = document.getElementById('fileUploadPrompt');
  const hintEl = document.getElementById('fileUploadHint');
  const iconEl = document.getElementById('fileDropzoneIcon');
  const titleInput = document.getElementById('resTitleInput');

  function handleFileSelected(file) {
    if (!file) return;
    if (dropzone) dropzone.classList.add('has-file');
    if (iconEl) iconEl.textContent = '📄';
    if (promptEl) promptEl.textContent = `Selected: ${file.name}`;
    if (hintEl) hintEl.textContent = `Size: ${formatBytes(file.size)} • Click to choose a different file`;

    // Auto-fill title if empty
    if (titleInput && !titleInput.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      titleInput.value = cleanName;
    }
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelected(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });
  }

  // Backup buttons
  document.getElementById('exportBackupBtn')?.addEventListener('click', exportDataBackup);
  document.getElementById('importBackupInput')?.addEventListener('change', importDataBackup);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Focus search on Cmd+K or Ctrl+K or '/' (when not inside an input)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openQuickSearchModal();
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openQuickSearchModal();
    } else if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      openAddResourceModal();
    }
  });
}

// Toast Notification Utility
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

// HTML escape helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
