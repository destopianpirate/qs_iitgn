/* ============================================================
   QUIZZING SOCIETY — JOIN FORM LOGIC
   Validation, Firebase submission, success animation
   ============================================================ */

(function () {
  'use strict';

  // Firebase config — replace with your own project keys
  const firebaseConfig = {
    apiKey: "AIzaSyDemoKeyReplace",
    authDomain: "qs-iitgn.firebaseapp.com",
    databaseURL: "https://qs-iitgn-default-rtdb.firebaseio.com",
    projectId: "qs-iitgn",
    storageBucket: "qs-iitgn.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:abcdef123456"
  };

  // Initialize Firebase only if SDK is loaded
  let db = null;
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }

  // Validators
  function validatePhone(phone) {
    const cleaned = phone.replace(/\s|-/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, msg) {
    field.classList.add('error');
    const errEl = field.parentElement.querySelector('.form-error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('visible');
    }
  }

  function clearError(field) {
    field.classList.remove('error');
    const errEl = field.parentElement.querySelector('.form-error');
    if (errEl) errEl.classList.remove('visible');
  }

  function clearAllErrors() {
    document.querySelectorAll('.form-field.error').forEach(f => clearError(f));
  }

  // Confetti
  function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.style.display = 'block';
    const colors = ['#0E8FE0', '#0047AB', '#4CB5F5', '#00AEEF', '#10B981', '#F59E0B'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confetti-fall ${Math.random() * 2 + 1.5}s ease-in forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.appendChild(piece);
    }
    setTimeout(() => {
      container.innerHTML = '';
      container.style.display = 'none';
    }, 4000);
  }

  function init() {
    const form = document.getElementById('join-form');
    if (!form) return;

    // Clear errors on input
    form.querySelectorAll('.form-field').forEach(field => {
      field.addEventListener('input', () => clearError(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();

      const name = form.querySelector('#join-name');
      const roll = form.querySelector('#join-roll');
      const email = form.querySelector('#join-email');
      const phone = form.querySelector('#join-phone');
      const programme = form.querySelector('#join-programme');
      const year = form.querySelector('#join-year');
      const reason = form.querySelector('#join-reason');
      const submitBtn = form.querySelector('.submit-btn');

      let valid = true;

      if (!name.value.trim()) { showError(name, 'Name is required'); valid = false; }
      if (!roll.value.trim()) { showError(roll, 'Roll number is required'); valid = false; }
      if (!validateEmail(email.value)) { showError(email, 'Enter a valid email'); valid = false; }
      if (!validatePhone(phone.value)) { showError(phone, 'Enter a valid 10-digit phone number'); valid = false; }
      if (!programme.value) { showError(programme, 'Select a programme'); valid = false; }
      if (!year.value) { showError(year, 'Select a joining year'); valid = false; }
      if (!reason.value.trim()) { showError(reason, 'Tell us why you want to join'); valid = false; }

      if (!valid) return;

      // Disable button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const data = {
        name: name.value.trim(),
        roll_no: roll.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        programme: programme.value,
        joining_year: year.value,
        reason: reason.value.trim(),
        submitted_at: new Date().toISOString()
      };

      try {
        if (db) {
          await db.ref('applications').push(data);
        } else {
          console.log('Firebase not configured. Form data:', data);
        }

        // Show success
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
        launchConfetti();
      } catch (err) {
        console.error('Submit error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
        alert('Something went wrong. Please try again.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
