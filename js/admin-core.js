
  let quillEditor;
  document.addEventListener("DOMContentLoaded", () => {
    quillEditor = new Quill('#aq-quill-editor', {
      theme: 'snow',
      modules: {
        formula: true,
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['formula', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean']
        ]
      },
      placeholder: 'Enter the question text here...'
    });
  });
  
  function showCustomConfirm(message, title = "Are you sure?") {
    return new Promise((resolve) => {
      const overlay = document.getElementById('custom-modal-overlay');
      document.getElementById('custom-modal-title').textContent = title;
      document.getElementById('custom-modal-message').textContent = message;
      
      const btnCancel = document.getElementById('custom-modal-cancel');
      const btnConfirm = document.getElementById('custom-modal-confirm');
      
      const newCancel = btnCancel.cloneNode(true);
      const newConfirm = btnConfirm.cloneNode(true);
      btnCancel.parentNode.replaceChild(newCancel, btnCancel);
      btnConfirm.parentNode.replaceChild(newConfirm, btnConfirm);
      
      const close = (result) => {
        overlay.classList.remove('active');
        resolve(result);
      };
      
      newCancel.addEventListener('click', () => close(false));
      newConfirm.addEventListener('click', () => close(true));
      
      overlay.classList.add('active');
    });
  }
  
  function openImportModal() {
    document.getElementById('import-modal').style.display = 'flex';
    document.getElementById('modal-file-input').value = '';
    document.getElementById('modal-paste-text').value = '';
  }
  function switchModalTab(target) {
    document.querySelectorAll('.m-tab:not(.format-tab)').forEach(b => b.classList.remove('active'));
    document.querySelector(`.m-tab:not(.format-tab)[data-target="${target}"]`).classList.add('active');
    document.querySelectorAll('.m-pane:not(.format-pane)').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  }
  function openFormatModal(tab) {
    document.getElementById('format-modal').style.display = 'flex';
    switchFormatTab(tab);
  }
  function switchFormatTab(target) {
    document.querySelectorAll('.format-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`.format-tab[data-target="${target}"]`).classList.add('active');
    document.querySelectorAll('.format-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  }
  function copyText(id) {
    const el = document.getElementById(id);
    const btn = el.nextElementSibling;
    const oldText = btn.textContent;
    
    // Fallback for mobile without HTTPS
    if (!navigator.clipboard) {
      el.select();
      el.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        btn.textContent = 'Copied!';
      } catch (err) {
        btn.textContent = 'Failed';
      }
      setTimeout(() => btn.textContent = oldText, 2000);
      return;
    }
    
    navigator.clipboard.writeText(el.value).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = oldText, 2000);
    });
  }
  
  (function(){
    'use strict';
  
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = '1';
    const STORAGE_KEY = 'qs_admin_quizzes';
  
    // â”€â”€ State â”€â”€
    let quizzes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Sync with Firebase
    async function fetchQuizzesFromDB() {
      if (window.db) {
        try {
          const docRef = window.db.collection('global').doc('allQuizzes');
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const dataStr = docSnap.data().data;
            quizzes = JSON.parse(dataStr);
            localStorage.setItem(STORAGE_KEY, dataStr);
          }
        } catch (e) {
          console.error("Firebase fetch error", e);
        }
      }
    }
    let currentQuizId = null;
    let currentType = 'mcq';
    let editingQuestionIdx = null;
  
    function save() { 
      const dataStr = JSON.stringify(quizzes);
      localStorage.setItem(STORAGE_KEY, dataStr);
      if (window.db) {
        window.db.collection('global').doc('allQuizzes').set({ data: dataStr })
          .catch(e => console.error("Error saving to Firebase:", e));
      }
    }
    function genId() { return 'qz_' + Date.now() + '_' + Math.random().toString(36).substr(2,5); }
    function genCode() {
      const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let s;
      do {
        s = ''; 
        for(let i=0;i<8;i++) s += c[Math.floor(Math.random()*c.length)];
      } while (quizzes && quizzes.some(q => q.accessCode === s));
      return s;
    }
  
    // â”€â”€ Screen switching â”€â”€
    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      if (id !== 'screen-login' && typeof initSidebar === 'function') {
        initSidebar();
      }
    }
  
    // â”€â”€ LOGIN â”€â”€
    const loginForm = document.getElementById('login-form');
    const loginErr = document.getElementById('login-err');
    const inpUser = document.getElementById('inp-user');
    const inpPass = document.getElementById('inp-pass');
    const btnLogout = document.getElementById('btn-logout');
  
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const u = inpUser.value.trim();
        const p = inpPass.value.trim();
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Verifying...';
  
        try {
          if (!window.firebase) throw new Error("Firebase not connected");
          await firebase.auth().signInWithEmailAndPassword(u, p);
          
          sessionStorage.setItem('qs_admin','true');
          sessionStorage.setItem('qs_admin_id', u);
          await fetchQuizzesFromDB();
          showScreen('screen-dash');
          initSidebar();
          document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
          document.getElementById('sb-nav-dash').classList.add('active');
          renderDashboard();
        } catch(e) {
          console.error(e);
          loginErr.textContent = e.message || 'Invalid credentials. Please try again.';
          loginErr.classList.add('show');
          inpPass.value = '';
          inpPass.focus();
        }
  
        if (submitBtn) submitBtn.textContent = 'Login';
      });
    }
  
    // Forgot password
    const btnForgot = document.getElementById('btn-forgot-password');
    if (btnForgot) {
      btnForgot.addEventListener('click', async (e) => {
        e.preventDefault();
        const u = inpUser.value.trim();
        if (!u) {
          alert("Please enter your email address in the Email field first.");
          return;
        }
        try {
          await firebase.auth().sendPasswordResetEmail(u);
          alert("Password reset email sent! Check your inbox.");
        } catch(ex) {
          alert("Error: " + ex.message);
        }
      });
    }
  
    // Auto-login if session exists
    if (sessionStorage.getItem('qs_admin') === 'true') {
      fetchQuizzesFromDB().then(() => {
        showScreen('screen-dash');
        initSidebar();
        document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
        document.getElementById('sb-nav-dash').classList.add('active');
        renderDashboard();
      });
    }
  
    // Logout
    if (btnLogout) {
      btnLogout.addEventListener('click', async function() {
        if (confirm("Are you sure you want to logout?")) {
          try {
            if (window.firebase) await firebase.auth().signOut();
          } catch (ex) {}
          sessionStorage.removeItem('qs_admin');
          sessionStorage.removeItem('qs_admin_id');
          window.location.href = 'active-quiz.html';
        }
      });
    }
  
    // â”€â”€ DASHBOARD â”€â”€
    function renderDashboard() {
      const privGrid = document.getElementById('grid-private');
      const pubGrid = document.getElementById('grid-public');
      const archGrid = document.getElementById('grid-archive');
      
      quizzes.forEach(q => {
        if (!q.visibility) q.visibility = q.isPublic ? 'public' : 'private';
      });
  
      const privQuizzes = quizzes.filter(q => q.visibility === 'private');
      const pubQuizzes = quizzes.filter(q => q.visibility === 'public');
      const archQuizzes = quizzes.filter(q => q.visibility === 'archive');
  
      privGrid.innerHTML = privQuizzes.length === 0
        ? '<div class="empty-state">No tournament quizzes yet.</div>'
        : privQuizzes.map((q, i) => quizCardHTML(q, i)).join('');
  
      pubGrid.innerHTML = pubQuizzes.length === 0
        ? '<div class="empty-state">No practice quizzes yet.</div>'
        : pubQuizzes.map((q, i) => quizCardHTML(q, i)).join('');
        
      archGrid.innerHTML = archQuizzes.length === 0
        ? '<div class="empty-state">No archived quizzes yet.</div>'
        : archQuizzes.map((q, i) => quizCardHTML(q, i)).join('');
  
      // Click handlers
      document.querySelectorAll('.quiz-card').forEach(card => {
        card.addEventListener('click', () => openQuizAnalytics(card.dataset.id));
      });
      
      // Refresh global analytics if on dashboard
      fetchGlobalAnalytics();
    }
  
    function quizCardHTML(q, idx = 0) {
      let badge = '';
      if (q.visibility === 'public') badge = '<span class="qc-badge public">Public</span>';
      else if (q.visibility === 'private') badge = '<span class="qc-badge private">Private</span>';
      else badge = '<span class="qc-badge" style="background:#e2e8f0; color:#475569;">Archived</span>';
      
      const code = (q.accessCode && q.visibility === 'private') ? `<div class="qc-code">Code: ${q.accessCode}</div>` : 
'';
      const count = (q.questions || []).length;
      const time = q.totalTime ? Math.ceil(q.totalTime/60) + ' min' : 'â€”';
      return `<div class="quiz-card hover-elevate stagger-enter" data-id="${q.id}" style="animation-delay: ${idx * 
0.05}s">
        ${badge}
        <h3>${q.name || 'Untitled Quiz'}</h3>
        <div class="qc-meta"><span>${count} question${count!==1?'s':''}</span><span>${time}</span></div>
        ${code}
      </div>`;
    }
  
    // New Quiz
    document.getElementById('btn-new-quiz').addEventListener('click', function() {
      window.isAddingNewQuiz = true;
      const newQuiz = {
        id: genId(),
        name: 'New Quiz',
        totalTime: 900,
        isPublic: false,
        visibility: 'archive',
        accessCode: '',
        questions: [],
        created_at: new Date().toISOString()
      };
      quizzes.push(newQuiz);
      save();
      openEditor(newQuiz.id);
    });
  
    // â”€â”€ EDITOR â”€â”€
    function openEditor(id) {
      currentQuizId = id;
      const quiz = quizzes.find(q => q.id === id);
      if (!quiz) return;
      editingQuestionIdx = null;
  
      document.getElementById('editor-title').textContent = window.isAddingNewQuiz ? 'Add Quiz' : 'Edit Quiz';
      document.getElementById('ed-name').value = quiz.name || '';
      document.getElementById('ed-instructions').value = quiz.instructions || '';
      const attemptsEl = document.getElementById('ed-allowed-attempts');
      if (attemptsEl) attemptsEl.value = quiz.allowedAttempts || '1';
      
      const editorBody = document.querySelector('#screen-editor .editor-body');
      const existingHeader = document.getElementById('dynamic-editor-header');
      if (existingHeader) existingHeader.remove();
  
      const headerDiv = document.createElement('div');
      headerDiv.id = 'dynamic-editor-header';
      headerDiv.style.gridColumn = '1 / -1';
      headerDiv.style.display = 'flex';
      headerDiv.style.flexDirection = 'column';
      headerDiv.style.alignItems = 'flex-start';
      headerDiv.style.marginBottom = '24px';
      headerDiv.style.width = '100%';
  
      if (window.isAddingNewQuiz) {
        headerDiv.innerHTML = `<button class="btn-back" id="btn-editor-back-dynamic" style="background:#f1f5f9; 
color:#334155; padding: 10px 24px; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; cursor: pointer; 
border: none;">Back to Quiz Dashboard</button>`;
      } else {
        let qCount = quiz.questions ? quiz.questions.length : 0;
        let tTime = quiz.totalTime ? Math.ceil(quiz.totalTime/60) + ' min' : 'â€”';
        headerDiv.innerHTML = `
          <button class="btn-back" id="btn-editor-back-dynamic" style="background:#f1f5f9; color:#334155; padding: 
10px 24px; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; margin-bottom: 
12px;">Back to Quiz Analytics</button>
          <div style="text-align: left;">
            <div style="font-weight: 800; font-size: 1.75rem; margin-bottom: 4px;">${quiz.name || 'Untitled Quiz'}</div>
            <div style="color: var(--text-secondary); font-size: 1rem;">${qCount} questions â€¢ ${tTime}</div>
          </div>
        `;
      }
      editorBody.insertBefore(headerDiv, editorBody.firstChild);
  
      document.getElementById('btn-editor-back-dynamic').addEventListener('click', function() {
        if (window.isAddingNewQuiz) {
          showScreen('screen-dash');
          renderDashboard();
        } else {
          openQuizAnalytics(currentQuizId);
        }
      });
  
      // time will be set in renderQuestionList
  
      // Visibility
      if (!quiz.visibility) quiz.visibility = quiz.isPublic ? 'public' : 'private';
      const effVis = window.isAddingNewQuiz ? 'public' : quiz.visibility;
      document.getElementById('vis-public').classList.toggle('active', effVis === 'public');
      document.getElementById('vis-private').classList.toggle('active', effVis === 'private');
      
      const visArchive = document.getElementById('vis-archive');
      if (visArchive) visArchive.classList.toggle('active', effVis === 'archive');
      
      document.getElementById('code-section').style.display = effVis === 'private' ? 'block' : 'none';
      document.getElementById('ed-code').textContent = quiz.accessCode || '—';
  
      renderQuestionList(quiz);
      resetAddForm();
      showScreen('screen-editor');
    }
  
    function renderQuestionList(quiz) {
      const list = document.getElementById('ed-q-list');
      document.getElementById('ed-q-count').textContent = quiz.questions.length;
      if (quiz.questions.length === 0) {
        list.innerHTML = '<div class="empty-state">No questions yet. Add one below.</div>';
        return;
      }
      let totalTimeSec = 0;
      quiz.questions.forEach(q => totalTimeSec += (q.timer || 30));
      quiz.totalTime = totalTimeSec;
      const m = Math.floor(totalTimeSec / 60);
      const s = totalTimeSec % 60;
      document.getElementById('ed-time').value = `${m} min ${s} sec`;
  
      list.innerHTML = quiz.questions.map((q, i) => `
        <div class="q-item" data-idx="${i}">
          <span class="q-num">${i+1}</span>
          <span class="q-text">${q.question}</span>
          <span class="q-type-pill">${q.type}</span>
          <div class="q-actions">
            ${i > 0 ? `<button class="q-move q-up" data-idx="${i}">â†‘</button>` : ''}
            ${i < quiz.questions.length - 1 ? `<button class="q-move q-down" data-idx="${i}">â†“</button>` : ''}
            <button class="q-del" data-idx="${i}">Delete</button>
          </div>
        </div>
      `).join('');
  
      list.querySelectorAll('.q-up').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const idx = parseInt(this.dataset.idx);
          const temp = quiz.questions[idx];
          quiz.questions[idx] = quiz.questions[idx-1];
          quiz.questions[idx-1] = temp;
          save(); renderQuestionList(quiz);
        });
      });
  
      list.querySelectorAll('.q-down').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const idx = parseInt(this.dataset.idx);
          const temp = quiz.questions[idx];
          quiz.questions[idx] = quiz.questions[idx+1];
          quiz.questions[idx+1] = temp;
          save(); renderQuestionList(quiz);
        });
      });
  
      list.querySelectorAll('.q-del').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const idx = parseInt(this.dataset.idx);
          quiz.questions.splice(idx, 1);
          if (editingQuestionIdx === idx) resetAddForm();
          else if (editingQuestionIdx !== null && editingQuestionIdx > idx) editingQuestionIdx--;
          save();
          renderQuestionList(quiz);
        });
      });
  
      list.querySelectorAll('.q-item').forEach(item => {
        item.addEventListener('click', function() {
          loadQuestionIntoForm(parseInt(this.dataset.idx));
        });
      });
    }
  
    // Visibility toggle
    document.querySelectorAll('.vis-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.vis-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const isPrivate = this.dataset.vis === 'private';
        document.getElementById('code-section').style.display = isPrivate ? 'block' : 'none';
        if (isPrivate) {
          const quiz = quizzes.find(q => q.id === currentQuizId);
          if (quiz && !quiz.accessCode) {
            quiz.accessCode = genCode();
            save();
            document.getElementById('ed-code').textContent = quiz.accessCode;
          }
        }
      });
    });
  
    // Regenerate code
    document.getElementById('btn-regen-code').addEventListener('click', function() {
      const quiz = quizzes.find(q => q.id === currentQuizId);
      if (quiz) {
        quiz.accessCode = genCode();
        save();
        document.getElementById('ed-code').textContent = quiz.accessCode;
      }
    });
  
    // Type pills
    document.querySelectorAll('.type-pill').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.type-pill').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentType = this.dataset.type;
        document.getElementById('aq-opts-wrap').style.display = currentType === 'integer' ? 'none' : 'block';
        document.getElementById('aq-int-wrap').style.display = currentType === 'integer' ? 'block' : 'none';
        if (currentType === 'single') {
          document.querySelectorAll('.aq-chk').forEach(c => { c.type = 'radio'; c.name = 'aq-correct'; c.checked = 
false; });
        } else {
          document.querySelectorAll('.aq-chk').forEach(c => { c.type = 'checkbox'; c.name = ''; c.checked = false; });
        }
      });
    });
  
    // Add question
    document.getElementById('btn-add-q').addEventListener('click', function() {
      const quiz = quizzes.find(q => q.id === currentQuizId);
      if (!quiz) return;
      const text = quillEditor.root.innerHTML.trim();
      if (!quillEditor.getText().trim()) { alert('Enter a question'); return; }
  
      const qData = { type: currentType, question: text, category: document.getElementById('aq-cat').value, timer: 
parseInt(document.getElementById('aq-timer').value) || 30 };
  
      if (currentType === 'integer') {
        qData.answer = parseInt(document.getElementById('aq-int-val').value);
        if (isNaN(qData.answer)) { alert('Enter the integer answer'); return; }
      } else {
        const opts = []; const correct = [];
        document.querySelectorAll('.aq-opt').forEach((inp, i) => {
          if (inp.value.trim()) {
            opts.push(inp.value.trim());
            if (document.querySelectorAll('.aq-chk')[i].checked) correct.push(opts.length - 1);
          }
        });
        if (opts.length < 2) { alert('Enter at least 2 options'); return; }
        if (correct.length === 0) { alert('Mark at least one correct answer'); return; }
        qData.options = opts;
        qData.correctAnswers = correct;
      }
  
      if (editingQuestionIdx !== null) {
        quiz.questions[editingQuestionIdx] = qData;
      } else {
        quiz.questions.push(qData);
      }
      save();
      renderQuestionList(quiz);
      resetAddForm();
    });
  
    function loadQuestionIntoForm(idx) {
      const quiz = quizzes.find(q => q.id === currentQuizId);
      if (!quiz || !quiz.questions[idx]) return;
      const q = quiz.questions[idx];
      editingQuestionIdx = idx;
      
      document.getElementById('aq-header').textContent = 'Edit Question';
      document.getElementById('btn-add-q').textContent = 'Save Changes';
      document.getElementById('btn-cancel-edit').style.display = 'block';
  
      quillEditor.clipboard.dangerouslyPasteHTML(q.question || '');
      document.getElementById('aq-cat').value = q.category || 'General';
      document.getElementById('aq-timer').value = q.timer || 30;
  
      document.querySelectorAll('.type-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.type === q.type);
      });
      currentType = q.type;
      document.getElementById('aq-opts-wrap').style.display = currentType === 'integer' ? 'none' : 'block';
      document.getElementById('aq-int-wrap').style.display = currentType === 'integer' ? 'block' : 'none';
  
      if (currentType === 'integer') {
        document.getElementById('aq-int-val').value = q.answer || '';
      } else {
        const opts = document.querySelectorAll('.aq-opt');
        const chks = document.querySelectorAll('.aq-chk');
        opts.forEach((o, i) => o.value = (q.options && q.options[i]) || '');
        chks.forEach((c, i) => {
          c.type = currentType === 'single' ? 'radio' : 'checkbox';
          c.name = currentType === 'single' ? 'aq-correct' : '';
          c.checked = (q.correctAnswers || []).includes(i);
        });
      }
    }
  
    document.getElementById('btn-cancel-edit').addEventListener('click', resetAddForm);
  
    function resetAddForm() {
      editingQuestionIdx = null;
      document.getElementById('aq-header').textContent = 'Add New Question';
      document.getElementById('btn-add-q').textContent = 'Add Question';
      document.getElementById('btn-cancel-edit').style.display = 'none';
  
      quillEditor.setText('');
      document.querySelectorAll('.aq-opt').forEach(i => i.value = '');
      document.querySelectorAll('.aq-chk').forEach(c => c.checked = false);
      document.getElementById('aq-int-val').value = '';
      currentType = 'mcq';
      document.querySelectorAll('.type-pill').forEach(b => b.classList.toggle('active', b.dataset.type === 'mcq'));
      document.getElementById('aq-opts-wrap').style.display = 'block';
      document.getElementById('aq-int-wrap').style.display = 'none';
    }
  
    // Save quiz
    document.getElementById('btn-save-quiz').addEventListener('click', function() {
      const quiz = quizzes.find(q => q.id === currentQuizId);
      if (!quiz) return;
      quiz.isArchived = false;
      quiz.name = document.getElementById('ed-name').value.trim() || 'Untitled Quiz';
      quiz.instructions = document.getElementById('ed-instructions').value.trim();
      const attemptsEl = document.getElementById('ed-allowed-attempts');
      if (attemptsEl) quiz.allowedAttempts = attemptsEl.value;
      // quiz.totalTime is updated via renderQuestionList automatically
      if (document.getElementById('vis-public').classList.contains('active')) quiz.visibility = 'public';
      else if (document.getElementById('vis-private').classList.contains('active')) quiz.visibility = 'private';
      else quiz.visibility = 'archive';
      
      quiz.isPublic = quiz.visibility === 'public'; // backwards compatibility
      if (quiz.visibility === 'private' && !quiz.accessCode) quiz.accessCode = genCode();
      save();
      alert('Quiz saved!');
      showScreen('screen-dash');
      renderDashboard();
    });
  
    // Delete quiz
    document.getElementById('btn-delete-quiz').addEventListener('click', async function() {
      const confirmed = await showCustomConfirm('Are you sure you want to delete this entire quiz?');
      if (!confirmed) return;
      quizzes = quizzes.filter(q => q.id !== currentQuizId);
      save();
      showScreen('screen-dash');
      renderDashboard();
    });
  
    // Cancel quiz edit
    document.getElementById('btn-cancel-quiz').addEventListener('click', function() {
      if (window.isAddingNewQuiz) {
        showScreen('screen-dash');
        renderDashboard();
      } else {
        openQuizAnalytics(currentQuizId);
      }
    });
  
    // Import JSON/CSV Logic
    function parseCSVContent(txt) {
      let rows = []; let row = []; let inQuotes = false; let val = '';
      for (let i=0; i<txt.length; i++) {
        let char = txt[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { row.push(val.trim()); val = ''; }
        else if (char === '\\n' && !inQuotes) { row.push(val.trim()); rows.push(row); row = []; val = ''; }
        else if (char !== '\\r') val += char;
      }
      row.push(val.trim()); rows.push(row);
      
      let imported = [];
      if (rows.length > 1) {
        const headers = rows[0].map(h => (h || '').toLowerCase());
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].length < 2) continue;
          const obj = {};
          headers.forEach((h, j) => { if (rows[i][j] !== undefined) obj[h] = rows[i][j]; });
          if (obj.type) {
            const qType = obj.type.toLowerCase().trim();
            const q = { type: qType, question: obj.question || obj.q || '', category: obj.category || 'General', 
timer: parseInt(obj.timer) || 30 };
            if (qType === 'integer') q.answer = parseInt(obj.answer || obj.ans) || 0;
            else {
              q.options = obj.options ? obj.options.split('|') : [];
              q.correctAnswers = obj.correctanswers ? obj.correctanswers.split('|').map(n => parseInt(n)) : [];
            }
            imported.push(q);
          }
        }
      }
      return imported;
    }
  
    function handleImportedData(imported) {
      const quiz = quizzes.find(q => q.id === currentQuizId);
      if (!quiz) return;
      if (imported && imported.length > 0) {
        quiz.questions = quiz.questions.concat(imported);
        save(); renderQuestionList(quiz);
        alert(`Imported ${imported.length} question(s) successfully!`);
        document.getElementById('import-modal').style.display = 'none';
      } else alert('No valid questions found in text/file.');
    }
  
    document.getElementById('btn-modal-import').addEventListener('click', function() {
      const isUpload = document.getElementById('m-upload').classList.contains('active');
      if (isUpload) {
        const file = document.getElementById('modal-file-input').files[0];
        if (!file) { alert('Please select a file.'); return; }
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const txt = evt.target.result;
            let imported = [];
            if (file.name.endsWith('.json')) {
              const parsed = JSON.parse(txt);
              imported = Array.isArray(parsed) ? parsed : [parsed];
            } else if (file.name.endsWith('.csv')) {
              imported = parseCSVContent(txt);
            }
            handleImportedData(imported);
          } catch (err) { alert('Error parsing file: ' + err.message); }
        };
        reader.readAsText(file);
      } else {
        const type = document.getElementById('modal-paste-type').value;
        const txt = document.getElementById('modal-paste-text').value.trim();
        if (!txt) { alert('Please paste some text.'); return; }
        try {
          let imported = [];
          if (type === 'json') {
            const parsed = JSON.parse(txt);
            imported = Array.isArray(parsed) ? parsed : [parsed];
          } else if (type === 'csv') {
            imported = parseCSVContent(txt);
          }
          handleImportedData(imported);
        } catch (err) { alert('Error parsing pasted text: ' + err.message); }
      }
    });
  
    // â”€â”€ SIDEBAR LOGIC â”€â”€
    const sidebar = document.getElementById('admin-sidebar');
    const body = document.body;
    let isSidebarOpen = true;
  
    document.getElementById('btn-sidebar-toggle').addEventListener('click', () => {
      isSidebarOpen = !isSidebarOpen;
      sidebar.classList.toggle('collapsed', !isSidebarOpen);
      body.classList.toggle('sidebar-collapsed', !isSidebarOpen);
    });
  
    document.getElementById('sb-nav-dash').addEventListener('click', () => {
      document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
      document.getElementById('sb-nav-dash').classList.add('active');
      showScreen('screen-dash');
      renderDashboard();
    });
  
    document.getElementById('sb-nav-apps').addEventListener('click', () => {
      document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
      document.getElementById('sb-nav-apps').classList.add('active');
      showScreen('screen-applications');
      fetchApplicationsFromDB();
    });

    const sbNavSurveys = document.getElementById('sb-nav-surveys');
    if (sbNavSurveys) {
      sbNavSurveys.addEventListener('click', () => {
        document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
        sbNavSurveys.classList.add('active');
        showScreen('screen-surveys-dashboard');
        if (window.renderSurveysDashboard) window.renderSurveysDashboard();
      });
    }

    // Function to show sidebar
    function initSidebar() {
      sidebar.style.display = 'flex';
      body.classList.add('has-sidebar');
    }
    function hideSidebar() {
      sidebar.style.display = 'none';
      body.classList.remove('has-sidebar');
      body.classList.remove('sidebar-collapsed');
    }
  
    // â”€â”€ APPLICATIONS SCREEN LOGIC â”€â”€
    let loadedApplications = [];
    let sortField = 'date';
    let sortOrder = 'desc';
  
    window.toggleSort = function(field) {
      if (sortField === field) {
        if (sortOrder === 'asc') sortOrder = 'desc';
        else if (sortOrder === 'desc') sortOrder = 'normal';
        else sortOrder = 'asc';
      } else {
        sortField = field;
        sortOrder = 'asc';
      }
      
      if (sortOrder === 'normal') {
        sortField = 'date';
        sortOrder = 'desc';
      }
      renderApplicationsTable();
    };
  
    async function fetchApplicationsFromDB() {
      const tbody = document.getElementById('applications-table-body');
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-secondary);">Loading applications...</td></tr>';
      
      if (!window.db) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--error);">Firebase not connected. Check configuration.</td></tr>';
        return;
      }
  
      try {
        const snapshot = await window.db.collection('applications').get();
        loadedApplications = [];
        snapshot.forEach(doc => {
          loadedApplications.push({ id: doc.id, ...doc.data() });
        });
        renderApplicationsTable();
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--error);">Error 
loading data: ${e.message}</td></tr>`;
      }
    }
  
    window.deleteApplication = async function(id) {
      const confirmed = await showCustomConfirm('Are you sure you want to delete this application?');
      if (!confirmed) return;
      if (window.db) {
        try {
          await window.db.collection('applications').doc(id).delete();
          loadedApplications = loadedApplications.filter(app => app.id !== id);
          renderApplicationsTable();
        } catch(e) {
          alert("Error deleting application: " + e.message);
        }
      }
    };
  
    function renderApplicationsTable() {
      const tbody = document.getElementById('applications-table-body');
      
      // Update sort indicators
      document.querySelectorAll('.sort-btn span').forEach(el => el.innerHTML = '');
      if (sortOrder !== 'normal') {
        const indicator = document.getElementById('sort-ind-' + sortField);
        if (indicator) indicator.innerHTML = sortOrder === 'asc' ? 'â†‘' : 'â†“';
      }
  
      if (loadedApplications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-secondary);">No applications received yet.</td></tr>';
        return;
      }
  
      let displayData = [...loadedApplications];
      displayData.sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        
        if (sortField === 'date') {
          valA = new Date(a.submitted_at || 0).getTime();
          valB = new Date(b.submitted_at || 0).getTime();
        } else if (sortField === 'roll_no') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  
      let html = '';
      displayData.forEach(app => {
          const date = new Date(app.submitted_at).toLocaleDateString() + ' ' + new 
Date(app.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        html += `
          <tr style="border-bottom: 1px solid var(--section-divider);">
            <td style="padding: 12px; font-weight: 600;">${app.name || '-'}</td>
            <td style="padding: 12px;">${app.roll_no || '-'}</td>
            <td style="padding: 12px;"><span style="background: var(--bg-alt); padding: 4px 8px; border-radius: 6px; 
