
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
    document.querySelectorAll('.m-pane:not(.format-pane)').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    const t = document.getElementById(target);
    if(t) {
      t.classList.add('active');
      t.style.display = 'flex';
    }
  }

  window.switchTopTab = function(target) {
    document.querySelectorAll('.m-top-tab').forEach(b => {
      b.classList.remove('active');
      b.style.borderBottomColor = 'transparent';
      b.style.color = 'var(--text-secondary)';
    });
    const activeBtn = document.querySelector(`.m-top-tab[data-target="${target}"]`);
    if(activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.borderBottomColor = '#0ea5e9';
      activeBtn.style.color = '#0ea5e9';
    }
    document.querySelectorAll('.m-top-pane').forEach(p => p.style.display = 'none');
    const targetPane = document.getElementById(target);
    if(targetPane) targetPane.style.display = 'block';
  };

  window.switchSampleTab = function(target) {
    document.querySelectorAll('.m-sample-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`.m-sample-tab[data-target="${target}"]`).classList.add('active');
    document.querySelectorAll('.m-sample-pane').forEach(p => p.style.display = 'none');
    document.getElementById(target).style.display = 'block';
  };

  window.copyCSVFormat = function() {
    const text = 'type,text,options,correctIndex,timer,category\nmcq,"What is 2+2?","3|4|5|6",1,30,Math\nsingle,"Sun is a star?","Yes|No",0,15,Science\ninteger,"Vertices in triangle?","",3,30,Math';
    navigator.clipboard.writeText(text).then(() => alert('CSV format copied!'));
  };

  window.copyJSONFormat = function() {
    const text = '[\n  {\n    "type": "mcq",\n    "text": "What is 2+2?",\n    "options": ["3", "4", "5", "6"],\n    "correctIndex": 1,\n    "timer": 30,\n    "category": "Math"\n  },\n  {\n    "type": "integer",\n    "text": "Vertices in triangle?",\n    "correctIndex": 3,\n    "timer": 30,\n    "category": "Math"\n  }\n]';
    navigator.clipboard.writeText(text).then(() => alert('JSON format copied!'));
  };
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
          let docRef = window.db.collection('global').doc('adminQuizzes');
          let docSnap = await docRef.get();
          if (!docSnap.exists) {
            docRef = window.db.collection('global').doc('allQuizzes');
            docSnap = await docRef.get();
          }
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
        // Save full admin version
        window.db.collection('global').doc('adminQuizzes').set({ data: dataStr })
          .catch(e => console.error("Error saving adminQuizzes to Firebase:", e));
          
        // Create stripped public version and secret mappings
        const publicQuizzes = quizzes.map(q => {
           let pq = { ...q };
           if (pq.questions) {
             pq.questions = pq.questions.map(qst => {
                let pQst = { ...qst };
                delete pQst.ans;
                delete pQst.correctAnswers;
                delete pQst.answer;
                return pQst;
             });
           }
           return pq;
        });
        
        window.db.collection('global').doc('allQuizzes').set({ data: JSON.stringify(publicQuizzes) })
          .catch(e => console.error("Error saving public allQuizzes to Firebase:", e));
          
        // Save secrets for each quiz
        quizzes.forEach(q => {
           if (q.questions) {
             const secrets = q.questions.map(qst => ({
               id: qst.id !== undefined ? qst.id : null,
               ans: qst.ans !== undefined ? qst.ans : null,
               correctAnswers: qst.correctAnswers !== undefined ? qst.correctAnswers : null,
               answer: qst.answer !== undefined ? qst.answer : null
             }));
             window.db.collection('quiz_secrets').doc(String(q.id)).set({ secrets })
               .catch(e => console.error("Error saving secrets:", e));
           }
        });
      }
    }
    function logQuizEdit(quizId, actionDescription) {
      const q = quizzes.find(x => x.id === quizId);
      if (q) {
        if (!q.history) q.history = [];
        const user = sessionStorage.getItem('qs_admin_id') || 'Unknown';
        q.history.unshift({ date: new Date().toISOString(), action: actionDescription, user: user });
      }
    }
    
    function genId() {
      return Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    function genCode() {
      const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let s;
      do {
        s = ''; 
        for(let i=0;i<8;i++) s += c[Math.floor(Math.random()*c.length)];
      } while (quizzes && quizzes.some(q => q.accessCode === s));
      return s;
    }
  
    // ──────── Screen switching ────────
    window.showScreen = function(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
      
      if (id === 'screen-survey-live-admin') {
        if (typeof window.hideSidebar === 'function') window.hideSidebar();
      } else if (id !== 'screen-login' && typeof window.initSidebar === 'function') {
        window.initSidebar();
      }
    };
    // Keep local reference for existing code in this file
    const showScreen = window.showScreen;
  
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
          let msg = e.message || 'Invalid credentials. Please try again.';
          if (e.code === 'auth/user-not-found') {
            msg = "Account doesn't exist , Please Signup";
          } else if (e.code === 'auth/wrong-password') {
            msg = "password wrong";
          } else if (e.code === 'auth/invalid-credential') {
            msg = "Account doesn't exist, Please Signup, or password wrong";
          }
          loginErr.textContent = msg;
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
  
    window.adminLogout = async function() {
      if (confirm("Are you sure you want to logout?")) {
        try {
          if (window.firebase) await firebase.auth().signOut();
        } catch (ex) {}
        sessionStorage.removeItem('qs_admin');
        sessionStorage.removeItem('qs_admin_id');
        window.location.href = 'active-quiz.html';
      }
    };

    // Logout via existing button id if it exists
    if (btnLogout) {
      btnLogout.addEventListener('click', window.adminLogout);
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
      
      const count = (q.questions || []).length;
      const time = q.totalTime ? Math.ceil(q.totalTime/60) + ' min' : '—';
      
      const uidHTML = (q.visibility === 'public') ? `
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #94a3b8; font-family: monospace; margin: 4px 0 8px 0;">
          <span>UID: ${q.id}</span>
          <button title="Copy UID" onclick="event.stopPropagation(); navigator.clipboard.writeText('${q.id}').then(()=>alert('UID copied!'))" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 2px; display: flex; align-items: center;">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>` : '';

      return `<div class="quiz-card hover-elevate stagger-enter" data-id="${q.id}" style="animation-delay: ${idx * 0.05}s">
        ${badge}
        <h3 style="margin-bottom: ${q.visibility === 'public' ? '0' : '8px'};">${q.name || 'Untitled Quiz'}</h3>
        ${uidHTML}
        <div class="qc-meta"><span>${count} question${count!==1?'s':''}</span><span>${time}</span></div>
      </div>`;
    }
  
    // New Quiz
    document.getElementById('btn-new-quiz').addEventListener('click', function() {
      console.log("Create New Quiz button clicked.");
      try {
        if (!Array.isArray(quizzes)) quizzes = [];
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
        logQuizEdit(newQuiz.id, "Quiz Created");
        save();
        openEditor(newQuiz.id);
      } catch (e) {
        alert("Error creating quiz: " + e.message);
        console.error(e);
      }
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
          <button class="btn-back" id="btn-editor-back-dynamic" style="background:#f1f5f9; color:#334155; padding: 10px 24px; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; margin-bottom: 12px;">Back to Quiz Analytics</button>
          <div style="text-align: left; width: 100%;">
            <div style="font-weight: 800; font-size: 1.75rem; margin-bottom: 4px;">${quiz.name || 'Untitled Quiz'}</div>
            <div style="color: var(--text-secondary); font-size: 1rem;">${qCount} questions • ${tTime}</div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 0 0; width: 100%;">
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
        <div class="q-item" data-idx="${i}" style="position: relative;">
          ${i > 0 ? `<button class="q-move q-up" data-idx="${i}" title="Move Up" style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid var(--section-divider);"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>` : ''}
          ${i < quiz.questions.length - 1 ? `<button class="q-move q-down" data-idx="${i}" title="Move Down" style="position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); z-index: 10; box-shadow: 0 -2px 8px rgba(0,0,0,0.15); border: 1px solid var(--section-divider);"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></button>` : ''}
          <span class="q-num">${i+1}</span>
          <span class="q-text" style="font-size: 0.8rem; line-height: 1.4;">${q.question}</span>
          <span class="q-type-pill">${q.type}</span>
          <div class="q-actions" style="margin-left: auto;">
            <button class="q-del" data-idx="${i}" title="Delete Question" style="padding: 8px; display: flex; align-items: center; justify-content: center; background: rgba(239,68,68,0.1); border-radius: 50%;">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
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
        document.querySelectorAll('#aq-opts-wrap .aq-opt').forEach((inp, i) => {
          if (inp.value.trim()) {
            opts.push(inp.value.trim());
            if (document.querySelectorAll('#aq-opts-wrap .aq-chk')[i].checked) correct.push(opts.length - 1);
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
      logQuizEdit(currentQuizId, editingQuestionIdx !== null ? "Updated a question" : "Added a question");
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
        const opts = document.querySelectorAll('#aq-opts-wrap .aq-opt');
        const chks = document.querySelectorAll('#aq-opts-wrap .aq-chk');
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
  
      if (typeof quillEditor !== 'undefined' && quillEditor) {
        quillEditor.setText('');
      }
      document.querySelectorAll('#aq-opts-wrap .aq-opt').forEach(i => i.value = '');
      document.querySelectorAll('#aq-opts-wrap .aq-chk').forEach(c => c.checked = false);
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
      logQuizEdit(currentQuizId, "Updated quiz settings/details");
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
      
      try {
        // Clean up Realtime DB chat
        if (window.rtdb) {
          window.rtdb.ref('chat_' + currentQuizId).remove();
        }
        
        // Find and delete all attempts for this quiz
        const attemptsSnap = await window.db.collection('attempts').where('quizId', '==', currentQuizId).get();
        const batch = window.db.batch();
        attemptsSnap.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Find and delete all live sessions for this quiz
        const sessionsSnap = await window.db.collection('live_sessions').where('quizId', '==', currentQuizId).get();
        sessionsSnap.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      } catch (err) {
        console.error('Error cleaning up quiz data:', err);
      }
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
            const q = { type: qType, question: obj.question || obj.text || obj.q || '', category: obj.category || 'General', timer: parseInt(obj.timer) || 30 };
            if (qType === 'integer') q.answer = parseInt(obj.answer || obj.ans) || 0;
            else {
              q.options = obj.options ? obj.options.split('|') : [];
              if (obj.correctanswers) {
                q.correctAnswers = obj.correctanswers.split('|').map(n => parseInt(n));
              } else if (obj.correctindex !== undefined) {
                q.correctAnswers = [parseInt(obj.correctindex)];
              } else {
                q.correctAnswers = [];
              }
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
        imported.forEach(q => {
          if (q.correctIndex !== undefined && q.correctAnswers === undefined) {
            q.correctAnswers = [q.correctIndex];
          }
          if (q.text !== undefined && q.question === undefined) {
            q.question = q.text;
          }
        });
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
      // On mobile, also close the overlay
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });

    // ── MOBILE SIDEBAR OVERLAY LOGIC ──
    function openMobileSidebar() {
      sidebar.classList.add('mobile-open');
      document.getElementById('sidebar-backdrop').classList.add('active');
    }
    function closeMobileSidebar() {
      sidebar.classList.remove('mobile-open');
      document.getElementById('sidebar-backdrop').classList.remove('active');
    }
    const mobileSidebarBtn = document.getElementById('mobile-sidebar-btn');
    if (mobileSidebarBtn) {
      mobileSidebarBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('mobile-open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      });
    }
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }
    // Auto-close sidebar on mobile when a nav item is clicked
    document.querySelectorAll('.sb-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeMobileSidebar();
      });
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

    const sbNavForms = document.getElementById('sb-nav-forms');
    if (sbNavForms) {
      sbNavForms.addEventListener('click', () => {
        document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
        sbNavForms.classList.add('active');
        showScreen('screen-forms-dashboard');
        if (window.renderFormsDashboard) window.renderFormsDashboard();
      });
    }

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
    window.initSidebar = function() {
      sidebar.style.display = 'flex';
      body.classList.add('has-sidebar');
      
      const sbNavApps = document.getElementById('sb-nav-apps');
      if (sbNavApps) {
        if (sessionStorage.getItem('qs_admin_id') === 'singh.ayush@iitgn.ac.in') {
          sbNavApps.style.display = '';
        } else {
          sbNavApps.style.display = 'none';
        }
      }
    };
    window.hideSidebar = function() {
      sidebar.style.display = 'none';
      body.classList.remove('has-sidebar');
      body.classList.remove('sidebar-collapsed');
    };
  
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
        snap.forEach(doc => {
          const d = doc.data();
          let isActiveTournament = false;
          if (d.mode === 'tournament' && d.quizId) {
            const q = typeof quizzes !== 'undefined' ? quizzes.find(qz => qz.id === d.quizId) : null;
            if (q && q.isDeployed) {
              if (!d.deploymentId || q.currentDeploymentId === d.deploymentId) {
                isActiveTournament = true;
              }
            }
          }
          if (!isActiveTournament) {
            globalAttempts.push({ id: doc.id, ...d });
          }
        });
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
      document.getElementById('sb-nav-dash').click();
    });

    const btnSettings = document.getElementById('btn-settings-sidebar');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
        btnSettings.classList.add('active');
        showScreen('screen-admin-settings');
      });
    }

    const btnSettingsBack = document.getElementById('btn-settings-back');
    if (btnSettingsBack) {
      btnSettingsBack.addEventListener('click', () => {
        document.getElementById('sb-nav-dash').click();
      });
    }
  
    document.getElementById('btn-qa-edit').addEventListener('click', () => {
      if (currentQAQuizId) {
        window.isAddingNewQuiz = false;
        openEditor(currentQAQuizId);
      }
    });

    document.getElementById('btn-qa-history').addEventListener('click', () => {
      const quiz = quizzes.find(q => q.id === currentQAQuizId);
      if (quiz) {
        const listDiv = document.getElementById('quiz-history-list');
        if (!quiz.history || quiz.history.length === 0) {
          listDiv.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No history recorded for this quiz.</div>';
        } else {
          listDiv.innerHTML = quiz.history.map(h => {
            const dateStr = new Date(h.date).toLocaleString();
            return `<div style="background: var(--surface); padding: 16px; border-radius: 12px; font-size: 0.95rem; border: 1px solid var(--section-divider); display: flex; flex-direction: column; gap: 6px;">
              <div style="font-weight: 800; color: var(--text);">${h.action}</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${h.user} &nbsp;•&nbsp; ${dateStr}
              </div>
            </div>`;
          }).join('');
        }
        document.getElementById('quiz-history-modal').style.display = 'flex';
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
      if (!txt || !currentQAQuizId || !window.rtdb) return;
      
      input.value = '';
      try {
        await window.rtdb.ref('live_chats/' + currentQAQuizId).push({
          sender: 'Admin',
          message: txt,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      } catch(e) { console.error("Error sending chat:", e); }
    });
    }

    const liveChatPinBtn = document.getElementById('btn-live-chat-pin');
    if (liveChatPinBtn) {
      liveChatPinBtn.addEventListener('click', async () => {
        const input = document.getElementById('live-chat-input');
        const txt = input.value.trim();
        if (!txt || !currentQAQuizId || !window.rtdb) return;
        
        input.value = '';
        try {
          await window.rtdb.ref('live_chats/' + currentQAQuizId).push({
            sender: 'Admin',
            message: txt,
            isPinned: true,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          });
        } catch(e) { console.error("Error sending pinned chat:", e); }
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

    window.removeParticipant = async function(uid) {
      if(!confirm('Are you sure you want to kick this participant from the tournament?')) return;
      try {
        await window.db.collection('live_sessions').doc(uid).update({ status: 'kicked' });
      } catch(e) { console.error('Error removing participant:', e); }
    };

    window.muteParticipant = async function(uid, muteState) {
      try {
        await window.db.collection('live_sessions').doc(uid).update({ isMuted: muteState });
      } catch(e) { console.error('Error muting participant:', e); }
    };

    window.unbanParticipant = async function(uid) {
      if(!confirm('Are you sure you want to unban this participant?')) return;
      try {
        await window.db.collection('live_sessions').doc(uid).update({ status: 'active' });
      } catch(e) { console.error('Error unbanning participant:', e); }
    };

    const btnClearChat = document.getElementById('btn-clear-chat');
    if (btnClearChat) {
      btnClearChat.addEventListener('click', async () => {
        if (!currentQAQuizId || !window.rtdb) return;
        if (!confirm('Are you sure you want to clear all chat messages for this tournament?')) return;
        try {
          await window.rtdb.ref('live_chats/' + currentQAQuizId).remove();
        } catch(e) { console.error('Error clearing chat:', e); }
      });
    }

    const btnGenerateReport = document.getElementById('btn-generate-report');
    if (btnGenerateReport) {
      btnGenerateReport.addEventListener('click', async () => {
        if (!currentQAQuizId || !window.db) return;
        try {
          const snap = await window.db.collection('quiz_attempts')
            .where('quizId', '==', currentQAQuizId)
            .get();
          
          const qObj = typeof quizzes !== 'undefined' ? quizzes.find(qz => qz.id === currentQAQuizId) : null;
          const validAttempts = [];
          
          snap.forEach(doc => {
            const data = doc.data();
            let isActiveTournament = false;
            if (data.mode === 'tournament' && qObj && qObj.isDeployed) {
              if (!data.deploymentId || qObj.currentDeploymentId === data.deploymentId) {
                isActiveTournament = true;
              }
            }
            if (!isActiveTournament) {
              validAttempts.push(data);
            }
          });

          if (validAttempts.length === 0) {
            alert('No past attempts found for this quiz to generate a report. Note: Ongoing tournaments are not included until ended.');
            return;
          }
          
          let csv = 'Name,UID,PID,Score,Attempted,Skipped,Time Taken,Tab Switches,Minimizes,Date,Time\n\n';
          validAttempts.forEach(data => {
            const name = data.participantName || data.studentName || 'Anonymous';
            const uid = data.uid || data.sid || data.studentId || 'N/A';
            const pid = data.pid || 'N/A';
            const score = data.score || 0;
            const tQs = data.totalQuestions || (qObj && qObj.questions ? qObj.questions.length : '?');
            const attCount = typeof data.attemptedCount !== 'undefined' ? data.attemptedCount : 0;
            const att = `${attCount}/${tQs}`;
            const skip = data.skippedCount || 0;
            const time = data.timeTaken || 0;
            const tTime = data.totalQuizTime || (qObj && qObj.totalTime ? qObj.totalTime : '?');
            const timeStr = `${time}/${tTime}s`;
            const tabs = data.tabSwitches || 0;
            const mins = data.minimizes || 0;
            
            let dObj = null;
            if (data.timestamp && typeof data.timestamp.toMillis === 'function') {
              dObj = new Date(data.timestamp.toMillis());
            } else if (data.timestamp) {
              dObj = new Date(data.timestamp);
            } else if (data.submittedAt) {
              dObj = new Date(data.submittedAt);
            }
            const dStr = dObj && !isNaN(dObj.getTime()) ? dObj.toLocaleDateString() : '';
            const tStr = dObj && !isNaN(dObj.getTime()) ? dObj.toLocaleTimeString() : '';
            
            const cleanName = '"' + name.replace(/"/g, '""') + '"';
            csv += `${cleanName},${uid},${pid},${score},"${att}",${skip},"${timeStr}",${tabs},${mins},"${dStr}","${tStr}"\n`;
          });
          
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `tournament_report_${currentQAQuizId}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        } catch(e) {
          console.error('Error generating CSV:', e);
          alert('Failed to generate report.');
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
      let isArchive = qObj.visibility === 'archive';
      let quizUrl = '';
      
      // We assume the app is hosted at the current origin
      const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'active-quiz.html');
  
      if (isPrivate || isArchive) {
        if (liveStatsPanel && !isArchive) liveStatsPanel.style.display = 'block';
        if (liveStatsPanel && isArchive) liveStatsPanel.style.display = 'none';
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
          
          if (isArchive) {
            btnToggleCode.style.opacity = '0.5';
            btnToggleCode.style.cursor = 'not-allowed';
            btnToggleCode.onclick = () => alert("Tournament code cannot be viewed for archived tests.");
          } else {
            btnToggleCode.style.opacity = '1';
            btnToggleCode.style.cursor = 'pointer';
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
            if (qObj.visibility === 'archive') {
              alert("You cannot deploy an archived quiz.");
              return;
            }
            btnDeploy.disabled = true;
            qObj.isDeployed = !qObj.isDeployed;
            if (qObj.isDeployed) {
              if (dateInput) qObj.scheduledDeployDate = dateInput.value;
              if (timeInput) qObj.scheduledDeployTime = timeInput.value;
              qObj.currentDeploymentId = `dep_${Date.now()}`;
              qObj.deployments = qObj.deployments || [];
              
              let deployStart = new Date();
              if (qObj.scheduledDeployDate && qObj.scheduledDeployTime) {
                const target = new Date(`${qObj.scheduledDeployDate}T${qObj.scheduledDeployTime}`);
                if (target > deployStart) deployStart = target;
              }
              qObj.deployments.push({ id: qObj.currentDeploymentId, startTime: deployStart.toISOString() });
            } else {
              if (qObj.deployments && qObj.deployments.length > 0) {
                qObj.deployments[qObj.deployments.length - 1].endTime = new Date().toISOString();
              }
              if (dateInput) dateInput.value = '';
              if (timeInput) timeInput.value = '';
              qObj.scheduledDeployDate = '';
              qObj.scheduledDeployTime = '';
            }
            save(); // Sync to localStorage and Firebase
            btnDeploy.textContent = qObj.isDeployed ? 'End Tournament' : 'Deploy Quiz';
            btnDeploy.style.background = qObj.isDeployed ? '#ef4444' : '#10B981';
            btnDeploy.disabled = false;
            openQuizAnalytics(quizId); // Refresh to update dropdown
          };
        }
        // Deploy status badge logic
        const statusSpan = document.getElementById('qa-deploy-status');
        if (statusSpan) {
          if (window.deployStatusInterval) clearInterval(window.deployStatusInterval);
          
          const updateStatus = () => {
            if (qObj.isDeployed && qObj.deployments && qObj.deployments.length > 0) {
              const currentDep = qObj.deployments[qObj.deployments.length - 1];
              const start = new Date(currentDep.startTime);
              const now = Date.now();
              const pad = n => n.toString().padStart(2, '0');
              
              if (start.getTime() > now) {
                // Scheduled in the future
                const diff = start.getTime() - now;
                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                
                let timeStr = '';
                if (d > 0) timeStr += `${d}D `;
                timeStr += `${pad(h)}:${pad(m)}:${pad(s)}`;
                
                statusSpan.innerHTML = `${timeStr}<br><span style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; line-height: 1.5;">left to start</span>`;
                statusSpan.style.color = '#0ea5e9';
                statusSpan.style.fontSize = '1.6rem';
              } else {
                // Active deployment
                const diffMs = now - start.getTime();
                const hrs = Math.floor(diffMs / 3600000);
                const mins = Math.floor((diffMs % 3600000) / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                statusSpan.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
                statusSpan.style.color = '#10B981';
                statusSpan.style.fontSize = '2.2rem';
              }
            } else {
              // Not deployed
              statusSpan.textContent = 'Not Deployed';
              statusSpan.style.color = 'var(--text-secondary)';
              statusSpan.style.fontSize = '1.4rem';
            }
          };
          updateStatus();
          window.deployStatusInterval = setInterval(updateStatus, 1000);
          
          if (dateInput) dateInput.addEventListener('change', updateStatus);
          if (timeInput) timeInput.addEventListener('change', updateStatus);
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
        if (isArchive) {
          btnShowQR.style.opacity = '0.5';
          btnShowQR.style.cursor = 'not-allowed';
          btnShowQR.onclick = () => alert("QR code cannot be viewed for archived tests.");
        } else {
          btnShowQR.style.opacity = '1';
          btnShowQR.style.cursor = 'pointer';
          btnShowQR.onclick = () => {
            document.getElementById('qr-enlarge-modal').style.display = 'flex';
          };
        }
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
      
      // Question Analytics Table Population
      const qaBody = document.getElementById('question-analytics-tbody');
      if (qaBody) {
        if (qaData.length === 0) {
          qaBody.innerHTML = '<tr><td colspan="6" style="padding: 16px; text-align: center; color: var(--text-secondary);">No data yet.</td></tr>';
        } else {
          const qStats = {};
          qaData.forEach(a => {
            if (a.analysis && Array.isArray(a.analysis)) {
              a.analysis.forEach(q => {
                const idx = q.originalIndex !== undefined ? q.originalIndex : q.idx;
                if (idx === undefined) return;
                if (!qStats[idx]) {
                  qStats[idx] = { text: q.q, attempts: 0, correct: 0, timeSpent: 0 };
                }
                qStats[idx].attempts++;
                if (q.status === 'correct') qStats[idx].correct++;
                qStats[idx].timeSpent += (q.timeSpent || 0);
              });
            }
          });
          
          const sortedIndices = Object.keys(qStats).map(Number).sort((a,b)=>a-b);
          if (sortedIndices.length === 0) {
            qaBody.innerHTML = '<tr><td colspan="6" style="padding: 16px; text-align: center; color: var(--text-secondary);">No detailed question data found.</td></tr>';
          } else {
            let rows = '';
            sortedIndices.forEach(idx => {
              const s = qStats[idx];
              const cRate = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
              const wRate = 100 - cRate;
              const avgTime = s.attempts > 0 ? Math.round(s.timeSpent / s.attempts) : 0;
              const cColor = cRate > 50 ? '#10B981' : (cRate > 20 ? '#F59E0B' : '#EF4444');
              
              let txt = s.text;
              if (txt.length > 60) txt = txt.substring(0, 57) + '...';
              
              rows += `
                <tr>
                  <td style="padding: 10px;">${idx + 1}</td>
                  <td style="padding: 10px; max-width: 250px;" title="${s.text}">${txt}</td>
                  <td style="padding: 10px;">${s.attempts}</td>
                  <td style="padding: 10px; color:${cColor}; font-weight:600;">${cRate}%</td>
                  <td style="padding: 10px;">${wRate}%</td>
                  <td style="padding: 10px;">${avgTime}s</td>
                </tr>
              `;
            });
            qaBody.innerHTML = rows;
          }
        }
      }

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
          <div style="background:var(--surface); border-radius:12px; overflow:hidden; border:1px solid var(--section-divider);">
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
          let dRows = '';
          let mRows = '';
          
          let activeCount = 0;

          if (sessions.length === 0) {
            if (participantsBody) participantsBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (trackingBody) trackingBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (avgEl) avgEl.textContent = '0%';
            return;
          }

          sessions.sort((a,b) => (b.currentQuestion || 0) - (a.currentQuestion || 0));
          
          if (!window.previousSessionIndices) window.previousSessionIndices = {};
          let currentIndices = {};

          sessions.forEach((s, index) => {
            currentIndices[s.uid] = index;
            let animClass = '';
            let prevIndex = window.previousSessionIndices[s.uid];
            if (prevIndex !== undefined) {
               if (index < prevIndex) animClass = 'row-slide-up';
               else if (index > prevIndex) animClass = 'row-slide-down';
            }
            const name = s.participantName || 'Anonymous';
            const sidStr = s.sid || 'N/A';

            if (s.status === 'kicked') {
              const unbanBtn = `<button onclick="window.unbanParticipant('${s.uid}')" style="background:rgba(16,185,129,0.1); border:none; color:#10B981; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Unban</button>`;
              dRows += `<tr><td style="padding:10px; border-bottom: 1px solid var(--section-divider);">${name}</td><td style="padding:10px; border-bottom: 1px solid var(--section-divider);">${sidStr}</td><td style="padding:10px; text-align:right; border-bottom: 1px solid var(--section-divider);">${unbanBtn}</td></tr>`;
              return;
            }
            
            activeCount++;

            const muteBtnColor = s.isMuted ? '#ef4444' : '#10B981';
            const muteBtnIcon = s.isMuted 
              ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><line x1="17" y1="9" x2="23" y2="15"></line><line x1="23" y1="9" x2="17" y2="15"></line></svg>` 
              : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`;
            
            const muteBtn = `<button onclick="window.muteParticipant('${s.uid}', ${!s.isMuted})" style="background:transparent; border:none; color:${muteBtnColor}; cursor:pointer; margin-right:8px;" title="${s.isMuted ? 'Unmute Participant' : 'Mute Participant'}">${muteBtnIcon}</button>`;
            const delBtn = `<button onclick="window.removeParticipant('${s.uid}')" style="background:transparent; border:none; color:#ef4444; cursor:pointer;" title="Remove Participant"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg></button>`;

            if (s.isMuted) {
              const unmuteBtn = `<button onclick="window.muteParticipant('${s.uid}', false)" style="background:rgba(16,185,129,0.1); border:none; color:#10B981; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Unmute</button>`;
              mRows += `<tr><td style="padding:10px; border-bottom: 1px solid var(--section-divider);">${name}</td><td style="padding:10px; border-bottom: 1px solid var(--section-divider);">${sidStr}</td><td style="padding:10px; text-align:right; border-bottom: 1px solid var(--section-divider);">${unmuteBtn}</td></tr>`;
            }

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

            pRows += `<tr><td style="padding:10px;">${name}</td><td style="padding:10px;">${sidStr}</td><td style="padding:10px; text-align:right;">${muteBtn}${delBtn}</td></tr>`;
            tRows += `<tr class="${animClass}">
              <td style="padding:10px;">${name}</td>
              <td style="padding:10px;">${isWaiting ? curQ : 'Q'+curQ}</td>
              <td style="padding:10px;">${att}</td>
              <td style="padding:10px;">${skip}</td>
              <td style="padding:10px; color:${tab>0?'#ef4444':'inherit'}">${tab}</td>
              <td style="padding:10px; color:${min>0?'#f59e0b':'inherit'}">${min}</td>
              <td style="padding:10px;">${isWaiting ? '-' : tQ+'s'}</td>
              <td style="padding:10px;">${isWaiting ? '-' : elapsedSec+'s'}</td>
              <td style="padding:10px; text-align:right;">${muteBtn}${delBtn}</td>
            </tr>`;
          });

          if (participantsBody) participantsBody.innerHTML = pRows;
          if (trackingBody) trackingBody.innerHTML = tRows;
          
          window.previousSessionIndices = currentIndices;
          
          const dBody = document.getElementById('live-banned-tbody');
          if (dBody) dBody.innerHTML = dRows || '<tr><td colspan="3" style="text-align:center; padding:10px;">No banned users</td></tr>';
          
          const mBody = document.getElementById('live-muted-tbody');
          if (mBody) mBody.innerHTML = mRows || '<tr><td colspan="3" style="text-align:center; padding:10px;">No muted users</td></tr>';
          
          if (avgEl) avgEl.textContent = activeCount > 0 ? Math.round(totalPercent / activeCount) + '%' : '0%';
        });

      // 2. Listen to Live Chats
      if (window.rtdb) {
        const chatRef = window.rtdb.ref('live_chats/' + quizId);
        chatRef.on('value', snap => {
          if (!chatMessages) return;
          chatMessages.innerHTML = '';
          if (!snap.exists()) {
            chatMessages.innerHTML = '<div style="text-align:center; color:gray; font-size:0.85rem; padding: 16px;">No messages yet.</div>';
            return;
          }
          const msgs = [];
          snap.forEach(child => { msgs.push(child.val()); });
          msgs.sort((a, b) => {
            const t1 = a.timestamp || Date.now();
            const t2 = b.timestamp || Date.now();
            return t1 - t2;
          });
          msgs.forEach(msg => {
            const isAdmin = msg.sender === 'Admin';
            const align = msg.isPinned ? 'center' : (isAdmin ? 'flex-end' : 'flex-start');
            const bg = msg.isPinned ? '#fef08a' : (isAdmin ? '#0ea5e9' : '#ffffff');
            const color = msg.isPinned ? '#854d0e' : (isAdmin ? 'white' : 'var(--text)');
            const textAlign = msg.isPinned ? 'center' : (isAdmin ? 'right' : 'left');
            const border = msg.isPinned ? '1px solid #fde047' : '1px solid #e5e7eb';
            const senderColor = msg.isPinned ? 'var(--text)' : 'var(--text-secondary)';
            
            chatMessages.innerHTML += `
              <div style="display:flex; flex-direction:column; align-items:${align}; margin-bottom:8px;">
                <span style="font-size:0.7rem; color:${senderColor}; margin-bottom:2px; font-weight:600;">${msg.isPinned ? '📌 ' : ''}${msg.sender}</span>
                <div style="background:${bg}; color:${color}; padding:6px 10px; border-radius:12px; max-width:80%; font-size:0.8rem; text-align:${textAlign}; word-break:break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: ${border};">
                  ${msg.message}
                </div>
              </div>
            `;
          });
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
        liveChatsUnsubscribe = () => chatRef.off('value');
      }
    };

    window.stopLiveTournamentStats = function() {
      if (liveSessionsUnsubscribe) liveSessionsUnsubscribe();
      if (liveChatsUnsubscribe) liveChatsUnsubscribe();
      liveSessionsUnsubscribe = null;
      liveChatsUnsubscribe = null;
    };

    // ══════════════════════ ADMIN SETTINGS PAGE LOGIC ══════════════════════

    // Tab Navigation
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-settings-tab');
        
        document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('settings-tab-' + tabName);
        if (panel) panel.classList.add('active');

        // Populate about stats when that tab opens
        if (tabName === 'about') {
          const totalQ = quizzes.reduce((s, q) => s + (q.questions ? q.questions.length : 0), 0);
          document.getElementById('about-total-quizzes').textContent = quizzes.length;
          document.getElementById('about-total-questions').textContent = totalQ;
          document.getElementById('about-total-attempts').textContent = globalAttempts ? globalAttempts.length : 0;
        }
      });
    });

    // ── Profile Save / Load ──
    const SETTINGS_KEY = 'qs_admin_settings';
    function loadSettings() {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      if (s.orgName) document.getElementById('set-org-name').value = s.orgName;
      if (s.adminName) document.getElementById('set-admin-name').value = s.adminName;
      if (s.phone) document.getElementById('set-admin-phone').value = s.phone;
      if (s.welcomeMsg) document.getElementById('set-welcome-msg').value = s.welcomeMsg;
      
      // Load email from session
      const email = sessionStorage.getItem('qs_admin_id');
      if (email) document.getElementById('set-admin-email').value = email;

      // Load quiz defaults
      if (s.defaultTime) document.getElementById('set-default-time').value = s.defaultTime;
      if (s.defaultVisibility) document.getElementById('set-default-visibility').value = s.defaultVisibility;
      if (s.defaultAttempts) document.getElementById('set-default-attempts').value = s.defaultAttempts;
      if (s.defaultShuffle) document.getElementById('set-default-shuffle').value = s.defaultShuffle;
      if (s.showAnswers !== undefined) document.getElementById('set-show-answers').checked = s.showAnswers;
      if (s.tabDetection !== undefined) document.getElementById('set-tab-detection').checked = s.tabDetection;
      if (s.autoCollapse !== undefined) document.getElementById('set-auto-collapse').checked = s.autoCollapse;

      return s;
    }

    function saveSettings(partial) {
      const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      const merged = { ...current, ...partial };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      
      // Also sync to Firebase
      if (window.db) {
        window.db.collection('global').doc('adminSettings').set(merged)
          .catch(e => console.error('Error saving settings:', e));
      }
    }

    function flashStatus(id, text) {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text || '✓ Saved';
      el.style.display = 'inline';
      setTimeout(() => { el.style.display = 'none'; }, 2500);
    }

    // Initialize settings on page load
    loadSettings();

    // Session info
    const sessionInfo = document.getElementById('set-session-info');
    if (sessionInfo) {
      sessionInfo.textContent = 'Active now · ' + navigator.userAgent.split('(')[1]?.split(')')[0] || 'This browser';
    }

    // Profile Save
    const btnSaveProfile = document.getElementById('btn-save-profile');
    if (btnSaveProfile) {
      btnSaveProfile.addEventListener('click', () => {
        saveSettings({
          orgName: document.getElementById('set-org-name').value.trim(),
          adminName: document.getElementById('set-admin-name').value.trim(),
          phone: document.getElementById('set-admin-phone').value.trim(),
          welcomeMsg: document.getElementById('set-welcome-msg').value.trim()
        });
        flashStatus('profile-save-status');
      });
    }

    // ── Password Change ──
    const newPassInput = document.getElementById('set-new-pass');
    if (newPassInput) {
      newPassInput.addEventListener('input', () => {
        const val = newPassInput.value;
        const fill = document.getElementById('pass-strength-fill');
        const txt = document.getElementById('pass-strength-text');
        let strength = 0;
        if (val.length >= 6) strength++;
        if (val.length >= 10) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^a-zA-Z0-9]/.test(val)) strength++;

        const pct = (strength / 5) * 100;
        const colors = ['#ef4444', '#ef4444', '#f59e0b', '#10B981', '#10B981'];
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        fill.style.width = pct + '%';
        fill.style.background = colors[Math.min(strength, 4)];
        txt.textContent = val.length > 0 ? labels[Math.min(strength, 4)] : '';
      });
    }

    const btnUpdatePass = document.getElementById('btn-update-password');
    if (btnUpdatePass) {
      btnUpdatePass.addEventListener('click', async () => {
        const current = document.getElementById('set-current-pass').value;
        const newP = document.getElementById('set-new-pass').value;
        const confirm = document.getElementById('set-confirm-pass').value;
        const statusEl = document.getElementById('pass-save-status');

        if (!current || !newP || !confirm) {
          statusEl.textContent = '⚠ Please fill in all fields';
          statusEl.style.color = '#ef4444';
          statusEl.style.display = 'inline';
          setTimeout(() => statusEl.style.display = 'none', 3000);
          return;
        }
        if (newP !== confirm) {
          statusEl.textContent = '⚠ Passwords do not match';
          statusEl.style.color = '#ef4444';
          statusEl.style.display = 'inline';
          setTimeout(() => statusEl.style.display = 'none', 3000);
          return;
        }
        if (newP.length < 6) {
          statusEl.textContent = '⚠ Password must be at least 6 characters';
          statusEl.style.color = '#ef4444';
          statusEl.style.display = 'inline';
          setTimeout(() => statusEl.style.display = 'none', 3000);
          return;
        }

        try {
          btnUpdatePass.textContent = 'Updating...';
          const user = firebase.auth().currentUser;
          const email = sessionStorage.getItem('qs_admin_id');
          const cred = firebase.auth.EmailAuthProvider.credential(email, current);
          await user.reauthenticateWithCredential(cred);
          await user.updatePassword(newP);

          document.getElementById('set-current-pass').value = '';
          document.getElementById('set-new-pass').value = '';
          document.getElementById('set-confirm-pass').value = '';
          document.getElementById('pass-strength-fill').style.width = '0%';
          document.getElementById('pass-strength-text').textContent = '';

          statusEl.textContent = '✓ Password updated';
          statusEl.style.color = '#10B981';
          statusEl.style.display = 'inline';
          setTimeout(() => statusEl.style.display = 'none', 3000);
        } catch(e) {
          statusEl.textContent = '⚠ ' + (e.message || 'Error updating password');
          statusEl.style.color = '#ef4444';
          statusEl.style.display = 'inline';
          setTimeout(() => statusEl.style.display = 'none', 4000);
        }
        btnUpdatePass.textContent = 'Update Password';
      });
    }

    // Password visibility toggle
    window.togglePasswordVisibility = function(btn) {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    };

    // Logout all devices
    const btnLogoutAll = document.getElementById('btn-logout-all');
    if (btnLogoutAll) {
      btnLogoutAll.addEventListener('click', async () => {
        if (!window.confirm('Log out from all devices? You will need to log in again.')) return;
        try {
          if (window.firebase) await firebase.auth().signOut();
          sessionStorage.removeItem('qs_admin');
          sessionStorage.removeItem('qs_admin_id');
          window.location.href = 'active-quiz.html';
        } catch(e) { console.error(e); }
      });
    }

    // ── Theme Picker ──
    const themeOptions = document.querySelectorAll('.theme-option');
    function applyThemePicker() {
      const saved = localStorage.getItem('qs-theme') || 'light';
      const savedPref = localStorage.getItem('qs-theme-pref') || saved;
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-theme-val') === savedPref);
      });
    }
    applyThemePicker();

    themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-theme-val');
        localStorage.setItem('qs-theme-pref', val);
        
        let effectiveTheme = val;
        if (val === 'system') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        localStorage.setItem('qs-theme', effectiveTheme);
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        applyThemePicker();

        // Update the theme toggle button icon
        const toggleBtn = document.querySelector('.admin-theme-toggle');
        if (toggleBtn) {
          const sunIcon = toggleBtn.querySelector('.icon-sun');
          const moonIcon = toggleBtn.querySelector('.icon-moon');
          if (effectiveTheme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
          } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
          }
        }
      });
    });

    // ── Quiz Defaults Save ──
    const btnSaveDefaults = document.getElementById('btn-save-quiz-defaults');
    if (btnSaveDefaults) {
      btnSaveDefaults.addEventListener('click', () => {
        saveSettings({
          defaultTime: document.getElementById('set-default-time').value,
          defaultVisibility: document.getElementById('set-default-visibility').value,
          defaultAttempts: document.getElementById('set-default-attempts').value,
          defaultShuffle: document.getElementById('set-default-shuffle').value,
          showAnswers: document.getElementById('set-show-answers').checked,
          tabDetection: document.getElementById('set-tab-detection').checked
        });
        flashStatus('defaults-save-status');
      });
    }

    // ── Auto Collapse Sidebar ──
    const autoCollapseToggle = document.getElementById('set-auto-collapse');
    if (autoCollapseToggle) {
      autoCollapseToggle.addEventListener('change', () => {
        saveSettings({ autoCollapse: autoCollapseToggle.checked });
      });
    }

    // ── Menti (Survey) Settings ──
    // Load survey settings
    (function loadSurveySettings() {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      if (s.surveyType) { const el = document.getElementById('set-survey-type'); if (el) el.value = s.surveyType; }
      if (s.surveyTimer !== undefined) { const el = document.getElementById('set-survey-timer'); if (el) el.value = s.surveyTimer; }
      if (s.surveyRequireName !== undefined) { const el = document.getElementById('set-survey-require-name'); if (el) el.checked = s.surveyRequireName; }
      if (s.surveyMultiResponse !== undefined) { const el = document.getElementById('set-survey-multi-response'); if (el) el.checked = s.surveyMultiResponse; }
      if (s.surveyTransition) { const el = document.getElementById('set-survey-transition'); if (el) el.value = s.surveyTransition; }
      if (s.surveyResultsDisplay) { const el = document.getElementById('set-survey-results-display'); if (el) el.value = s.surveyResultsDisplay; }
      if (s.surveyShowCount !== undefined) { const el = document.getElementById('set-survey-show-count'); if (el) el.checked = s.surveyShowCount; }
      if (s.surveyAutoAdvance !== undefined) { const el = document.getElementById('set-survey-auto-advance'); if (el) el.checked = s.surveyAutoAdvance; }
    })();

    // Save survey defaults
    const btnSaveSurveyDefaults = document.getElementById('btn-save-survey-defaults');
    if (btnSaveSurveyDefaults) {
      btnSaveSurveyDefaults.addEventListener('click', () => {
        saveSettings({
          surveyType: document.getElementById('set-survey-type').value,
          surveyTimer: document.getElementById('set-survey-timer').value,
          surveyRequireName: document.getElementById('set-survey-require-name').checked,
          surveyMultiResponse: document.getElementById('set-survey-multi-response').checked,
          surveyTransition: document.getElementById('set-survey-transition').value,
          surveyResultsDisplay: document.getElementById('set-survey-results-display').value,
          surveyShowCount: document.getElementById('set-survey-show-count').checked,
          surveyAutoAdvance: document.getElementById('set-survey-auto-advance').checked
        });
        flashStatus('survey-defaults-save-status');
      });
    }

    // Export survey responses
    const btnExportSurveyResponses = document.getElementById('btn-export-survey-responses');
    if (btnExportSurveyResponses) {
      btnExportSurveyResponses.addEventListener('click', async () => {
        if (!window.db) { alert('Firebase not connected'); return; }
        try {
          btnExportSurveyResponses.textContent = 'Exporting...';
          const snap = await window.db.collection('survey_responses').get();
          let csv = 'Survey ID,Slide Index,Participant,Response,Submitted At\n';
          snap.forEach(doc => {
            const d = doc.data();
            csv += `"${(d.surveyId||'').replace(/"/g,'""')}",${d.slideIndex||0},"${(d.participantName||'Anonymous').replace(/"/g,'""')}","${(d.response||'').replace(/"/g,'""')}","${d.timestamp||''}"\n`;
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qs_survey_responses_${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } catch(e) {
          console.error(e);
          alert('Error exporting: ' + e.message);
        }
        btnExportSurveyResponses.textContent = 'Export All Responses (CSV)';
      });
    }

    // Clear survey responses
    const btnClearSurveyResponses = document.getElementById('btn-clear-survey-responses');
    if (btnClearSurveyResponses) {
      btnClearSurveyResponses.addEventListener('click', async () => {
        if (!window.confirm('⚠ Are you ABSOLUTELY sure? This will permanently delete ALL survey response data.')) return;
        if (!window.confirm('This action CANNOT be undone. Click OK to proceed.')) return;
        if (!window.db) { alert('Firebase not connected'); return; }
        try {
          btnClearSurveyResponses.textContent = 'Clearing...';
          const snap = await window.db.collection('survey_responses').get();
          const batch = window.db.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          alert('All survey responses cleared successfully.');
        } catch(e) {
          console.error(e);
          alert('Error: ' + e.message);
        }
        btnClearSurveyResponses.textContent = 'Clear Responses';
      });
    }

    // ── Export JSON ──
    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const data = JSON.stringify(quizzes, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qs_quizzes_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // ── Export Attempts CSV ──
    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', async () => {
        if (!window.db) { alert('Firebase not connected'); return; }
        try {
          btnExportCsv.textContent = 'Exporting...';
          const snap = await window.db.collection('quiz_attempts').get();
          let csv = 'Quiz Name,Student Name,Score,Total Questions,Time Taken,Tab Switches,Minimizes,Submitted At\n';
          snap.forEach(doc => {
            const d = doc.data();
            let isActiveTournament = false;
            if (d.mode === 'tournament' && d.quizId) {
              const q = typeof quizzes !== 'undefined' ? quizzes.find(qz => qz.id === d.quizId) : null;
              if (q && q.isDeployed) {
                if (!d.deploymentId || q.currentDeploymentId === d.deploymentId) {
                  isActiveTournament = true;
                }
              }
            }
            if (!isActiveTournament) {
              csv += `"${(d.quizName||'').replace(/"/g,'""')}","${(d.studentName||d.participantName||'Anonymous').replace(/"/g,'""')}",${d.score||0},${d.totalQuestions||0},${d.timeTaken||0},${d.tabSwitches||0},${d.minimizes||0},"${d.submittedAt||''}"\n`;
            }
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qs_attempts_${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          btnExportCsv.textContent = 'Export Attempts (CSV)';
        } catch(e) {
          console.error(e);
          alert('Error exporting: ' + e.message);
          btnExportCsv.textContent = 'Export Attempts (CSV)';
        }
      });
    }

    // ── Import JSON ──
    const importDrop = document.getElementById('import-drop-zone');
    const importInput = document.getElementById('import-file-input');
    if (importDrop && importInput) {
      importDrop.addEventListener('click', () => importInput.click());
      importDrop.addEventListener('dragover', e => { e.preventDefault(); importDrop.style.borderColor = '#0ea5e9'; });
      importDrop.addEventListener('dragleave', () => { importDrop.style.borderColor = ''; });
      importDrop.addEventListener('drop', e => {
        e.preventDefault();
        importDrop.style.borderColor = '';
        if (e.dataTransfer.files.length) processImportFile(e.dataTransfer.files[0]);
      });
      importInput.addEventListener('change', () => {
        if (importInput.files.length) processImportFile(importInput.files[0]);
      });
    }

    function processImportFile(file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('Invalid format: expected an array of quizzes');
          if (!window.confirm(`Import ${data.length} quizzes? This will REPLACE all existing quizzes.`)) return;
          quizzes.length = 0;
          data.forEach(q => quizzes.push(q));
          save();
          renderDashboard();
          alert('Successfully imported ' + data.length + ' quizzes!');
        } catch(err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    // ── Danger Zone ──
    const btnClearAttempts = document.getElementById('btn-clear-all-attempts');
    if (btnClearAttempts) {
      btnClearAttempts.addEventListener('click', async () => {
        if (!window.confirm('⚠ Are you ABSOLUTELY sure? This will permanently delete ALL student attempt data.')) return;
        if (!window.confirm('This action CANNOT be undone. Type "yes" by clicking OK to proceed.')) return;
        if (!window.db) { alert('Firebase not connected'); return; }
        try {
          btnClearAttempts.textContent = 'Clearing...';
          const snap = await window.db.collection('quiz_attempts').get();
          const batch = window.db.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          globalAttempts = [];
          alert('All attempts cleared successfully.');
          btnClearAttempts.textContent = 'Clear Attempts';
        } catch(e) {
          console.error(e);
          alert('Error: ' + e.message);
          btnClearAttempts.textContent = 'Clear Attempts';
        }
      });
    }

    const btnDeleteAll = document.getElementById('btn-delete-all-quizzes');
    if (btnDeleteAll) {
      btnDeleteAll.addEventListener('click', () => {
        if (!window.confirm('⚠ DELETE ALL QUIZZES? This will permanently remove every single quiz.')) return;
        if (!window.confirm('Last chance. This CANNOT be undone. Click OK to delete everything.')) return;
        quizzes.length = 0;
        save();
        renderDashboard();
        alert('All quizzes have been deleted.');
      });
    }
  
  })();
  