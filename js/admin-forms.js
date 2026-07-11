// ═══════════════════════════════════════════════════════════════════
// ADMIN FORMS — Form Builder & Manager
// ═══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── State ──
  let forms = [];
  let currentForm = null;
  let currentPageIndex = 0;
  let selectedQuestionId = null;

  const QUESTION_TYPES = [
    { value: 'short_text', label: 'Short Text', icon: '✏️' },
    { value: 'long_text', label: 'Long Text', icon: '📝' },
    { value: 'paragraph', label: 'Paragraph', icon: '📄' },
    { value: 'mcq', label: 'Multiple Choice', icon: '🔘' },
    { value: 'checkbox', label: 'Checkboxes', icon: '☑️' },
    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
    { value: 'linear_scale', label: 'Linear Scale', icon: '📊' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Phone Number', icon: '📱' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'time', label: 'Time', icon: '🕐' },
    { value: 'url', label: 'URL', icon: '🔗' },
    { value: 'rating', label: 'Rating', icon: '⭐' }
  ];

  function generateId() {
    return 'q_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function createDefaultQuestion(type = 'short_text') {
    return {
      id: generateId(),
      type,
      text: '',
      description: '',
      required: false,
      options: type === 'mcq' || type === 'checkbox' || type === 'dropdown' ? ['Option 1', 'Option 2'] : [],
      hasOtherOption: false,
      validation: {
        minLength: null, maxLength: null,
        minWords: null, maxWords: null,
        min: null, max: null,
        pattern: null, integerOnly: false,
        emailDomain: ''
      },
      scaleConfig: { min: 1, max: 5, minLabel: '', maxLabel: '' }
    };
  }

  function createDefaultForm() {
    return {
      id: 'form_' + Date.now(),
      title: 'Untitled Form',
      description: '',
      adminId: '',
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      pages: [{ title: 'Page 1', questions: [createDefaultQuestion('short_text')] }]
    };
  }

  // ── Firestore Helpers ──
  async function loadForms() {
    if (!window.db || !firebase.auth().currentUser) return;
    try {
      const snap = await window.db.collection('forms')
        .where('adminId', '==', firebase.auth().currentUser.uid)
        .orderBy('updatedAt', 'desc').get();
      forms = [];
      snap.forEach(doc => forms.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Error loading forms:', e);
      // If index not ready, try without orderBy
      try {
        const snap = await window.db.collection('forms')
          .where('adminId', '==', firebase.auth().currentUser.uid).get();
        forms = [];
        snap.forEach(doc => forms.push({ id: doc.id, ...doc.data() }));
        forms.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      } catch (e2) { console.error('Fallback load failed:', e2); }
    }
  }

  async function saveFormToDB(form) {
    if (!window.db || !firebase.auth().currentUser) return;
    form.adminId = firebase.auth().currentUser.uid;
    form.updatedAt = new Date().toISOString();
    try {
      await window.db.collection('forms').doc(form.id).set(form);
    } catch (e) { console.error('Error saving form:', e); }
  }

  async function deleteFormFromDB(formId) {
    if (!window.db) return;
    try {
      await window.db.collection('forms').doc(formId).delete();
      // Also delete responses subcollection would need Cloud Function, skip for now
    } catch (e) { console.error('Error deleting form:', e); }
  }

  // ── Dashboard ──
  window.renderFormsDashboard = async function() {
    await loadForms();
    const grid = document.getElementById('grid-forms');
    if (!grid) return;

    if (forms.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <svg viewBox="0 0 24 24" width="64" height="64" stroke="var(--text-tertiary)" stroke-width="1" fill="none" style="margin-bottom: 16px; opacity: 0.4;">
            <path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <p style="color: var(--text-secondary); font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">No forms yet</p>
          <p style="color: var(--text-tertiary); font-size: 0.9rem;">Create your first form to start collecting responses.</p>
        </div>`;
      return;
    }

    grid.innerHTML = forms.map(f => {
      const qCount = (f.pages || []).reduce((s, p) => s + (p.questions || []).length, 0);
      const status = f.isPublished ? '<span style="background:#10B981;color:white;padding:3px 10px;border-radius:9999px;font-size:0.75rem;font-weight:700;">Published</span>' : '<span style="background:var(--bg-alt);color:var(--text-secondary);padding:3px 10px;border-radius:9999px;font-size:0.75rem;font-weight:700;">Draft</span>';
      const date = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '';
      return `
        <div class="quiz-card" style="cursor: default;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--text); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.title || 'Untitled Form'}</h3>
            ${status}
          </div>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px;">${qCount} question${qCount !== 1 ? 's' : ''} · ${f.responseCount || 0} response${(f.responseCount || 0) !== 1 ? 's' : ''} · ${date}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button onclick="window.openFormEditor('${f.id}')" style="flex:1; padding:8px 12px; border-radius:8px; background:rgba(14,165,233,0.1); color:#0ea5e9; font-weight:600; border:none; cursor:pointer; font-size:0.85rem;">Edit</button>
            <button onclick="window.openFormResponses('${f.id}')" style="flex:1; padding:8px 12px; border-radius:8px; background:rgba(16,185,129,0.1); color:#10B981; font-weight:600; border:none; cursor:pointer; font-size:0.85rem;">Responses</button>
            <button onclick="window.shareForm('${f.id}')" style="padding:8px 12px; border-radius:8px; background:var(--bg-alt); color:var(--text-secondary); font-weight:600; border:none; cursor:pointer; font-size:0.85rem;">Share</button>
            <button onclick="window.deleteForm('${f.id}')" style="padding:8px 12px; border-radius:8px; background:rgba(239,68,68,0.1); color:#ef4444; font-weight:600; border:none; cursor:pointer; font-size:0.85rem;">Delete</button>
          </div>
        </div>`;
    }).join('');
  };

  // ── Form Actions ──
  window.openFormEditor = async function(formId) {
    if (formId) {
      const existing = forms.find(f => f.id === formId);
      if (existing) {
        currentForm = JSON.parse(JSON.stringify(existing));
      } else {
        await loadForms();
        const found = forms.find(f => f.id === formId);
        currentForm = found ? JSON.parse(JSON.stringify(found)) : createDefaultForm();
      }
    } else {
      currentForm = createDefaultForm();
    }
    currentPageIndex = 0;
    selectedQuestionId = null;
    document.getElementById('form-title-input').value = currentForm.title;
    document.getElementById('form-description-input').value = currentForm.description || '';
    updatePublishButton();
    renderPagesPanel();
    renderQuestions();
    hideQuestionSettings();
    if (window.showScreen) window.showScreen('screen-form-editor');
    if (window.hideSidebar) window.hideSidebar();
  };

  window.shareForm = function(formId) {
    const url = window.location.origin + window.location.pathname.replace('admin.html', 'form.html') + '?id=' + formId;
    navigator.clipboard.writeText(url).then(() => alert('Form link copied to clipboard!\n\n' + url));
  };

  window.deleteForm = async function(formId) {
    if (!confirm('Are you sure you want to delete this form? This cannot be undone.')) return;
    await deleteFormFromDB(formId);
    forms = forms.filter(f => f.id !== formId);
    window.renderFormsDashboard();
  };

  // ── Publish Toggle ──
  function updatePublishButton() {
    const btn = document.getElementById('btn-form-publish');
    if (!btn || !currentForm) return;
    if (currentForm.isPublished) {
      btn.textContent = 'Unpublish';
      btn.style.background = '#ef4444';
    } else {
      btn.textContent = 'Publish';
      btn.style.background = '#10B981';
    }
  }

  // ── Pages Panel ──
  function renderPagesPanel() {
    const container = document.getElementById('form-pages-list');
    if (!container || !currentForm) return;
    container.innerHTML = currentForm.pages.map((page, i) => {
      const isActive = i === currentPageIndex;
      const qCount = (page.questions || []).length;
      return `
        <div onclick="window.selectFormPage(${i})" style="padding:12px; border-radius:10px; cursor:pointer; margin-bottom:8px; transition:all 0.2s; ${isActive ? 'background:rgba(14,165,233,0.1); border:1px solid rgba(14,165,233,0.3);' : 'background:var(--bg-alt); border:1px solid transparent;'} display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:0.9rem; color:${isActive ? '#0ea5e9' : 'var(--text)'};">${page.title || 'Page ' + (i + 1)}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${qCount} question${qCount !== 1 ? 's' : ''}</div>
          </div>
          ${currentForm.pages.length > 1 ? `<button onclick="event.stopPropagation(); window.deleteFormPage(${i})" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary); padding:4px;" title="Delete page">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>` : ''}
        </div>`;
    }).join('');
  }

  window.selectFormPage = function(index) {
    currentPageIndex = index;
    selectedQuestionId = null;
    renderPagesPanel();
    renderQuestions();
    hideQuestionSettings();
  };

  window.deleteFormPage = function(index) {
    if (currentForm.pages.length <= 1) return;
    currentForm.pages.splice(index, 1);
    if (currentPageIndex >= currentForm.pages.length) currentPageIndex = currentForm.pages.length - 1;
    renderPagesPanel();
    renderQuestions();
    hideQuestionSettings();
  };

  // ── Question Cards ──
  function renderQuestions() {
    const container = document.getElementById('form-questions-container');
    if (!container || !currentForm) return;
    const page = currentForm.pages[currentPageIndex];
    if (!page || !page.questions || page.questions.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-tertiary);">No questions on this page yet. Click "Add Question" below.</div>';
      return;
    }
    container.innerHTML = page.questions.map((q, i) => {
      const typeInfo = QUESTION_TYPES.find(t => t.value === q.type) || { label: q.type, icon: '❓' };
      const isSelected = selectedQuestionId === q.id;
      return `
        <div class="form-question-card" onclick="window.selectQuestion('${q.id}')" style="background:var(--surface); border-radius:12px; padding:20px; margin-bottom:12px; cursor:pointer; transition:all 0.2s; border:2px solid ${isSelected ? '#0ea5e9' : 'transparent'}; box-shadow:${isSelected ? '0 0 0 3px rgba(14,165,233,0.15)' : '0 1px 3px rgba(0,0,0,0.06)'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex:1;">
              <span style="font-size:0.8rem; background:var(--bg-alt); padding:2px 8px; border-radius:6px; font-weight:600; color:var(--text-secondary);">${i + 1}</span>
              <span style="font-size:0.75rem; background:rgba(14,165,233,0.1); color:#0ea5e9; padding:2px 10px; border-radius:9999px; font-weight:600;">${typeInfo.icon} ${typeInfo.label}</span>
              ${q.required ? '<span style="color:#ef4444; font-weight:700; font-size:0.8rem;">Required</span>' : ''}
            </div>
            <div style="display:flex; gap:4px;">
              ${i > 0 ? `<button onclick="event.stopPropagation(); window.moveQuestion(${i}, ${i - 1})" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary); padding:4px;" title="Move up"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"/></svg></button>` : ''}
              ${i < page.questions.length - 1 ? `<button onclick="event.stopPropagation(); window.moveQuestion(${i}, ${i + 1})" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary); padding:4px;" title="Move down"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"/></svg></button>` : ''}
              <button onclick="event.stopPropagation(); window.duplicateQuestion(${i})" style="background:none; border:none; cursor:pointer; color:var(--text-tertiary); padding:4px;" title="Duplicate">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button onclick="event.stopPropagation(); window.deleteFormQuestion(${i})" style="background:none; border:none; cursor:pointer; color:#ef4444; padding:4px;" title="Delete">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div style="font-size:1rem; font-weight:600; color:var(--text); min-height:24px;">${q.text || '<span style="color:var(--text-tertiary); font-style:italic;">Untitled Question</span>'}</div>
          ${q.description ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">${q.description}</div>` : ''}
        </div>`;
    }).join('');
  }

  window.selectQuestion = function(qId) {
    selectedQuestionId = qId;
    renderQuestions();
    renderQuestionSettings();
  };

  window.moveQuestion = function(from, to) {
    const page = currentForm.pages[currentPageIndex];
    const [q] = page.questions.splice(from, 1);
    page.questions.splice(to, 0, q);
    renderQuestions();
  };

  window.duplicateQuestion = function(index) {
    const page = currentForm.pages[currentPageIndex];
    const dup = JSON.parse(JSON.stringify(page.questions[index]));
    dup.id = generateId();
    page.questions.splice(index + 1, 0, dup);
    renderQuestions();
    renderPagesPanel();
  };

  window.deleteFormQuestion = function(index) {
    const page = currentForm.pages[currentPageIndex];
    if (page.questions[index].id === selectedQuestionId) { selectedQuestionId = null; hideQuestionSettings(); }
    page.questions.splice(index, 1);
    renderQuestions();
    renderPagesPanel();
  };

  // ── Question Settings Panel (Right Sidebar) ──
  function hideQuestionSettings() {
    const placeholder = document.getElementById('form-question-settings-placeholder');
    const settings = document.getElementById('form-question-settings');
    if (placeholder) placeholder.style.display = 'block';
    if (settings) settings.style.display = 'none';
  }

  function renderQuestionSettings() {
    const placeholder = document.getElementById('form-question-settings-placeholder');
    const settingsDiv = document.getElementById('form-question-settings');
    if (!placeholder || !settingsDiv || !currentForm) return;

    const page = currentForm.pages[currentPageIndex];
    const q = page.questions.find(x => x.id === selectedQuestionId);
    if (!q) { hideQuestionSettings(); return; }

    placeholder.style.display = 'none';
    settingsDiv.style.display = 'block';

    const val = q.validation || {};
    const sc = q.scaleConfig || { min: 1, max: 5, minLabel: '', maxLabel: '' };

    let html = `
      <h3 style="margin:0 0 16px 0; font-weight:700; font-size:1rem;">Question Settings</h3>
      <div style="margin-bottom:16px;">
        <label style="display:block; margin-bottom:6px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Question Text</label>
        <textarea id="qs-text" rows="3" style="width:100%; border:1px solid var(--section-divider); border-radius:8px; padding:10px; font-family:inherit; font-size:0.9rem; resize:vertical; background:var(--bg); color:var(--text); outline:none;">${q.text || ''}</textarea>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block; margin-bottom:6px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Description (optional)</label>
        <input type="text" id="qs-desc" value="${q.description || ''}" placeholder="Helper text for respondent" style="width:100%; border:1px solid var(--section-divider); border-radius:8px; padding:10px; font-family:inherit; font-size:0.9rem; background:var(--bg); color:var(--text); outline:none;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block; margin-bottom:6px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Question Type</label>
        <select id="qs-type" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--section-divider); font-size:0.9rem; background:var(--bg); color:var(--text);">
          ${QUESTION_TYPES.map(t => `<option value="${t.value}" ${t.value === q.type ? 'selected' : ''}>${t.icon} ${t.label}</option>`).join('')}
        </select>
      </div>
      <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
        <label style="font-size:0.9rem; font-weight:600; color:var(--text);">Required</label>
        <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
          <input type="checkbox" id="qs-required" ${q.required ? 'checked' : ''} style="opacity:0; width:0; height:0;">
          <span style="position:absolute; top:0; left:0; right:0; bottom:0; background:${q.required ? '#0ea5e9' : '#cbd5e1'}; border-radius:12px; transition:0.3s;"></span>
          <span style="position:absolute; top:2px; left:${q.required ? '22px' : '2px'}; width:20px; height:20px; background:white; border-radius:50%; transition:0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
        </label>
      </div>`;

    // Options editor for MCQ, Checkbox, Dropdown
    if (['mcq', 'checkbox', 'dropdown'].includes(q.type)) {
      html += `
        <div style="margin-bottom:16px; border-top:1px solid var(--section-divider); padding-top:16px;">
          <label style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Options</label>
          <div id="qs-options-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
            ${(q.options || []).map((opt, oi) => `
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="text" value="${opt}" onchange="window.updateFormOption(${oi}, this.value)" style="flex:1; padding:8px 10px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text); outline:none;">
                <button onclick="window.removeFormOption(${oi})" style="background:none; border:none; cursor:pointer; color:#ef4444; padding:4px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>`).join('')}
          </div>
          <button onclick="window.addFormOption()" style="width:100%; padding:8px; border-radius:6px; border:1px dashed var(--text-tertiary); background:transparent; cursor:pointer; font-weight:600; color:var(--text-secondary); font-size:0.85rem;">+ Add Option</button>
          <div style="margin-top:8px;">
            <label style="cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.85rem; color:var(--text-secondary);">
              <input type="checkbox" id="qs-other" ${q.hasOtherOption ? 'checked' : ''} style="width:16px; height:16px; accent-color:#0ea5e9;">
              Add "Other" option
            </label>
          </div>
        </div>`;
    }

    // Linear Scale settings
    if (q.type === 'linear_scale') {
      html += `
        <div style="margin-bottom:16px; border-top:1px solid var(--section-divider); padding-top:16px;">
          <label style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Scale Settings</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Value</label><input type="number" id="qs-scale-min" value="${sc.min}" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
            <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Value</label><input type="number" id="qs-scale-max" value="${sc.max}" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Label</label><input type="text" id="qs-scale-min-label" value="${sc.minLabel || ''}" placeholder="e.g. Poor" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
            <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Label</label><input type="text" id="qs-scale-max-label" value="${sc.maxLabel || ''}" placeholder="e.g. Excellent" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          </div>
        </div>`;
    }

    // Validation section
    html += `<div style="border-top:1px solid var(--section-divider); padding-top:16px;">
      <label style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Validation</label>`;

    if (['short_text', 'paragraph'].includes(q.type)) {
      html += `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Length</label><input type="number" id="qs-val-minlen" value="${val.minLength || ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Length</label><input type="number" id="qs-val-maxlen" value="${val.maxLength || ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
        </div>`;
    }

    if (q.type === 'long_text') {
      html += `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Words</label><input type="number" id="qs-val-minwords" value="${val.minWords || ''}" placeholder="e.g. 100" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Words</label><input type="number" id="qs-val-maxwords" value="${val.maxWords || ''}" placeholder="e.g. 500" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
        </div>`;
    }

    if (q.type === 'number') {
      html += `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Value</label><input type="number" id="qs-val-min" value="${val.min != null ? val.min : ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Value</label><input type="number" id="qs-val-max" value="${val.max != null ? val.max : ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
        </div>
        <label style="cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">
          <input type="checkbox" id="qs-val-integer" ${val.integerOnly ? 'checked' : ''} style="width:16px; height:16px; accent-color:#0ea5e9;">
          Integer only (no decimals)
        </label>`;
    }

    if (q.type === 'email') {
      html += `
        <div style="margin-bottom:8px;">
          <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:4px;">Restrict Email Domain</label>
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-weight:600; color:var(--text-secondary);">@</span>
            <input type="text" id="qs-val-email-domain" value="${val.emailDomain || ''}" placeholder="e.g. iitgn.ac.in (leave blank for any)" style="flex:1; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);">
          </div>
          <p style="font-size:0.75rem; color:var(--text-tertiary); margin-top:4px;">Only emails ending with this domain will be accepted.</p>
        </div>`;
    }

    if (q.type === 'phone') {
      html += `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Digits</label><input type="number" id="qs-val-min" value="${val.min || ''}" placeholder="e.g. 10" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Digits</label><input type="number" id="qs-val-max" value="${val.max || ''}" placeholder="e.g. 15" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
        </div>`;
    }

    if (q.type === 'checkbox') {
      html += `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Min Selections</label><input type="number" id="qs-val-min" value="${val.min || ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
          <div><label style="font-size:0.75rem; color:var(--text-secondary);">Max Selections</label><input type="number" id="qs-val-max" value="${val.max || ''}" placeholder="—" style="width:100%; padding:8px; border:1px solid var(--section-divider); border-radius:6px; font-size:0.85rem; background:var(--bg); color:var(--text);"></div>
        </div>`;
    }

    html += `</div>`;

    settingsDiv.innerHTML = html;

    // Attach live-update listeners
    const applySettings = () => {
      const page = currentForm.pages[currentPageIndex];
      const q = page.questions.find(x => x.id === selectedQuestionId);
      if (!q) return;

      q.text = document.getElementById('qs-text')?.value || '';
      q.description = document.getElementById('qs-desc')?.value || '';
      const newType = document.getElementById('qs-type')?.value;
      if (newType && newType !== q.type) {
        q.type = newType;
        if (['mcq', 'checkbox', 'dropdown'].includes(newType) && (!q.options || q.options.length === 0)) {
          q.options = ['Option 1', 'Option 2'];
        }
        renderQuestionSettings(); // Re-render settings for new type
      }
      q.required = document.getElementById('qs-required')?.checked || false;

      // Validation
      if (!q.validation) q.validation = {};
      const v = q.validation;
      const getNum = id => { const el = document.getElementById(id); return el && el.value !== '' ? Number(el.value) : null; };
      v.minLength = getNum('qs-val-minlen');
      v.maxLength = getNum('qs-val-maxlen');
      v.minWords = getNum('qs-val-minwords');
      v.maxWords = getNum('qs-val-maxwords');
      v.min = getNum('qs-val-min');
      v.max = getNum('qs-val-max');
      v.integerOnly = document.getElementById('qs-val-integer')?.checked || false;
      v.emailDomain = document.getElementById('qs-val-email-domain')?.value || '';

      // Scale config
      if (q.type === 'linear_scale') {
        q.scaleConfig = {
          min: Number(document.getElementById('qs-scale-min')?.value) || 1,
          max: Number(document.getElementById('qs-scale-max')?.value) || 5,
          minLabel: document.getElementById('qs-scale-min-label')?.value || '',
          maxLabel: document.getElementById('qs-scale-max-label')?.value || ''
        };
      }

      // Other option
      const otherCb = document.getElementById('qs-other');
      if (otherCb) q.hasOtherOption = otherCb.checked;

      renderQuestions();
      renderPagesPanel();
    };

    settingsDiv.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('change', applySettings);
      if (el.tagName === 'TEXTAREA' || el.type === 'text') el.addEventListener('input', applySettings);
    });
  }

  // Option management
  window.updateFormOption = function(index, value) {
    const page = currentForm.pages[currentPageIndex];
    const q = page.questions.find(x => x.id === selectedQuestionId);
    if (q && q.options) { q.options[index] = value; }
  };

  window.removeFormOption = function(index) {
    const page = currentForm.pages[currentPageIndex];
    const q = page.questions.find(x => x.id === selectedQuestionId);
    if (q && q.options && q.options.length > 1) {
      q.options.splice(index, 1);
      renderQuestionSettings();
    }
  };

  window.addFormOption = function() {
    const page = currentForm.pages[currentPageIndex];
    const q = page.questions.find(x => x.id === selectedQuestionId);
    if (q) {
      if (!q.options) q.options = [];
      q.options.push('Option ' + (q.options.length + 1));
      renderQuestionSettings();
    }
  };

  // ── Responses Screen ──
  window.openFormResponses = async function(formId) {
    const form = forms.find(f => f.id === formId);
    if (!form) return;
    currentForm = JSON.parse(JSON.stringify(form));

    document.getElementById('form-responses-title').textContent = form.title + ' — Responses';
    if (window.showScreen) window.showScreen('screen-form-responses');
    if (window.hideSidebar) window.hideSidebar();

    // Load responses
    const thead = document.getElementById('form-responses-thead');
    const tbody = document.getElementById('form-responses-tbody');
    const countBadge = document.getElementById('form-response-count-badge');

    // Gather all question texts
    const allQuestions = [];
    (form.pages || []).forEach(p => (p.questions || []).forEach(q => allQuestions.push(q)));

    thead.innerHTML = '<th style="padding:12px; font-weight:700;">Submitted</th>' +
      allQuestions.map(q => `<th style="padding:12px; font-weight:700; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${q.text || 'Untitled'}</th>`).join('');

    if (!window.db) {
      tbody.innerHTML = '<tr><td colspan="20" style="text-align:center; padding:24px; color:var(--error);">Firebase not connected.</td></tr>';
      return;
    }

    try {
      tbody.innerHTML = '<tr><td colspan="20" style="text-align:center; padding:24px; color:var(--text-secondary);">Loading responses...</td></tr>';
      const snap = await window.db.collection('form_responses').doc(formId).collection('responses').orderBy('submittedAt', 'desc').get();
      const responses = [];
      snap.forEach(doc => responses.push({ id: doc.id, ...doc.data() }));

      countBadge.textContent = responses.length + ' response' + (responses.length !== 1 ? 's' : '');

      if (responses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="20" style="text-align:center; padding:40px; color:var(--text-secondary);">No responses yet.</td></tr>';
        return;
      }

      tbody.innerHTML = responses.map(r => {
        const date = r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—';
        const answers = r.answers || {};
        return '<tr style="border-bottom:1px solid var(--section-divider);">' +
          `<td style="padding:12px; font-size:0.85rem; color:var(--text-secondary); white-space:nowrap;">${date}</td>` +
          allQuestions.map(q => {
            let val = answers[q.id];
            if (Array.isArray(val)) val = val.join(', ');
            return `<td style="padding:12px; font-size:0.9rem; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${val != null ? val : '—'}</td>`;
          }).join('') +
          '</tr>';
      }).join('');

      // Store for CSV export
      window._formResponsesData = { questions: allQuestions, responses };
    } catch (e) {
      console.error('Error loading responses:', e);
      tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding:24px; color:var(--error);">Error loading: ${e.message}</td></tr>`;
    }
  };

  // ── Save Form ──
  async function saveCurrentForm() {
    if (!currentForm) return;
    currentForm.title = document.getElementById('form-title-input')?.value || 'Untitled Form';
    currentForm.description = document.getElementById('form-description-input')?.value || '';
    await saveFormToDB(currentForm);
    // Update local forms list
    const idx = forms.findIndex(f => f.id === currentForm.id);
    if (idx >= 0) forms[idx] = JSON.parse(JSON.stringify(currentForm));
    else forms.unshift(JSON.parse(JSON.stringify(currentForm)));
    alert('Form saved!');
  }

  // ── Event Wiring ──
  document.addEventListener('DOMContentLoaded', () => {
    // New form button
    const btnNew = document.getElementById('btn-new-form');
    if (btnNew) btnNew.addEventListener('click', () => window.openFormEditor(null));

    // Add question
    const btnAddQ = document.getElementById('btn-form-add-question');
    if (btnAddQ) btnAddQ.addEventListener('click', () => {
      if (!currentForm) return;
      const page = currentForm.pages[currentPageIndex];
      const newQ = createDefaultQuestion('short_text');
      page.questions.push(newQ);
      selectedQuestionId = newQ.id;
      renderQuestions();
      renderPagesPanel();
      renderQuestionSettings();
    });

    // Add page
    const btnAddPage = document.getElementById('btn-form-add-page');
    if (btnAddPage) btnAddPage.addEventListener('click', () => {
      if (!currentForm) return;
      const pageNum = currentForm.pages.length + 1;
      currentForm.pages.push({ title: 'Page ' + pageNum, questions: [] });
      currentPageIndex = currentForm.pages.length - 1;
      selectedQuestionId = null;
      renderPagesPanel();
      renderQuestions();
      hideQuestionSettings();
    });

    // Save form
    const btnSave = document.getElementById('btn-save-form');
    if (btnSave) btnSave.addEventListener('click', saveCurrentForm);

    // Back from editor
    const btnBack = document.getElementById('btn-form-editor-back');
    if (btnBack) btnBack.addEventListener('click', () => {
      if (window.showScreen) window.showScreen('screen-forms-dashboard');
      if (window.initSidebar) window.initSidebar();
      window.renderFormsDashboard();
    });

    // Back from responses
    const btnRespBack = document.getElementById('btn-form-responses-back');
    if (btnRespBack) btnRespBack.addEventListener('click', () => {
      if (window.showScreen) window.showScreen('screen-forms-dashboard');
      if (window.initSidebar) window.initSidebar();
      window.renderFormsDashboard();
    });

    // Publish/unpublish
    const btnPublish = document.getElementById('btn-form-publish');
    if (btnPublish) btnPublish.addEventListener('click', async () => {
      if (!currentForm) return;
      currentForm.isPublished = !currentForm.isPublished;
      currentForm.title = document.getElementById('form-title-input')?.value || 'Untitled Form';
      currentForm.description = document.getElementById('form-description-input')?.value || '';
      await saveFormToDB(currentForm);
      const idx = forms.findIndex(f => f.id === currentForm.id);
      if (idx >= 0) forms[idx] = JSON.parse(JSON.stringify(currentForm));
      else forms.unshift(JSON.parse(JSON.stringify(currentForm)));
      updatePublishButton();
      alert(currentForm.isPublished ? 'Form published! Respondents can now fill it out.' : 'Form unpublished.');
    });

    // Preview
    const btnPreview = document.getElementById('btn-form-preview');
    if (btnPreview) btnPreview.addEventListener('click', () => {
      if (!currentForm) return;
      const url = window.location.origin + window.location.pathname.replace('admin.html', 'form.html') + '?id=' + currentForm.id + '&preview=1';
      window.open(url, '_blank');
    });

    // Export CSV
    const btnExport = document.getElementById('btn-form-export-csv');
    if (btnExport) btnExport.addEventListener('click', () => {
      const data = window._formResponsesData;
      if (!data || !data.responses || data.responses.length === 0) { alert('No responses to export.'); return; }
      const headers = ['Submitted At', ...data.questions.map(q => q.text || 'Untitled')];
      const rows = data.responses.map(r => {
        const date = r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '';
        return [date, ...data.questions.map(q => {
          let v = (r.answers || {})[q.id];
          if (Array.isArray(v)) v = v.join('; ');
          return v != null ? String(v) : '';
        })];
      });
      let csv = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
      rows.forEach(row => { csv += row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n'; });
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (currentForm?.title || 'form') + '_responses.csv';
      a.click();
    });
  });

})();
