/* ============================================================
   QUIZZING SOCIETY — QUIZ ADMIN PANEL
   Login, Question CRUD, Quiz Mode Builder
   ============================================================ */

(function () {
  'use strict';

  // Admin credentials (demo — not production secure)
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'qs_iitgn_2026';

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyReplace",
    authDomain: "qs-iitgn.firebaseapp.com",
    databaseURL: "https://qs-iitgn-default-rtdb.firebaseio.com",
    projectId: "qs-iitgn",
    storageBucket: "qs-iitgn.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:abcdef123456"
  };

  let db = null;
  let useLocalFallback = firebaseConfig.apiKey === "AIzaSyDemoKeyReplace";
  if (typeof firebase !== 'undefined' && !useLocalFallback) {
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }

  // State
  let questions = [];
  let isLoggedIn = sessionStorage.getItem('qs_admin') === 'true';

  // DOM refs
  const els = {};

  function cacheDom() {
    // New admin.html elements
    els.loginOverlay = document.getElementById('admin-login-overlay');
    els.loginForm = document.getElementById('admin-login-form');
    els.loginError = document.getElementById('admin-login-error');
    els.usernameInput = document.getElementById('admin-username');
    els.passwordInput = document.getElementById('admin-password');
    els.dashboard = document.getElementById('admin-dashboard');
    els.logoutBtn = document.getElementById('admin-logout-btn');

    // Legacy quiz.html elements (kept for backwards compatibility)
    els.loginBtn = document.getElementById('admin-login-btn');
    els.modalOverlay = document.getElementById('admin-modal-overlay');
    els.modalClose = document.getElementById('admin-modal-close');
    els.panel = document.getElementById('admin-panel');
    els.trigger = document.getElementById('admin-trigger');

    // Shared form elements
    els.addForm = document.getElementById('add-question-form');
    els.questionType = document.querySelectorAll('.type-btn');
    els.questionText = document.getElementById('aq-question');
    els.categoryInput = document.getElementById('aq-category');
    els.difficultyInput = document.getElementById('aq-difficulty');
    els.timerMin = document.getElementById('aq-timer-min');
    els.timerSec = document.getElementById('aq-timer-sec');
    els.optionsContainer = document.getElementById('aq-options-container');
    els.integerAnswer = document.getElementById('aq-integer-answer');
    els.questionsBody = document.getElementById('questions-table-body');
    els.questionCount = document.getElementById('question-count');
    els.quizModeName = document.getElementById('qm-name');
    els.quizModeTime = document.getElementById('qm-time');
    els.createQuizBtn = document.getElementById('create-quiz-btn');
  }

  let currentType = 'mcq';

  // ── Login / Logout ──
  function showLoginScreen() {
    // New admin.html
    if (els.loginOverlay) {
      els.loginOverlay.classList.remove('hidden');
    }
    // Legacy quiz.html
    if (els.modalOverlay) {
      els.modalOverlay.classList.add('active');
      setTimeout(() => els.usernameInput && els.usernameInput.focus(), 300);
    }
  }

  function hideLoginScreen() {
    if (els.loginOverlay) {
      els.loginOverlay.classList.add('hidden');
    }
    if (els.modalOverlay) {
      els.modalOverlay.classList.remove('active');
    }
    if (els.loginError) els.loginError.classList.remove('visible');
  }

  function showDashboard() {
    // New admin.html
    if (els.dashboard) {
      els.dashboard.classList.add('active');
    }
    // Legacy quiz.html
    if (els.trigger) els.trigger.style.display = 'none';
    if (els.panel) els.panel.classList.add('active');

    loadQuestions();
  }

  function hideDashboard() {
    if (els.dashboard) {
      els.dashboard.classList.remove('active');
    }
    if (els.trigger) els.trigger.style.display = 'block';
    if (els.panel) els.panel.classList.remove('active');
  }

  function handleLogin(e) {
    e.preventDefault();
    const user = els.usernameInput.value.trim();
    const pass = els.passwordInput.value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('qs_admin', 'true');
      isLoggedIn = true;
      hideLoginScreen();
      showDashboard();
    } else {
      if (els.loginError) els.loginError.classList.add('visible');
      if (els.passwordInput) {
        els.passwordInput.value = '';
        els.passwordInput.focus();
      }
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('qs_admin');
    isLoggedIn = false;
    hideDashboard();
    showLoginScreen();
  }

  // ── Question type switching ──
  function setQuestionType(type) {
    currentType = type;
    els.questionType.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    const optC = els.optionsContainer;
    const intC = els.integerAnswer;
    if (!optC || !intC) return;

    if (type === 'integer') {
      optC.style.display = 'none';
      intC.style.display = 'block';
    } else {
      optC.style.display = 'block';
      intC.style.display = 'none';
      const inputs = optC.querySelectorAll('.correct-marker');
      inputs.forEach(inp => {
        inp.type = type === 'mcq' ? 'checkbox' : 'radio';
        inp.name = 'correct-option';
        inp.checked = false;
      });
    }
  }

  // ── Add question ──
  function handleAddQuestion(e) {
    e.preventDefault();

    const questionData = {
      type: currentType,
      question: els.questionText.value.trim(),
      category: els.categoryInput.value.trim() || 'General',
      difficulty: parseInt(els.difficultyInput.value) || 3,
      timer: (parseInt(els.timerMin.value) || 0) * 60 + (parseInt(els.timerSec.value) || 30),
      created_at: new Date().toISOString()
    };

    if (!questionData.question) {
      alert('Please enter a question');
      return;
    }

    if (currentType === 'integer') {
      const intAns = document.getElementById('aq-int-value');
      questionData.answer = parseInt(intAns.value);
      if (isNaN(questionData.answer)) {
        alert('Please enter the integer answer');
        return;
      }
    } else {
      const optInputs = els.optionsContainer.querySelectorAll('.option-text');
      const correctInputs = els.optionsContainer.querySelectorAll('.correct-marker');
      const options = [];
      const correctAnswers = [];

      optInputs.forEach((inp, i) => {
        if (inp.value.trim()) {
          options.push(inp.value.trim());
          if (correctInputs[i] && correctInputs[i].checked) {
            correctAnswers.push(i);
          }
        }
      });

      if (options.length < 2) {
        alert('Please enter at least 2 options');
        return;
      }
      if (correctAnswers.length === 0) {
        alert('Please mark at least one correct answer');
        return;
      }

      questionData.options = options;
      questionData.correctAnswers = correctAnswers;
    }

    if (db) {
      db.ref('quizQuestions').push(questionData)
        .then(() => {
          resetAddForm();
          loadQuestions();
        })
        .catch(err => console.error('Error adding question:', err));
    } else {
      questionData.id = 'local_' + Date.now();
      questions.push(questionData);
      renderQuestions();
      resetAddForm();
      console.log('Question added locally:', questionData);
    }
  }

  function resetAddForm() {
    if (els.addForm) els.addForm.reset();
    setQuestionType('mcq');
  }

  // ── Delete question ──
  function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    if (db && !id.startsWith('local_')) {
      db.ref('quizQuestions/' + id).remove()
        .then(() => loadQuestions());
    } else {
      questions = questions.filter(q => q.id !== id);
      renderQuestions();
    }
  }

  // ── Reorder questions ──
  function moveQuestionUp(index) {
    if (index > 0) {
      const temp = questions[index];
      questions[index] = questions[index - 1];
      questions[index - 1] = temp;
      saveOrderToFirebase();
      renderQuestions();
    }
  }

  function moveQuestionDown(index) {
    if (index < questions.length - 1) {
      const temp = questions[index];
      questions[index] = questions[index + 1];
      questions[index + 1] = temp;
      saveOrderToFirebase();
      renderQuestions();
    }
  }

  function saveOrderToFirebase() {
    if (db && !useLocalFallback) {
      const updates = {};
      questions.forEach((q) => {
        updates[q.id] = q;
      });
      db.ref('quizQuestions').set(updates);
    }
  }

  // ── Load questions ──
  function loadQuestions() {
    if (db) {
      db.ref('quizQuestions').on('value', snap => {
        questions = [];
        snap.forEach(child => {
          questions.push({ id: child.key, ...child.val() });
        });
        renderQuestions();
      });
    } else {
      renderQuestions();
    }
  }

  function renderQuestions() {
    if (!els.questionsBody) return;
    if (els.questionCount) els.questionCount.textContent = questions.length;

    if (questions.length === 0) {
      els.questionsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);">No questions yet. Add one above!</td></tr>';
      return;
    }

    els.questionsBody.innerHTML = questions.map((q, index) => `
      <tr class="q-row">
        <td style="font-weight: bold; color: var(--text-secondary);">#${index + 1}</td>
        <td><span class="q-type-badge ${q.type}">${q.type.toUpperCase()}</span></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${q.question}</td>
        <td>${q.category || 'General'}</td>
        <td>${q.timer ? Math.floor(q.timer/60) + 'm ' + (q.timer%60) + 's' : '30s'}</td>
        <td>
          <div class="table-actions">
            <button class="btn-action-arrow" onclick="window.QSAdmin.moveQuestionUp(${index})" title="Move Up">▲</button>
            <button class="btn-action-arrow" onclick="window.QSAdmin.moveQuestionDown(${index})" title="Move Down">▼</button>
            <button class="btn-delete" onclick="window.QSAdmin.deleteQuestion('${q.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ── Quiz mode ──
  function createQuizMode() {
    const name = els.quizModeName ? els.quizModeName.value.trim() : '';
    const time = els.quizModeTime ? parseInt(els.quizModeTime.value) : 0;

    if (!name) { alert('Enter a quiz mode name'); return; }
    if (questions.length === 0) { alert('Add questions first'); return; }

    const visibilityRadios = document.getElementsByName('qm-visibility');
    let isPublic = true;
    for (const radio of visibilityRadios) {
      if (radio.checked) {
        isPublic = radio.value === 'public';
        break;
      }
    }

    const quizMode = {
      name,
      totalTime: time * 60,
      questionIds: questions.map(q => q.id),
      questionCount: questions.length,
      isPublic: isPublic,
      created_at: new Date().toISOString()
    };

    let accessCode = '';
    if (!isPublic) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let i = 0; i < 8; i++) {
        accessCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      quizMode.accessCode = accessCode;
    }

    if (db) {
      db.ref('quizModes').push(quizMode)
        .then(() => {
          let msg = 'Quiz mode "' + name + '" created with ' + questions.length + ' questions!';
          if (!isPublic) {
            msg += '\n\nTournament Access Code: ' + accessCode;
          }
          alert(msg);
          if (els.quizModeName) els.quizModeName.value = '';
          if (els.quizModeTime) els.quizModeTime.value = '';
        });
    } else {
      console.log('Quiz mode created (local):', quizMode);
      let msg = 'Quiz mode "' + name + '" created (local mode)!';
      if (!isPublic) {
        msg += '\n\nTournament Access Code: ' + accessCode;
      }
      alert(msg);
    }
  }

  // ── Init ──
  function init() {
    cacheDom();

    // Login form submit
    if (els.loginForm) els.loginForm.addEventListener('submit', handleLogin);

    // Legacy modal triggers
    if (els.loginBtn) els.loginBtn.addEventListener('click', showLoginScreen);
    if (els.modalClose) els.modalClose.addEventListener('click', hideLoginScreen);
    if (els.modalOverlay) {
      els.modalOverlay.addEventListener('click', (e) => {
        if (e.target === els.modalOverlay) hideLoginScreen();
      });
    }

    // Logout
    if (els.logoutBtn) els.logoutBtn.addEventListener('click', handleLogout);

    // Add question form
    if (els.addForm) els.addForm.addEventListener('submit', handleAddQuestion);

    // Question type buttons
    els.questionType.forEach(btn => {
      btn.addEventListener('click', () => setQuestionType(btn.dataset.type));
    });

    // Create quiz mode
    if (els.createQuizBtn) els.createQuizBtn.addEventListener('click', createQuizMode);

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideLoginScreen();
    });

    // Check session
    if (isLoggedIn) {
      hideLoginScreen();
      showDashboard();
    } else {
      showLoginScreen();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for table buttons
  window.QSAdmin = { deleteQuestion, moveQuestionUp, moveQuestionDown };
})();