font-size: 0.85rem;">${app.programme || '-'} (${app.joining_year || '-'})</span></td>
            <td style="padding: 12px;">${app.email || '-'}</td>
            <td style="padding: 12px;">${app.phone || '-'}</td>
            <td style="padding: 12px; font-size: 0.85rem; color: var(--text-secondary);">${date}</td>
            <td style="padding: 12px; text-align: center;">
              <button onclick="deleteApplication('${app.id}')" style="background: rgba(239,68,68,0.1); color: #EF4444; 
border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: 
background 0.2s;">
                Delete
              </button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }
  
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      if (loadedApplications.length === 0) {
        alert("No data to export.");
        return;
      }
      
      // Headers
      const headers = ['Name', 'Roll No', 'Programme', 'Joining Year', 'Email', 'Phone', 'Submitted At'];
      
      // Rows
      const rows = loadedApplications.map(app => [
        `"${(app.name || '').replace(/"/g, '""')}"`,
        `"${(app.roll_no || '').replace(/"/g, '""')}"`,
        `"${(app.programme || '').replace(/"/g, '""')}"`,
        `"${(app.joining_year || '').replace(/"/g, '""')}"`,
        `"${(app.email || '').replace(/"/g, '""')}"`,
        `"${(app.phone || '').replace(/"/g, '""')}"`,
        `"${app.submitted_at || ''}"`
      ].join(','));
      
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\\n" + rows.join("\\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "qs_form_submissions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  
    // â”€â”€ ANALYTICS LOGIC (GLOBAL AND PER-QUIZ) â”€â”€
    let globalAttempts = [];
    let globalCharts = {};
    let qaCharts = {};
    
    // Date Filtering Utility
    function filterAttemptsByDate(attempts, filterVal) {
      if (filterVal === 'overall') return attempts;
      const now = new Date();
      return attempts.filter(a => {
        const d = new Date(a.submittedAt);
        if (filterVal === 'today') return d.toDateString() === now.toDateString();
        if (filterVal === 'yesterday') {
          const y = new Date(now); y.setDate(y.getDate() - 1);
          return d.toDateString() === y.toDateString();
        }
        if (filterVal === 'this_week') {
          const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
          return d >= startOfWeek;
        }
        if (filterVal === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === 
now.getFullYear();
        if (filterVal === 'this_year') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }
  
    // Draw Chart Helper
    function drawChart(canvasId, type, data, options, chartDict) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;
      if (chartDict[canvasId]) chartDict[canvasId].destroy();
      chartDict[canvasId] = new Chart(ctx, { type, data, options });
    }
  
    // Fetch Global Analytics
    window.fetchGlobalAnalytics = async function() {
      if (!window.db) return;
      try {
        const snap = await window.db.collection('quiz_attempts').get();
        globalAttempts = [];
        snap.forEach(doc => globalAttempts.push({ id: doc.id, ...doc.data() }));
        renderGlobalAnalytics();
      } catch (e) {
        console.error("Error fetching analytics", e);
      }
    }
  
    document.getElementById('global-date-filter').addEventListener('change', renderGlobalAnalytics);
  
    function renderGlobalAnalytics() {
      const filterVal = document.getElementById('global-date-filter').value;
      const data = filterAttemptsByDate(globalAttempts, filterVal);
      
      // 1. Total Tests
      document.getElementById('stat-total-tests').textContent = data.length;
  
      let totalScore = 0, totalMax = 0, totalTime = 0, high = -1, low = 999999, perfectCount = 0;
      
      data.forEach(a => {
        totalScore += (a.score || 0);
        totalMax += (a.totalQuestions || 0);
        totalTime += (a.timeTaken || 0);
        if (a.score > high) high = a.score;
        if (a.score < low) low = a.score;
        if (a.score === a.totalQuestions) perfectCount++;
      });
  
      const avgScorePct = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0;
      const avgTimePerQ = totalMax > 0 ? (totalTime/totalMax).toFixed(1) : 0;
      const perfRate = data.length > 0 ? Math.round((perfectCount / data.length) * 100) : 0;
  
      if (document.getElementById('stat-avg-score')) document.getElementById('stat-avg-score').textContent = 
avgScorePct + '%';
      if (document.getElementById('stat-perfect-rate')) document.getElementById('stat-perfect-rate').textContent = 
perfRate + '%';
      if (document.getElementById('stat-time-per-q')) document.getElementById('stat-time-per-q').textContent = 
avgTimePerQ + 's';
  
      // 2. Mode Comparison
      const pCount = data.filter(a => a.mode === 'practice').length;
      const tCount = data.filter(a => a.mode === 'tournament').length;
      drawChart('chart-modes', 'doughnut', {
        labels: ['Practice', 'Tournament'],
        datasets: [{ data: [pCount, tCount], backgroundColor: ['#10B981', '#8B5CF6'], borderWidth: 0 }]
      }, { responsive: true, maintainAspectRatio: false }, globalCharts);
  
      // Prepare Quiz Leaderboards
      const qCount = {};
      data.forEach(a => {
        if (!qCount[a.quizId]) qCount[a.quizId] = { name: a.quizName, mode: a.mode, count: 0 };
        qCount[a.quizId].count++;
      });
  
      const topPrac = Object.values(qCount).filter(q => q.mode === 'practice').sort((a,b)=>b.count-a.count).slice(0,5);
      const topTour = Object.values(qCount).filter(q => q.mode === 
'tournament').sort((a,b)=>b.count-a.count).slice(0,5);
  
      // 3. Top 5 Practice
      drawChart('chart-top-practice', 'bar', {
        labels: topPrac.map(q => q.name.length > 15 ? q.name.substring(0,15)+'...' : q.name),
        datasets: [{ label: 'Attempts', data: topPrac.map(q => q.count), backgroundColor: '#10B981', borderRadius: 4 }]
      }, { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins:{legend:{display:false}} }, 
globalCharts);
  
      // 4. Top 5 Tournament
      drawChart('chart-top-tournament', 'bar', {
        labels: topTour.map(q => q.name.length > 15 ? q.name.substring(0,15)+'...' : q.name),
        datasets: [{ label: 'Attempts', data: topTour.map(q => q.count), backgroundColor: '#8B5CF6', borderRadius: 4 }]
      }, { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins:{legend:{display:false}} }, 
globalCharts);
    }
  
    // Quiz-Specific Analytics
    let currentQAQuizId = null;
  
    document.getElementById('btn-analytics-back').addEventListener('click', () => {
      showScreen('screen-dash');
    });

    const btnSettings = document.getElementById('btn-settings-sidebar');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        showScreen('screen-admin-settings');
      });
    }

    const btnSettingsBack = document.getElementById('btn-settings-back');
    if (btnSettingsBack) {
      btnSettingsBack.addEventListener('click', () => {
        showScreen('screen-dash');
      });
    }
  
    document.getElementById('btn-qa-edit').addEventListener('click', () => {
      if (currentQAQuizId) {
        window.isAddingNewQuiz = false;
        openEditor(currentQAQuizId);
      }
    });

    const btnQaLive = document.getElementById('btn-qa-live');
    if (btnQaLive) {
      btnQaLive.addEventListener('click', () => {
        const panel = document.getElementById('qa-live-stats-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const liveChatBtn = document.getElementById('btn-live-chat-send') || document.getElementById('live-chat-send');
    if (liveChatBtn) {
      liveChatBtn.addEventListener('click', async () => {
      const input = document.getElementById('live-chat-input');
      const txt = input.value.trim();
      if (!txt || !currentQAQuizId || !window.db) return;
      
      input.value = '';
      try {
        await window.db.collection('live_chats').add({
          quizId: currentQAQuizId,
          sender: 'Admin',
          message: txt,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch(e) { console.error("Error sending chat:", e); }
    });
    }

    const liveChatInput = document.getElementById('live-chat-input');
    if (liveChatInput) {
      liveChatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
          const btn = document.getElementById('btn-live-chat-send') || document.getElementById('live-chat-send');
          if (btn) btn.click();
        }
      });
    }


    window.openQuizAnalytics = function(quizId) {
      try {
        currentQAQuizId = quizId;
        const qObj = quizzes.find(q => String(q.id) === String(quizId));
        if (!qObj) {
          console.error("Quiz not found for id:", quizId);
          return;
        }
        
        document.getElementById('qa-title-dynamic').textContent = qObj.name || 'Untitled Quiz';
        let qCount = qObj.questions ? qObj.questions.length : 0;
      let tTime = qObj.totalTime ? Math.ceil(qObj.totalTime/60) + ' min' : '--';
      document.getElementById('qa-meta-dynamic').textContent = `${qCount} questions | ${tTime}`;
      
      // Set UID if available
      const uidDisplay = document.getElementById('qa-uid-dynamic');
      if (uidDisplay) {
        if (qObj.uid) {
          uidDisplay.textContent = 'UID-' + qObj.uid;
          uidDisplay.style.display = 'inline-block';
        } else {
          uidDisplay.style.display = 'none';
        }
      }
  
      // Determine Visibility, QR Code, and Live Stats panel
      const liveStatsPanel = document.getElementById('qa-live-stats-panel');
      const qrContainer = document.getElementById('qa-qr-code-container');
      const qrImg = document.getElementById('qa-qr-code-img');
      const liveAccessCodeDisplay = document.getElementById('live-access-code-display');
  
      let isPrivate = qObj.visibility === 'private' || !qObj.isPublic;
      let quizUrl = '';
      
      // We assume the app is hosted at the current origin
      const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'active-quiz.html');
  
      if (isPrivate) {
        if (liveStatsPanel) liveStatsPanel.style.display = 'block';
        if (liveAccessCodeDisplay) liveAccessCodeDisplay.textContent = qObj.accessCode || 'N/A';
        quizUrl = `${baseUrl}?code=${qObj.accessCode}`;
        
        const btnToggleCode = document.getElementById('btn-qa-toggle-code');
        const dropdownCode = document.getElementById('dropdown-tournament-code');
        if (dropdownCode) {
          dropdownCode.textContent = qObj.accessCode || 'N/A';
          dropdownCode.onclick = () => {
            if (qObj.accessCode) {
              navigator.clipboard.writeText(qObj.accessCode).then(() => {
                const originalText = dropdownCode.textContent;
                dropdownCode.textContent = 'Copied!';
                setTimeout(() => dropdownCode.textContent = originalText, 1500);
              });
            }
          };
        }

        if (btnToggleCode) {
          btnToggleCode.style.display = 'inline-block';
          if (dropdownCode) dropdownCode.style.display = 'none';
          if (liveAccessCodeDisplay) liveAccessCodeDisplay.style.display = 'none'; // Hidden by default
          btnToggleCode.textContent = 'Show Tournament Code';
          btnToggleCode.onclick = () => {
            const isHidden = dropdownCode ? dropdownCode.style.display === 'none' : true;
            if (isHidden) {
              if (dropdownCode) dropdownCode.style.display = 'block';
              btnToggleCode.textContent = 'Hide Tournament Code';
            } else {
              if (dropdownCode) dropdownCode.style.display = 'none';
              btnToggleCode.textContent = 'Show Tournament Code';
            }
          };
        }

        const btnDeploy = document.getElementById('btn-qa-deploy');
        const dateInput = document.getElementById('deploy-date');
        const timeInput = document.getElementById('deploy-time');

        if (btnDeploy) {
          if (dateInput && qObj.scheduledDeployDate) dateInput.value = qObj.scheduledDeployDate;
          if (timeInput && qObj.scheduledDeployTime) timeInput.value = qObj.scheduledDeployTime;

          btnDeploy.textContent = qObj.isDeployed ? 'End Tournament' : 'Deploy Quiz';
          btnDeploy.style.background = qObj.isDeployed ? '#ef4444' : '#10B981';
          btnDeploy.onclick = async () => {
            btnDeploy.disabled = true;
            qObj.isDeployed = !qObj.isDeployed;
            if (qObj.isDeployed) {
              if (dateInput) qObj.scheduledDeployDate = dateInput.value;
              if (timeInput) qObj.scheduledDeployTime = timeInput.value;
              qObj.currentDeploymentId = `dep_${Date.now()}`;
              qObj.deployments = qObj.deployments || [];
              qObj.deployments.push({ id: qObj.currentDeploymentId, startTime: new Date().toISOString() });
            } else {
              if (qObj.deployments && qObj.deployments.length > 0) {
                qObj.deployments[qObj.deployments.length - 1].endTime = new Date().toISOString();
              }
            }
            save(); // Sync to localStorage and Firebase
            btnDeploy.textContent = qObj.isDeployed ? 'End Tournament' : 'Deploy Quiz';
            btnDeploy.style.background = qObj.isDeployed ? '#ef4444' : '#10B981';
            btnDeploy.disabled = false;
            openQuizAnalytics(quizId); // Refresh to update dropdown
          };
        }
  
        // Also start live stats fetch for this tournament
        startLiveTournamentStats(quizId);
      } else {
        if (liveStatsPanel) liveStatsPanel.style.display = 'none';
        quizUrl = `${baseUrl}?quizId=${qObj.id}`;
        
        const btnToggleCode = document.getElementById('btn-qa-toggle-code');
        if (btnToggleCode) btnToggleCode.style.display = 'none';
        const dropdownCode = document.getElementById('dropdown-tournament-code');
        if (dropdownCode) dropdownCode.style.display = 'none';
        
        stopLiveTournamentStats();
      }
  
      const btnShowQR = document.getElementById('btn-qa-show-qr');
      if (btnShowQR) {
        btnShowQR.style.display = 'inline-block';
        btnShowQR.onclick = () => {
          document.getElementById('qr-enlarge-modal').style.display = 'flex';
        };
      }
      
      if (typeof QRious !== 'undefined') {
        const qrEnlargeCanvas = document.getElementById('qr-enlarge-canvas');
        if (qrEnlargeCanvas) {
          new QRious({
            element: qrEnlargeCanvas,
            value: quizUrl,
            size: 300,
            foreground: '#000000',
            background: '#ffffff'
          });
        }
      }
      
      const depFilter = document.getElementById('deployment-filter');
      if (depFilter) {
        depFilter.innerHTML = '<option value="all">All Deployments</option>';
        if (qObj.deployments && qObj.deployments.length > 0) {
          qObj.deployments.slice().reverse().forEach(d => {
             const dStr = new Date(d.startTime).toLocaleString();
             depFilter.innerHTML += `<option value="${d.id}">${dStr}</option>`;
          });
        }
        depFilter.onchange = () => {
           window.currentDeploymentFilter = depFilter.value;
           renderQAStats(quizId);
        };
        window.currentDeploymentFilter = 'all';
      }
  
      renderQAStats(quizId);
      showScreen('screen-quiz-analytics');
      } catch(e) {
        console.error(e);
        alert("Error opening analytics: " + e.message);
      }
    }
  
    window.renderQAStats = function(quizId) {
      try {
        const qObj = quizzes.find(q => String(q.id) === String(quizId));
      if (!qObj) return;
  
      let qaData = globalAttempts.filter(a => a.quizId === quizId);
      if (window.currentDeploymentFilter && window.currentDeploymentFilter !== 'all') {
        qaData = qaData.filter(a => a.deploymentId === window.currentDeploymentFilter);
      }
      
      if (qaData.length === 0) {
        document.getElementById('qa-total').textContent = '0';
        document.getElementById('qa-avg-score').textContent = '0%';
        document.getElementById('qa-avg-time').textContent = '0s';
        document.getElementById('qa-high-score').textContent = '0';
        document.getElementById('qa-low-score').textContent = '0';
        document.getElementById('qa-perfect-rate').textContent = '0%';
        document.getElementById('qa-time-per-q').textContent = '0s';
        ['chart-qa-modes', 'chart-qa-scores', 'chart-qa-timeline'].forEach(id => {
          if(qaCharts[id]) qaCharts[id].destroy();
        });
        return;
      }
  
      // Calc Numbers
      document.getElementById('qa-total').textContent = qaData.length;
      
      let totalScore = 0, totalMax = 0, totalTime = 0, high = -1, low = 999999, perfectCount = 0;
      
      qaData.forEach(a => {
        totalScore += (a.score || 0);
        totalMax += (a.totalQuestions || 0);
        totalTime += (a.timeTaken || 0);
        if (a.score > high) high = a.score;
        if (a.score < low) low = a.score;
        if (a.score === a.totalQuestions) perfectCount++;
      });
  
      const avgScorePct = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0;
      const avgTime = Math.round(totalTime / qaData.length);
      const avgTimePerQ = totalMax > 0 ? (totalTime/totalMax).toFixed(1) : 0;
      const perfRate = Math.round((perfectCount / qaData.length) * 100);
  
      document.getElementById('qa-avg-score').textContent = avgScorePct + '%';
      document.getElementById('qa-avg-time').textContent = avgTime + 's';
      document.getElementById('qa-high-score').textContent = high === -1 ? '0' : high;
      document.getElementById('qa-low-score').textContent = low === 999999 ? '0' : low;
      document.getElementById('qa-perfect-rate').textContent = perfRate + '%';
      document.getElementById('qa-time-per-q').textContent = avgTimePerQ + 's';
  
      // Chart 1: Practice vs Tournament for this quiz
      const pc = qaData.filter(a => a.mode === 'practice').length;
      const tc = qaData.filter(a => a.mode === 'tournament').length;
      drawChart('chart-qa-modes', 'pie', {
        labels: ['Practice', 'Tournament'],
        datasets: [{ data: [pc, tc], backgroundColor: ['#10B981', '#8B5CF6'], borderWidth: 0 }]
      }, { responsive: true, maintainAspectRatio: false }, qaCharts);
  
      // Chart 2: Score Distribution
      const maxQ = (qObj.questions || []).length;
      const scoreCounts = Array(maxQ + 1).fill(0);
      qaData.forEach(a => {
        if (a.score >= 0 && a.score <= maxQ) scoreCounts[a.score]++;
      });
      drawChart('chart-qa-scores', 'bar', {
        labels: scoreCounts.map((_, i) => i.toString()),
        datasets: [{ label: 'Number of Players', data: scoreCounts, backgroundColor: '#0ea5e9', borderRadius: 4 }]
      }, { responsive: true, maintainAspectRatio: false }, qaCharts);
  
      // Chart 3: Timeline (By Day)
      const dateCounts = {};
      qaData.forEach(a => {
        let dStr = 'Unknown';
        if (a.submittedAt) {
          try {
            const d = new Date(a.submittedAt);
            if (!isNaN(d.getTime())) {
              dStr = d.toLocaleDateString();
            }
          } catch(e) {}
        }
        dateCounts[dStr] = (dateCounts[dStr] || 0) + 1;
      });
      
      const sortedDates = Object.keys(dateCounts).sort((a,b) => {
        if (a === 'Unknown') return -1;
        if (b === 'Unknown') return 1;
        return new Date(a) - new Date(b);
      });
      
      drawChart('chart-qa-timeline', 'line', {
        labels: sortedDates,
        datasets: [{
          label: 'Attempts', data: sortedDates.map(d => dateCounts[d]),
          borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.3, pointRadius: 4
        }]
      }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }, qaCharts);
      
      renderDeploymentAttemptsTable(qaData);
      } catch (e) { console.error(e); }
    }
  
    function renderDeploymentAttemptsTable(qaData) {
      let container = document.getElementById('deployment-attempts-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'deployment-attempts-container';
        container.style.marginTop = '32px';
        container.innerHTML = `
          <h3 style="margin-bottom:16px;">Student Attempts</h3>
          <div style="background:white; border-radius:12px; overflow:hidden; border:1px solid var(--section-divider);">
            <table style="width:100%; border-collapse:collapse;">
              <thead style="background:var(--bg-alt); text-align:left;">
                <tr>
                  <th style="padding:12px; font-weight:700;">Name</th>
                  <th style="padding:12px; font-weight:700;">Score</th>
                  <th style="padding:12px; font-weight:700;">Time</th>
                  <th style="padding:12px; font-weight:700;">Tab Switches</th>
                  <th style="padding:12px; font-weight:700;">Minimizes</th>
                  <th style="padding:12px; font-weight:700;">Submitted At</th>
                </tr>
              </thead>
              <tbody id="deployment-attempts-tbody"></tbody>
            </table>
          </div>
        `;
        document.getElementById('screen-quiz-analytics').querySelector('.dash-body').appendChild(container);
      }
      
      const tbody = document.getElementById('deployment-attempts-tbody');
      if (qaData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-secondary);">No attempts found.</td></tr>';
        return;
      }
      
      tbody.innerHTML = qaData.sort((a,b) => {
        const dA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dB - dA;
      }).map(a => {
        let dStr = 'Unknown';
        if (a.submittedAt) {
          try {
            const d = new Date(a.submittedAt);
            if (!isNaN(d.getTime())) {
              dStr = d.toLocaleString();
            }
          } catch(e) {}
        }
        return `
          <tr style="border-bottom:1px solid var(--section-divider);">
            <td style="padding:12px; font-weight:600;">${a.studentName || 'Anonymous'}</td>
            <td style="padding:12px;">${a.score}/${a.totalQuestions}</td>
            <td style="padding:12px;">${a.timeTaken}s</td>
            <td style="padding:12px; color:${a.tabSwitches > 0 ? '#ef4444' : 'inherit'}">${a.tabSwitches || 0}</td>
            <td style="padding:12px; color:${a.minimizes > 0 ? '#ef4444' : 'inherit'}">${a.minimizes || 0}</td>
            <td style="padding:12px; font-size:0.85rem; color:var(--text-secondary);">${dStr}</td>
          </tr>
        `;
      }).join('');
    }
  
    // â”€â”€ LIVE TOURNAMENT DASHBOARD STATS â”€â”€
    let liveDashboardUnsubscribe = null;
    
    
    // --- LIVE CHAT & TRACKING MOCK LOGIC ---
    const chatInput = document.getElementById('live-chat-input');
    const chatSendBtn = document.getElementById('btn-live-chat-send');
    const chatMessages = document.getElementById('live-chat-messages');
    
    if (chatSendBtn && chatInput && chatMessages) {
      chatSendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (!text) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg admin';
        msgDiv.textContent = "Admin: " + text;
        chatMessages.appendChild(msgDiv);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
      
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') chatSendBtn.click();
      });
    }

    let liveSessionsUnsubscribe = null;
    let liveChatsUnsubscribe = null;

    window.startLiveTournamentStats = function(quizId) {
      if (!window.db) return;
      
      const trackingBody = document.getElementById('live-tracking-tbody');
      const participantsBody = document.getElementById('live-participants-tbody');
      const chatMessages = document.getElementById('live-chat-messages');
      const countEl = document.getElementById('live-participant-count');
      const avgEl = document.getElementById('live-avg-completion');

      if (trackingBody) trackingBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading...</td></tr>';
      if (participantsBody) participantsBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Loading...</td></tr>';
      if (chatMessages) chatMessages.innerHTML = '<div style="text-align:center; color:gray; font-size:0.85rem; padding: 16px;">Connecting...</div>';

      const quiz = quizzes.find(q => q.id === quizId);
      const totalQ = quiz && quiz.questions ? quiz.questions.length : 1;

      // 1. Listen to Live Sessions
      liveSessionsUnsubscribe = window.db.collection('live_sessions')
        .where('quizId', '==', quizId)
        .onSnapshot(snap => {
          let sessions = [];
          snap.forEach(doc => {
            let data = doc.data();
            data.uid = doc.id;
            sessions.push(data);
          });

          if (countEl) countEl.textContent = sessions.length;

          let totalPercent = 0;
          let pRows = '';
          let tRows = '';

          if (sessions.length === 0) {
            if (participantsBody) participantsBody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (trackingBody) trackingBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (avgEl) avgEl.textContent = '0%';
            return;
          }

          sessions.sort((a,b) => (b.currentQuestion || 0) - (a.currentQuestion || 0));

          sessions.forEach(s => {
            const name = s.participantName || 'Anonymous';
            const uidStr = s.uid ? s.uid.substring(0, 8) : 'Unknown';
            const isWaiting = s.status === 'waiting';
            const curQ = isWaiting ? 'Lobby' : (s.currentQuestion || 0);
            const att = isWaiting ? '-' : (s.attemptedCount || 0);
            const skip = isWaiting ? '-' : (s.skippedCount || 0);
            const tab = isWaiting ? '-' : (s.tabSwitches || 0);
            const min = isWaiting ? '-' : (s.minimizes || 0);
            const elapsedSec = (s.startTime && !isWaiting) ? Math.floor((new Date() - new Date(s.startTime)) / 1000) : '-';
            const tQ = isWaiting ? '-' : (s.timeOnCurrentQuestion || 0);

            let pct = isWaiting ? 0 : Math.min(100, Math.round((curQ / totalQ) * 100));
            totalPercent += pct;

            pRows += `<tr><td style="padding:10px;">${name}</td><td style="padding:10px;">${uidStr}</td></tr>`;
            tRows += `<tr>
              <td style="padding:10px;">${name}</td>
              <td style="padding:10px;">${isWaiting ? curQ : 'Q'+curQ}</td>
              <td style="padding:10px;">${att}</td>
              <td style="padding:10px;">${skip}</td>
              <td style="padding:10px; color:${tab>0?'#ef4444':'inherit'}">${tab}</td>
              <td style="padding:10px; color:${min>0?'#f59e0b':'inherit'}">${min}</td>
              <td style="padding:10px;">${isWaiting ? '-' : tQ+'s'}</td>
              <td style="padding:10px;">${isWaiting ? '-' : elapsedSec+'s'}</td>
            </tr>`;
          });

          if (participantsBody) participantsBody.innerHTML = pRows;
          if (trackingBody) trackingBody.innerHTML = tRows;
          if (avgEl) avgEl.textContent = Math.round(totalPercent / sessions.length) + '%';
        });

      // 2. Listen to Live Chats
      liveChatsUnsubscribe = window.db.collection('live_chats')
        .where('quizId', '==', quizId)
        .onSnapshot(snap => {
          if (!chatMessages) return;
          chatMessages.innerHTML = '';
          if (snap.empty) {
            chatMessages.innerHTML = '<div style="text-align:center; color:gray; font-size:0.85rem; padding: 16px;">No messages yet.</div>';
            return;
          }
          const msgs = [];
          snap.forEach(doc => msgs.push(doc.data()));
          msgs.sort((a, b) => {
            const t1 = (a.timestamp && typeof a.timestamp.toMillis === 'function') ? a.timestamp.toMillis() : Date.now();
            const t2 = (b.timestamp && typeof b.timestamp.toMillis === 'function') ? b.timestamp.toMillis() : Date.now();
            return t1 - t2;
          });
          msgs.forEach(msg => {
            const isAdmin = msg.sender === 'Admin';
            const align = isAdmin ? 'flex-end' : 'flex-start';
            const bg = isAdmin ? '#0ea5e9' : '#ffffff';
            const color = isAdmin ? 'white' : 'var(--text)';
            
            chatMessages.innerHTML += `
              <div style="display:flex; flex-direction:column; align-items:${align}; margin-bottom:8px;">
                <span style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:2px; font-weight:600;">${msg.sender}</span>
                <div style="background:${bg}; color:${color}; padding:8px 12px; border-radius:12px; max-width:80%; font-size:0.9rem; word-break:break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                  ${msg.message}
                </div>
              </div>
            `;
          });
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    };

    window.stopLiveTournamentStats = function() {
      if (liveSessionsUnsubscribe) liveSessionsUnsubscribe();
      if (liveChatsUnsubscribe) liveChatsUnsubscribe();
      liveSessionsUnsubscribe = null;
      liveChatsUnsubscribe = null;
    };
  
  })();
  