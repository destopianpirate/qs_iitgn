const PROFANITY_LIST = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'pussy', 'bastard', 'slut', 'whore', 'fag', 'nigger', 'nigga', 'cock', 'piss', 'crap'];
function maskProfanity(text) {
  if (!text) return '';
  let masked = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    masked = masked.replace(regex, '*'.repeat(word.length));
  });
  return masked;
}

const REACTION_SVGS = {
  'like': `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
  'heart': `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  'smile': `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
  'star': `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  'bulb': `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2v1"></path><path d="M12 7a5 5 0 0 1 5 5c0 2-2 3-2 5h-6c0-2-2-3-2-5a5 5 0 0 1 5-5z"></path></svg>`
};

(function() {
window.SurveyState = window.SurveyState || {
  surveys: [],
  currentSurveyId: null,
  activeSlideIndex: 0,
  liveSurveyUnsubscribe: null,
  liveResponsesUnsubscribe: null,
  liveChart: null
};

  
  // Wait for firebase to load
  const initInterval = setInterval(() => {
    if (window.db) {
      window.db = window.db;
      clearInterval(initInterval);
      setupSurveys();
    }
  }, 100);

  
  
  
  
  // Live Presenter vars
  
  
  

  function setupSurveys() {
    // Buttons
    document.getElementById('btn-new-survey')?.addEventListener('click', async () => {
      const newSurvey = {
        id: 's_' + Date.now(),
        name: 'Untitled Survey',
        slides: [
          { id: 'sl_' + Date.now(), type: 'multiple_choice', question: 'What is your favorite color?', options: ['Red', 'Blue', 'Green'] }
        ],
        createdAt: Date.now()
      };
      window.SurveyState.surveys.push(newSurvey);
      await window.SurveyState.saveSurveys();
      editSurvey(newSurvey.id);
    });

    document.getElementById('btn-survey-editor-back')?.addEventListener('click', () => {
      window.showScreen('screen-window.SurveyState.surveys-dashboard');
      window.renderSurveysDashboard();
    });

    document.getElementById('btn-save-survey')?.addEventListener('click', async () => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey) {
        survey.name = document.getElementById('survey-title-input').value;
        await window.SurveyState.saveSurveys();
        alert('Survey Saved!');
      }
    });

    document.getElementById('btn-edit-survey-title')?.addEventListener('click', () => {
      const input = document.getElementById('survey-title-input');
      const container = document.getElementById('survey-title-container');
      if (input && container) {
        input.removeAttribute('readonly');
        container.style.borderColor = '#e2e8f0';
        input.focus();
      }
    });

    document.getElementById('survey-title-input')?.addEventListener('blur', async (e) => {
      const container = document.getElementById('survey-title-container');
      e.target.setAttribute('readonly', 'true');
      if (container) container.style.borderColor = 'transparent';
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey) {
        survey.name = e.target.value || 'Untitled Survey';
        await window.SurveyState.saveSurveys();
      }
    });

    document.getElementById('survey-title-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.target.blur();
    });

    document.getElementById('btn-add-slide')?.addEventListener('click', () => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey) {
        survey.slides.push({
          id: 'sl_' + Date.now(),
          type: 'multiple_choice',
          question: 'New Question',
          options: ['Option 1', 'Option 2']
        });
        window.SurveyState.activeSlideIndex = survey.slides.length - 1;
        renderEditor();
      }
    });

    document.getElementById('survey-slide-type')?.addEventListener('change', (e) => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
        survey.slides[window.SurveyState.activeSlideIndex].type = e.target.value;
        if (e.target.value !== 'multiple_choice' && e.target.value !== 'scales' && e.target.value !== 'ranking') {
          survey.slides[window.SurveyState.activeSlideIndex].options = [];
        }
        renderEditor();
      }
    });
    
    document.getElementById('survey-allow-multiple')?.addEventListener('change', (e) => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
        survey.slides[window.SurveyState.activeSlideIndex].allowMultiple = e.target.checked;
      }
    });

    document.getElementById('survey-question-text')?.addEventListener('input', (e) => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
        survey.slides[window.SurveyState.activeSlideIndex].question = e.target.value;
        document.getElementById('preview-question').innerHTML = e.target.value || 'Untitled Question';
      }
    });

    
    const previewContainer = document.getElementById('survey-slide-preview');
    const rtToolbar = document.getElementById('rich-text-toolbar');
    const styleToolbar = document.getElementById('style-toolbar');
    
    window.activeEditingTarget = null;
    window.activeStylingTargetType = null;
    
    if (previewContainer && rtToolbar && styleToolbar) {
      previewContainer.addEventListener('mousedown', (e) => {
        if (rtToolbar.contains(e.target) || styleToolbar.contains(e.target)) return;
        
        let isTextTarget = false;
        let isStyleTarget = false;
        
        if (e.target.hasAttribute('contenteditable') || e.target.closest('[contenteditable]')) {
          isTextTarget = true;
          const target = e.target.hasAttribute('contenteditable') ? e.target : e.target.closest('[contenteditable]');
          window.activeEditingTarget = target;
          
          previewContainer.querySelectorAll('[contenteditable]').forEach(el => el.style.outline = 'none');
          target.style.outline = '2px dashed rgba(14,165,233,0.5)';
          target.style.outlineOffset = '4px';
          
          rtToolbar.style.display = 'flex';
          styleToolbar.style.display = 'none';
          
          const rect = target.getBoundingClientRect();
          const pRect = previewContainer.parentElement.getBoundingClientRect();
          rtToolbar.style.top = (rect.bottom + 8) + 'px';
          
          let leftPos = rect.left;
          if (leftPos + 400 > window.innerWidth) leftPos = window.innerWidth - 400; // prevent overflow
          rtToolbar.style.left = Math.max(0, leftPos) + 'px';
        } else {
          rtToolbar.style.display = 'none';
          previewContainer.querySelectorAll('[contenteditable]').forEach(el => el.style.outline = 'none');
        }
        
        const styleEl = e.target.closest('[data-style-target]');
        if (styleEl && !isTextTarget) {
          isStyleTarget = true;
          window.activeStylingTargetType = styleEl.getAttribute('data-style-target');
          
          styleToolbar.style.display = 'flex';
          const rect = styleEl.getBoundingClientRect();
          styleToolbar.style.top = (rect.bottom + 8) + 'px';
let leftPos = rect.left;
if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 300;
styleToolbar.style.left = Math.max(0, leftPos) + 'px';
        } else if (!isTextTarget) {
          styleToolbar.style.display = 'none';
        }
      });
      
      document.addEventListener('mousedown', (e) => {
        if (!previewContainer.contains(e.target) && !rtToolbar.contains(e.target) && !styleToolbar.contains(e.target)) {
          rtToolbar.style.display = 'none';
          styleToolbar.style.display = 'none';
          previewContainer.querySelectorAll('[contenteditable]').forEach(el => el.style.outline = 'none');
        }
      });
      
      previewContainer.addEventListener('input', (e) => {
        const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
        if (!survey || !survey.slides[window.SurveyState.activeSlideIndex]) return;
        
        if (e.target.id === 'preview-question') {
          survey.slides[window.SurveyState.activeSlideIndex].question = e.target.innerHTML;
          document.getElementById('survey-question-text').value = e.target.innerHTML;
        } else if (e.target.hasAttribute('data-option-idx')) {
          const idx = parseInt(e.target.getAttribute('data-option-idx'));
          window.updateOption(idx, e.target.innerHTML, true);
        } else if (e.target.id === 'preview-submit-btn-text') {
          if(!survey.slides[window.SurveyState.activeSlideIndex].styles) survey.slides[window.SurveyState.activeSlideIndex].styles = {};
          survey.slides[window.SurveyState.activeSlideIndex].styles.submitText = e.target.innerHTML;
        }
        window.SurveyState.debouncedSaveSurveys();
      });
    }

    document.getElementById('btn-survey-add-option')?.addEventListener('click', () => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex] && ['multiple_choice', 'scales', 'ranking'].includes(survey.slides[window.SurveyState.activeSlideIndex].type)) {
        survey.slides[window.SurveyState.activeSlideIndex].options.push('New Option');
        renderEditor();
      }
    });
    
    document.getElementById('survey-require-name')?.addEventListener('change', (e) => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey) {
        survey.requireName = e.target.checked;
      }
    });

    document.getElementById('survey-slide-theme')?.addEventListener('change', (e) => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
        survey.slides[window.SurveyState.activeSlideIndex].theme = e.target.value;
        renderEditor(); // update preview
      }
    });

    document.querySelectorAll('.survey-reaction-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
        if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
          let reactions = survey.slides[window.SurveyState.activeSlideIndex].reactions || [];
          const val = e.target.value;
          if (e.target.checked && !reactions.includes(val)) {
            reactions.push(val);
          } else if (!e.target.checked && reactions.includes(val)) {
            reactions = reactions.filter(r => r !== val);
          }
          survey.slides[window.SurveyState.activeSlideIndex].reactions = reactions;
        }
      });
    });

    document.getElementById('btn-preview-survey')?.addEventListener('click', () => {
      const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
      if (survey && survey.slides[window.SurveyState.activeSlideIndex]) {
        const modal = document.getElementById('survey-preview-modal');
        const container = document.getElementById('survey-preview-container');
        modal.style.display = 'flex';
        // Need to render the slide similarly to quiz.js
        renderSimulatedStudentSlide(container, survey.slides[window.SurveyState.activeSlideIndex], survey.requireName);
      }
    });

    document.getElementById('btn-close-preview')?.addEventListener('click', () => {
      document.getElementById('survey-preview-modal').style.display = 'none';
    });
    
    document.getElementById('btn-live-survey-back')?.addEventListener('click', () => {
      stopLiveSurvey();
      window.showScreen('screen-window.SurveyState.surveys-dashboard');
      window.renderSurveysDashboard();
    });
    
    document.getElementById('btn-live-fullscreen')?.addEventListener('click', () => {
      const container = document.getElementById('screen-survey-live-admin');
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
    
    document.addEventListener('fullscreenchange', () => {
      const isFs = !!document.fullscreenElement;
      const iconEnter = document.getElementById('icon-fullscreen-enter');
      const iconExit = document.getElementById('icon-fullscreen-exit');
      if(iconEnter && iconExit) {
        iconEnter.style.display = isFs ? 'none' : 'block';
        iconExit.style.display = isFs ? 'block' : 'none';
      }
    });
    
    document.getElementById('btn-survey-next')?.addEventListener('click', () => changeLiveSlide(1));
    document.getElementById('btn-survey-prev')?.addEventListener('click', () => changeLiveSlide(-1));
  }

  // --- DASHBOARD LOGIC ---
  window.renderSurveysDashboard = async function() {
    const grid = document.getElementById('grid-window.SurveyState.surveys');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">Loading...</div>';
    
    try {
      const doc = await window.db.collection('global').doc('allSurveys').get();
      if (doc.exists && doc.data().window.SurveyState.surveys) {
        window.SurveyState.surveys = doc.data().window.SurveyState.surveys;
      } else {
        window.SurveyState.surveys = [];
      }
    } catch (e) {
      console.error(e);
      window.SurveyState.surveys = [];
    }

    grid.innerHTML = '';
    
    if (window.SurveyState.surveys.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No window.SurveyState.surveys yet. Click Create New Survey!</div>';
      return;
    }

    window.SurveyState.surveys.forEach(s => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.style.cursor = 'pointer';
      card.onclick = () => window.openSurveyDetail(s.id);
      
      const numSlides = s.slides ? s.slides.length : 0;
      card.innerHTML = `
        <div class="header">
          <div class="title">${s.name || 'Untitled Survey'}</div>
          <span class="pill" style="background:#0ea5e9; color:white; font-size:0.75rem;">${numSlides} Slides</span>
        </div>
        <div style="margin-top: 16px; color: var(--text-secondary); font-size: 0.9rem;">
          Click to manage survey
        </div>
      `;
      grid.appendChild(card);
    });
  };

  window.openSurveyDetail = function(id) {
    window.SurveyState.currentSurveyId = id;
    const survey = window.SurveyState.surveys.find(s => s.id === id);
    if (!survey) return;
    
    window.showScreen('screen-survey-dashboard-detail');
    document.getElementById('detail-survey-title').textContent = survey.name;
    document.getElementById('detail-survey-name-display').textContent = survey.name;
    const numSlides = survey.slides ? survey.slides.length : 0;
    document.getElementById('detail-survey-slides-count').textContent = `${numSlides} Slide${numSlides === 1 ? '' : 's'}`;
    
    document.getElementById('btn-detail-edit').onclick = () => window.editSurvey(id);
    document.getElementById('btn-detail-present').onclick = () => window.presentSurvey(id);
  };

  // Bind back button for detail screen
  document.getElementById('btn-survey-detail-back')?.addEventListener('click', () => {
    window.showScreen('screen-window.SurveyState.surveys-dashboard');
    window.renderSurveysDashboard();
  });

  window.SurveyState.saveSurveys = async function() {
    try {
      await window.db.collection('global').doc('allSurveys').set({ window.SurveyState.surveys: window.SurveyState.surveys }, { merge: true });
    } catch(e) {
      console.error('Error saving window.SurveyState.surveys:', e);
    }
  }

  let saveTimeout;
  window.SurveyState.debouncedSaveSurveys = function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      window.SurveyState.saveSurveys();
    }, 750);
  }

  // --- EDITOR LOGIC ---
  window.editSurvey = function(id) {
    window.SurveyState.currentSurveyId = id;
    const survey = window.SurveyState.surveys.find(s => s.id === id);
    if (survey) {
      window.showScreen('screen-survey-editor');
      document.getElementById('survey-title-input').value = survey.name;
      const rnCheckbox = document.getElementById('survey-require-name');
      if (rnCheckbox) rnCheckbox.checked = !!survey.requireName;
      window.SurveyState.activeSlideIndex = 0;
      renderEditor();
    }
  };

  window.selectSlide = function(idx) {
    window.SurveyState.activeSlideIndex = idx;
    renderEditor();
  };

  window.deleteSlide = function(idx, e) {
    e.stopPropagation();
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if(survey && survey.slides.length > 1) {
      survey.slides.splice(idx, 1);
      if(window.SurveyState.activeSlideIndex >= survey.slides.length) window.SurveyState.activeSlideIndex = survey.slides.length - 1;
      renderEditor();
    } else {
      alert("Survey must have at least one slide.");
    }
  };

  function renderEditor() {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if (!survey) return;

    // Render left sidebar slide list
    const slidesList = document.getElementById('survey-slides-list');
    slidesList.innerHTML = '';
    survey.slides.forEach((slide, idx) => {
      const activeClass = idx === window.SurveyState.activeSlideIndex ? 'box-shadow: 0 0 0 2px #0ea5e9;' : 'border: 1px solid var(--section-divider);';
      const div = document.createElement('div');
      div.style.cssText = `padding: 12px; background: var(--surface); border-radius: 8px; cursor: pointer; position: relative; ${activeClass}`;
      div.onclick = () => window.selectSlide(idx);
      
      let typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
      if(slide.type === 'multiple_choice') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
      else if(slide.type === 'word_cloud') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`;
      else if(slide.type === 'scales') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`;
      else if(slide.type === 'ranking') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
      else if(slide.type === 'guess_number') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><path d="M4 9h16"></path><path d="M4 15h16"></path><path d="M10 3L8 21"></path><path d="M16 3l-2 18"></path></svg>`;
      else if(slide.type === 'q_and_a') typeIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      div.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">Slide ${idx + 1} ${typeIcon}</div>
        <div style="font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${slide.question || 'Untitled'}</div>
        <button onclick="window.deleteSlide(${idx}, event)" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.7;">&times;</button>
      `;
      slidesList.appendChild(div);
    });

    const activeSlide = survey.slides[window.SurveyState.activeSlideIndex];
    if (!activeSlide) return;

    // Populate right sidebar
    document.getElementById('survey-question-text').value = activeSlide.question || '';
    
    const themeSel = document.getElementById('survey-slide-theme');
    if (themeSel) themeSel.value = activeSlide.theme || 'theme-default';
    
    const activeReactions = activeSlide.reactions || [];
    document.querySelectorAll('.survey-reaction-cb').forEach(cb => {
      cb.checked = activeReactions.includes(cb.value);
    });

    // Slide Type Settings
    document.getElementById('survey-slide-type').value = activeSlide.type;
    const optsContainer = document.getElementById('survey-options-container');
    const optsList = document.getElementById('survey-options-list');
    const wcSettings = document.getElementById('survey-wordcloud-settings');
    
    if (['multiple_choice', 'scales', 'ranking'].includes(activeSlide.type)) {
      optsContainer.style.display = 'block';
      optsList.innerHTML = '';
      (activeSlide.options || []).forEach((opt, idx) => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 8px;';
        row.innerHTML = `
          <input type="text" value="${opt.replace(/"/g, '&quot;')}" style="flex:1; padding:8px 12px; border:1px solid var(--section-divider); border-radius:6px; outline:none;" onchange="window.updateOption(${idx}, this.value)">
          <button onclick="window.deleteOption(${idx})" style="background:#fef2f2; border:none; color:#ef4444; padding:0 12px; border-radius:6px; cursor:pointer;">&times;</button>
        `;
        optsList.appendChild(row);
      });
      document.getElementById('btn-survey-add-option').style.display = 'block';
    } else if (activeSlide.type === 'guess_number') {
      optsContainer.style.display = 'block';
      optsList.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">Target Number</label>
          <input type="number" id="guess-target" value="${activeSlide.targetNumber || 0}" style="padding:8px; border:1px solid var(--section-divider); border-radius:6px; outline:none;" onchange="window.updateGuessSettings()">
          <label style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin-top:8px;">Tolerance (+/-)</label>
          <input type="number" id="guess-tolerance" value="${activeSlide.tolerance || 0}" style="padding:8px; border:1px solid var(--section-divider); border-radius:6px; outline:none;" onchange="window.updateGuessSettings()">
        </div>
      `;
      document.getElementById('btn-survey-add-option').style.display = 'none';
    } else {
      optsContainer.style.display = 'none';
    }
    
    if (activeSlide.type === 'word_cloud') {
      wcSettings.style.display = 'block';
      document.getElementById('survey-allow-multiple').checked = !!activeSlide.allowMultiple;
    } else {
      wcSettings.style.display = 'none';
    }

    // Populate Center Preview
    document.getElementById('preview-question').innerHTML = activeSlide.question || 'Untitled Question';
    const previewContainer = document.getElementById('survey-slide-preview');
    const previewContent = document.getElementById('preview-content');
    
    // Apply theme dynamically to inline preview container
    previewContainer.className = activeSlide.theme || 'theme-default';
    
    // Quick inline render for center preview
    renderSimulatedStudentSlide(previewContent, activeSlide, false, true);
  }

  window.updateGuessSettings = function() {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if(survey && survey.slides[window.SurveyState.activeSlideIndex] && survey.slides[window.SurveyState.activeSlideIndex].type === 'guess_number') {
      survey.slides[window.SurveyState.activeSlideIndex].targetNumber = parseFloat(document.getElementById('guess-target').value) || 0;
      survey.slides[window.SurveyState.activeSlideIndex].tolerance = parseFloat(document.getElementById('guess-tolerance').value) || 0;
      renderEditor();
    }
  };
  window.updateWordCloudSettings = function() {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if(survey && survey.slides[window.SurveyState.activeSlideIndex] && survey.slides[window.SurveyState.activeSlideIndex].type === 'word_cloud') {
      survey.slides[window.SurveyState.activeSlideIndex].allowMultiple = document.getElementById('survey-allow-multiple').checked;
      renderEditor();
    }
  };

  window.updateOption = function(idx, val, skipRender = false) {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if(survey && survey.slides[window.SurveyState.activeSlideIndex] && ['multiple_choice', 'scales', 'ranking'].includes(survey.slides[window.SurveyState.activeSlideIndex].type)) {
      survey.slides[window.SurveyState.activeSlideIndex].options[idx] = val;
      if (!skipRender) {
        renderEditor();
      } else {
        // Just update the right sidebar input so they stay in sync
        const optsList = document.getElementById('survey-options-list');
        if (optsList) {
          const inputs = optsList.querySelectorAll('input[type="text"]');
          if (inputs[idx]) inputs[idx].value = val;
        }
      }
    }
  };

  window.deleteOption = function(idx) {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if(survey && survey.slides[window.SurveyState.activeSlideIndex] && ['multiple_choice', 'scales', 'ranking'].includes(survey.slides[window.SurveyState.activeSlideIndex].type)) {
      survey.slides[window.SurveyState.activeSlideIndex].options.splice(idx, 1);
      renderEditor();
    }
  };

  window.applyStyleToActiveTarget = function(prop, val) {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if (!survey || !survey.slides[window.SurveyState.activeSlideIndex]) return;
    
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles) {
      survey.slides[window.SurveyState.activeSlideIndex].styles = {};
    }
    
    const type = window.activeStylingTargetType;
    if (!type) return;
    
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles[type]) {
      survey.slides[window.SurveyState.activeSlideIndex].styles[type] = {};
    }
    
    if (prop === 'clear') {
      survey.slides[window.SurveyState.activeSlideIndex].styles[type] = {};
    } else {
      survey.slides[window.SurveyState.activeSlideIndex].styles[type][prop] = val;
    }
    
    window.SurveyState.debouncedSaveSurveys();
    renderEditor();
  };
  window.renderSimulatedStudentSlide = function(container, slide, requireName, isInline = false) {
    let contentHtml = '';
    const themeClass = slide.theme || 'theme-default';
    
    const s = slide.styles || {};
    
    function buildCss(stylesObj, defaults) {
      let str = defaults || '';
      if (!stylesObj) return str;
      if (stylesObj.background) str += `background:${stylesObj.background} !important; `;
      if (stylesObj.backgroundImage) str += `background-image:url('${stylesObj.backgroundImage}') !important; background-size:cover !important; background-position:center !important; `;
      if (stylesObj.design === 'glass') str += 'background:rgba(255,255,255,0.2) !important; backdrop-filter:blur(12px) !important; border:1px solid rgba(255,255,255,0.4) !important; box-shadow:0 8px 32px rgba(0,0,0,0.1) !important; color:var(--text) !important; ';
      if (stylesObj.design === 'solid-dark') str += 'background:#1e293b !important; color:white !important; border:none !important; ';
      if (stylesObj.design === 'solid-light') str += 'background:#ffffff !important; color:#1e293b !important; border:1px solid #e2e8f0 !important; ';
      if (stylesObj.design === 'gradient-ocean') str += 'background:linear-gradient(135deg, #0ea5e9, #3b82f6) !important; color:white !important; border:none !important; ';
      if (stylesObj.design === 'gradient-sunset') str += 'background:linear-gradient(135deg, #f97316, #ec4899) !important; color:white !important; border:none !important; ';
      return str;
    }
    
    const slideCss = buildCss(s.slide, '');
    const optionCss = buildCss(s.option, 'padding:16px 24px; background:rgba(255,255,255,0.8); border:2px solid rgba(0,0,0,0.1); border-radius:9999px; font-weight:700; color:#1e293b; ');
    const inputCss = buildCss(s.input, 'padding:12px; border:1px solid #cbd5e1; border-radius:9999px; outline:none; font-size:1.1rem; width:100%; ');
    const textareaCss = buildCss(s.input, 'padding:12px; border:1px solid #cbd5e1; border-radius:24px; outline:none; font-size:1.1rem; width:100%; resize:none; ');
    const btnCss = buildCss(s.button, 'width:100%; padding:12px; background:#0ea5e9; color:white; border:none; border-radius:9999px; font-weight:700; font-size:1.1rem; cursor:pointer; ');
    
    const submitText = s.submitText || 'Submit';
    const btnHtml = `<button style="${btnCss}" data-style-target="button">${isInline ? `<span id="preview-submit-btn-text" contenteditable="true" style="outline:none;">${submitText}</span>` : submitText}</button>`;

    if (slide.type === 'multiple_choice') {
      contentHtml = `<div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:400px;">
        ${(slide.options || []).map((o, i) => `<div data-style-target="option" style="${optionCss} text-align:center; outline:none; cursor:pointer;"><span data-option-idx="${i}" ${isInline ? 'contenteditable="true"' : ''} style="cursor:${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:${isInline ? 'auto' : 'none'};">${o}</span></div>`).join('')}
      </div>`;
    } else if (slide.type === 'word_cloud') {
      contentHtml = `<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:400px;">
        <input type="text" placeholder="Enter a word..." ${isInline ? 'disabled' : ''} data-style-target="input" style="${inputCss} margin-bottom:12px; ${isInline ? 'opacity:0.7;' : ''}">
        ${btnHtml}
      </div>`;
    } else if (slide.type === 'open_ended' || slide.type === 'q_and_a') {
      contentHtml = `<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:500px;">
        <textarea rows="4" placeholder="${slide.type === 'q_and_a' ? 'Ask a question...' : 'Type your answer here...'}" ${isInline ? 'disabled' : ''} data-style-target="input" style="${textareaCss} margin-bottom:12px; ${isInline ? 'opacity:0.7;' : ''}"></textarea>
        ${(s.button && (s.button.background || s.button.design)) ? btnHtml : btnHtml.replace('#0ea5e9', '#10b981')}
      </div>`;
    } else if (slide.type === 'scales') {
      contentHtml = `<div style="width:100%; max-width:500px; display:flex; flex-direction:column; gap:16px;">
        ${(slide.options || []).map((o, i) => `
          <div style="background:rgba(255,255,255,0.8); padding:16px; border-radius:12px;">
            <div style="font-weight:700; margin-bottom:12px; color:#1e293b; outline:none;"><span data-option-idx="${i}" ${isInline ? 'contenteditable="true"' : ''} style="cursor:${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:${isInline ? 'auto' : 'none'};">${o}</span></div>
            <input type="range" min="1" max="5" value="3" ${isInline ? 'disabled' : ''} style="width:100%;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-top:4px;"><span>Strongly Disagree</span><span>Strongly Agree</span></div>
          </div>
        `).join('')}
        <div style="margin-top:8px;">${(s.button && (s.button.background || s.button.design)) ? btnHtml : btnHtml.replace('#0ea5e9', '#8b5cf6')}</div>
      </div>`;
    } else if (slide.type === 'ranking') {
      contentHtml = `<div style="width:100%; max-width:400px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:0.9rem; margin-bottom:8px;">Drag to rank options (1st is highest)</div>
        ${(slide.options || []).map((o, i) => `
          <div data-style-target="option" style="${optionCss} display:flex; align-items:center; gap:12px; padding:16px 24px;">
            <div style="background:#e2e8f0; color:#475569; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; flex-shrink: 0;">${i+1}</div>
            <div style="flex:1; outline:none;"><span data-option-idx="${i}" ${isInline ? 'contenteditable="true"' : ''} style="cursor:${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:${isInline ? 'auto' : 'none'};">${o}</span></div>
          </div>
        `).join('')}
        <div style="margin-top:8px;">${(s.button && (s.button.background || s.button.design)) ? btnHtml : btnHtml.replace('#0ea5e9', '#ec4899')}</div>
      </div>`;
    } else if (slide.type === 'guess_number') {
      contentHtml = `<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:400px; display:flex; flex-direction:column; gap:12px;">
        <input type="number" placeholder="Enter your guess..." ${isInline ? 'disabled' : ''} data-style-target="input" style="${inputCss} font-size:1.5rem; text-align:center; ${isInline ? 'opacity:0.7;' : ''}">
        ${(s.button && (s.button.background || s.button.design)) ? btnHtml : btnHtml.replace('#0ea5e9', '#f59e0b')}
      </div>`;
    }

    let reactionHtml = '';
    if ((slide.reactions || []).length > 0) {
      reactionHtml = `<div style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); display:flex; gap:12px; background:rgba(255,255,255,0.9); padding:12px 24px; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        ${slide.reactions.map(r => `<button style="background:none; border:none; cursor:pointer; color: var(--text); transition:transform 0.1s; display: flex; align-items: center; justify-content: center;" onmousedown="this.style.transform='scale(0.8)'" onmouseup="this.style.transform='scale(1)'">${REACTION_SVGS[r] || r}</button>`).join('')}
      </div>`;
    }

    let innerContent = '';
    if (isInline) {
      innerContent = contentHtml;
      // Apply slide style to the preview container in editor
      const previewWrapper = document.getElementById('survey-slide-preview');
      if (previewWrapper) {
         const slideStyles = s.slide || {};
         previewWrapper.style.background = slideStyles.background || '';
         if (slideStyles.design === 'glass') { previewWrapper.style.background = 'rgba(255,255,255,0.2)'; previewWrapper.style.backdropFilter = 'blur(12px)'; previewWrapper.style.color = 'var(--text)'; previewWrapper.style.border = '1px solid rgba(255,255,255,0.4)'; }
         else if (slideStyles.design === 'solid-dark') { previewWrapper.style.background = '#1e293b'; previewWrapper.style.color = 'white'; previewWrapper.style.border = 'none'; }
         else if (slideStyles.design === 'solid-light') { previewWrapper.style.background = '#ffffff'; previewWrapper.style.color = '#1e293b'; previewWrapper.style.border = '1px solid #e2e8f0'; }
         else if (slideStyles.design === 'gradient-ocean') { previewWrapper.style.background = 'linear-gradient(135deg, #0ea5e9, #3b82f6)'; previewWrapper.style.color = 'white'; previewWrapper.style.border = 'none'; }
         else if (slideStyles.design === 'gradient-sunset') { previewWrapper.style.background = 'linear-gradient(135deg, #f97316, #ec4899)'; previewWrapper.style.color = 'white'; previewWrapper.style.border = 'none'; }
         else { previewWrapper.style.backdropFilter = ''; previewWrapper.style.color = ''; previewWrapper.style.border = 'none'; }
      }
    } else {
      innerContent = `
        <div class="${themeClass}" data-style-target="slide" style="width:100%; min-height:100%; padding:40px 20px; display:flex; flex-direction:column; align-items:center; position:relative; ${slideCss}">
          <h2 id="preview-question" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 40px; text-align:center; max-width:800px;">${slide.question || 'Untitled Question'}</h2>
          ${contentHtml}
          ${reactionHtml}
        </div>
      `;
    }

    container.innerHTML = innerContent;
  };

  // --- LIVE PRESENTER LOGIC ---

  
  let currentLiveCode = null;
  let currentLiveSurvey = null;

  window.presentSurvey = async function(id) {
    window.SurveyState.currentSurveyId = id;
    currentLiveSurvey = window.SurveyState.surveys.find(s => s.id === id);
    if (!currentLiveSurvey) return;

    window.showScreen('screen-survey-live-admin');
    document.getElementById('live-survey-title').textContent = currentLiveSurvey.name;
    
    // Generate an easy 6 digit code
    currentLiveCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('live-survey-code').textContent = currentLiveCode;
    
    window.SurveyState.activeSlideIndex = 0;
    
    // Render slide immediately before network request
    renderLiveSlide();
    
    try {
      // Create session in live_surveys
      await window.db.collection('live_surveys').doc(currentLiveCode).set({
        surveyId: currentLiveSurvey.id,
        surveyName: currentLiveSurvey.name,
        requireName: currentLiveSurvey.requireName || false,
        window.SurveyState.activeSlideIndex: window.SurveyState.activeSlideIndex,
        totalSlides: currentLiveSurvey.slides.length,
        slides: currentLiveSurvey.slides, // include full structure so clients don't need to fetch global
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      startListeningToLiveResponses();
    } catch(e) {
      console.error("Error starting live survey:", e);
    }
  };

  let liveReactionsUnsubscribe = null;

  function startListeningToLiveResponses() {
    if (window.SurveyState.liveResponsesUnsubscribe) window.SurveyState.liveResponsesUnsubscribe();
    if (liveReactionsUnsubscribe) liveReactionsUnsubscribe();
    
    const slideId = currentLiveSurvey.slides[window.SurveyState.activeSlideIndex].id;
    
    if (window.rtdb) {
      const responsesRef = window.rtdb.ref(`survey_responses/${slideId}`);
      responsesRef.on('value', snap => {
        const responses = [];
        snap.forEach(child => {
          const d = child.val();
          d.id = child.key;
          d.upvotesCount = d.upvotes ? Object.keys(d.upvotes).length : 0;
          responses.push(d);
        });
        
        document.getElementById('live-survey-participant-count').innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle; margin-right: 4px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          ${responses.length}
        `;
        
        renderLiveVisuals(responses);
      });
      window.SurveyState.liveResponsesUnsubscribe = () => responsesRef.off('value');
      
      // Listen for reactions
      let initialReactions = true;
      const reactionsRef = window.rtdb.ref(`survey_reactions/${slideId}`);
      reactionsRef.on('child_added', snap => {
        if (initialReactions) return;
        showFloatingReaction(snap.val().reaction);
      });
      reactionsRef.once('value').then(() => { initialReactions = false; });
      liveReactionsUnsubscribe = () => reactionsRef.off('child_added');
    }
  }

  function showFloatingReaction(emojiKey) {
    const el = document.createElement('div');
    el.className = 'reaction-particle';
    el.innerHTML = REACTION_SVGS[emojiKey] || emojiKey;
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.color = '#0ea5e9'; // Default color for SVGs
    if (emojiKey === 'heart') el.style.color = '#ef4444';
    if (emojiKey === 'smile') el.style.color = '#f59e0b';
    if (emojiKey === 'star' || emojiKey === 'bulb') el.style.color = '#eab308';
    
    const container = document.getElementById('screen-survey-live-admin');
    if (container) container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  function stopLiveSurvey() {
    if (window.SurveyState.liveResponsesUnsubscribe) window.SurveyState.liveResponsesUnsubscribe();
    if (liveReactionsUnsubscribe) liveReactionsUnsubscribe();
    window.SurveyState.liveResponsesUnsubscribe = null;
    liveReactionsUnsubscribe = null;
    
    if (window.SurveyState.liveChart) {
      window.SurveyState.liveChart.destroy();
      window.SurveyState.liveChart = null;
    }
    
    if (currentLiveCode) {
      window.db.collection('live_surveys').doc(currentLiveCode).update({
        status: 'ended'
      }).catch(console.error);
      currentLiveCode = null;
    }
  }

  
  window.applyStyleToActiveTarget = function(prop, val) {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if (!survey || !survey.slides[window.SurveyState.activeSlideIndex]) return;
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles) survey.slides[window.SurveyState.activeSlideIndex].styles = {};
    
    const type = window.activeStylingTargetType;
    if (!type) return;
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles[type]) survey.slides[window.SurveyState.activeSlideIndex].styles[type] = {};
    
    if (prop === 'clear') {
      survey.slides[window.SurveyState.activeSlideIndex].styles[type] = {};
    } else {
      survey.slides[window.SurveyState.activeSlideIndex].styles[type][prop] = val;
    }
    
    renderEditor(); // This will trigger a re-render of the preview inline
  };

  async function changeLiveSlide(delta) {
    if(!currentLiveSurvey) return;
    const newIdx = window.SurveyState.activeSlideIndex + delta;
    if(newIdx >= 0 && newIdx < currentLiveSurvey.slides.length) {
      window.SurveyState.activeSlideIndex = newIdx;
      try {
        await window.db.collection('live_surveys').doc(currentLiveCode).update({
          window.SurveyState.activeSlideIndex: window.SurveyState.activeSlideIndex
        });
        
        const container = document.getElementById('screen-survey-live-admin');
        container.classList.add('slide-transition-exit');
        
        setTimeout(() => {
          renderLiveSlide();
          container.classList.remove('slide-transition-exit');
          container.classList.add('slide-transition-enter');
          
          setTimeout(() => {
            container.classList.remove('slide-transition-enter');
          }, 300);
          
          // re-fetch responses for new slide
          startListeningToLiveResponses();
        }, 200);
      } catch(e) {
        console.error("Failed to change slide:", e);
      }
    }
  }

  function renderLiveSlide() {
    const slide = currentLiveSurvey.slides[window.SurveyState.activeSlideIndex];
    document.getElementById('live-survey-question').innerHTML = slide.question || 'Untitled Question';
    document.getElementById('survey-slide-counter').textContent = `${window.SurveyState.activeSlideIndex + 1} / ${currentLiveSurvey.slides.length}`;
    
    document.getElementById('survey-live-chart-wrapper').style.display = 'none';
    document.getElementById('survey-live-open-ended').style.display = 'none';
    
    // Apply theme class
    const themeClass = slide.theme || 'theme-default';
    const container = document.getElementById('screen-survey-live-admin');
    // Remove old themes safely
    Array.from(container.classList).forEach(cls => {
      if(cls.startsWith('theme-')) container.classList.remove(cls);
    });
    container.classList.add(themeClass);
    
    // Apply custom slide styles
    if (slide.styles && slide.styles.slide) {
      const s = slide.styles.slide;
      container.style.background = s.background || '';
      if (s.backgroundImage) {
        container.style.backgroundImage = `url('${s.backgroundImage}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
      }
      if (s.design === 'glass') { container.style.background = 'rgba(255,255,255,0.2)'; container.style.backdropFilter = 'blur(12px)'; container.style.color = 'var(--text)'; }
      else if (s.design === 'solid-dark') { container.style.background = '#1e293b'; container.style.color = 'white'; }
      else if (s.design === 'solid-light') { container.style.background = '#ffffff'; container.style.color = '#1e293b'; }
      else if (s.design === 'gradient-ocean') { container.style.background = 'linear-gradient(135deg, #0ea5e9, #3b82f6)'; container.style.color = 'white'; }
      else if (s.design === 'gradient-sunset') { container.style.background = 'linear-gradient(135deg, #f97316, #ec4899)'; container.style.color = 'white'; }
    } else {
      container.style.background = '';
      container.style.backdropFilter = '';
      container.style.color = '';
    }

    
    if(window.SurveyState.liveChart) {
      window.SurveyState.liveChart.destroy();
      window.SurveyState.liveChart = null;
    }
    
    if(['multiple_choice', 'scales', 'ranking'].includes(slide.type)) {
      const wrapper = document.getElementById('survey-live-chart-wrapper');
      wrapper.style.display = 'block';
      const ctx = document.getElementById('survey-live-chart');
      // Setup Chart.js
      window.SurveyState.liveChart = new Chart(ctx, {
        type: slide.type === 'scales' ? 'bar' : (slide.type === 'ranking' ? 'bar' : 'bar'),
        data: {
          labels: slide.options || [],
          datasets: [{
            label: slide.type === 'scales' ? 'Avg Score' : (slide.type === 'ranking' ? 'Avg Rank (Lower is Better)' : 'Votes'),
            data: new Array((slide.options || []).length).fill(0),
            backgroundColor: slide.type === 'scales' ? '#8b5cf6' : (slide.type === 'ranking' ? '#ec4899' : '#0ea5e9'),
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { precision: slide.type === 'multiple_choice' ? 0 : 1 } },
            x: { grid: { display: false }, ticks: { font: { size: 16, weight: 'bold' } } }
          }
        }
      });
    } else if (slide.type === 'open_ended' || slide.type === 'word_cloud' || slide.type === 'q_and_a' || slide.type === 'guess_number') {
      const div = document.getElementById('survey-live-open-ended');
      div.style.display = 'flex';
      div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
    }
  }

  function renderLiveVisuals(responses) {
    const slide = currentLiveSurvey.slides[window.SurveyState.activeSlideIndex];
    if(!slide) return;
    
    if (slide.type === 'multiple_choice' && window.SurveyState.liveChart) {
      // count votes
      const counts = new Array((slide.options || []).length).fill(0);
      responses.forEach(r => {
        const idx = slide.options.indexOf(r.answer);
        if(idx !== -1) counts[idx]++;
      });
      window.SurveyState.liveChart.data.datasets[0].data = counts;
      window.SurveyState.liveChart.update();
    }
    else if (slide.type === 'scales' && window.SurveyState.liveChart) {
      const totals = new Array((slide.options || []).length).fill(0);
      const counts = new Array((slide.options || []).length).fill(0);
      responses.forEach(r => {
        try {
          const vals = JSON.parse(r.answer);
          vals.forEach((v, i) => {
            if (i < totals.length) {
              totals[i] += v;
              counts[i]++;
            }
          });
        } catch(e){}
      });
      const avgs = totals.map((t, i) => counts[i] > 0 ? (t / counts[i]) : 0);
      window.SurveyState.liveChart.data.datasets[0].data = avgs;
      window.SurveyState.liveChart.update();
    }
    else if (slide.type === 'ranking' && window.SurveyState.liveChart) {
      const totals = new Array((slide.options || []).length).fill(0);
      const counts = new Array((slide.options || []).length).fill(0);
      responses.forEach(r => {
        try {
          const vals = JSON.parse(r.answer); // ordered list of items
          vals.forEach((item, rankIndex) => {
            const optIdx = slide.options.indexOf(item);
            if(optIdx !== -1) {
              totals[optIdx] += (rankIndex + 1); // Rank 1 is best
              counts[optIdx]++;
            }
          });
        } catch(e){}
      });
      const avgs = totals.map((t, i) => counts[i] > 0 ? (t / counts[i]) : 0);
      window.SurveyState.liveChart.data.datasets[0].data = avgs;
      window.SurveyState.liveChart.update();
    }
    else if (slide.type === 'guess_number') {
      const div = document.getElementById('survey-live-open-ended');
      div.innerHTML = '';
      if(responses.length === 0) {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
        return;
      }
      
      let sum = 0;
      let closestDist = Infinity;
      let closestWinner = null;
      let closestGuess = null;
      
      responses.forEach(r => {
        const val = parseFloat(r.answer);
        if(!isNaN(val)) {
          sum += val;
          const dist = Math.abs(val - (slide.targetNumber || 0));
          if (dist < closestDist) {
            closestDist = dist;
            closestWinner = r.participantName || 'Anonymous';
            closestGuess = val;
          }
        }
      });
      
      const avg = (sum / responses.length).toFixed(2);
      
      div.innerHTML = `
        <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid var(--section-divider); text-align: center; max-width: 600px; width: 100%;">
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Target Number</div>
          <div style="font-size: 4rem; font-weight: 900; color: #10b981;">${slide.targetNumber || 0}</div>
          <div style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 16px;">Average Guess: <strong>${avg}</strong></div>
          ${closestWinner ? `<div style="font-size: 1.25rem; font-weight: 700; color: #0ea5e9; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--section-divider);">Closest Guess: ${closestGuess} by ${closestWinner}</div>` : ''}
        </div>
      `;
    }
    else if (slide.type === 'open_ended' || slide.type === 'q_and_a') {
      const div = document.getElementById('survey-live-open-ended');
      div.innerHTML = '';
      if(responses.length === 0) {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
        return;
      }
      
      let sortedResponses = [...responses];
      if (slide.type === 'q_and_a') {
        sortedResponses.sort((a,b) => (b.upvotes ? b.upvotes.length : 0) - (a.upvotes ? a.upvotes.length : 0));
      }
      
      sortedResponses.forEach(r => {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 16px 24px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid var(--section-divider); font-size: 1.25rem; font-weight: 600; color: var(--text); max-width: 400px; animation: popIn 0.3s ease-out; position:relative;';
        if (slide.type === 'q_and_a') {
           const upvoteCount = r.upvotes ? r.upvotes.length : 0;
           const badge = upvoteCount > 0 ? `<div style="position:absolute; top:-12px; right:-12px; background:#0ea5e9; color:white; font-size:0.8rem; font-weight:bold; padding:4px 10px; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">🔥 ${upvoteCount}</div>` : '';
           card.innerHTML = `${badge}<div style="font-size: 0.9rem; color: #0ea5e9; font-weight: 700; margin-bottom: 8px;">${r.participantName || 'Anonymous'} asks:</div><div>${maskProfanity(r.answer)}</div>`;
        } else {
           card.textContent = maskProfanity(r.answer);
        }
        div.appendChild(card);
      });
    }
    else if (slide.type === 'word_cloud') {
      const div = document.getElementById('survey-live-open-ended');
      
      if (typeof WordCloud === 'undefined') {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px; text-align:center;">Loading Word Cloud engine...</div>';
        if (!document.getElementById('wordcloud-script')) {
          const script = document.createElement('script');
          script.id = 'wordcloud-script';
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.2.2/wordcloud2.min.js";
          script.onload = () => renderLiveVisuals(responses);
          document.head.appendChild(script);
        }
        return;
      }
      
      div.innerHTML = '';
      if(responses.length === 0) {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px; text-align:center;">Waiting for responses...</div>';
        return;
      }
      
      const freq = {};
      responses.forEach(r => {
        const phrase = maskProfanity((r.answer || '').trim());
        if (phrase) {
          // Do not tokenize by space. Keep the phrase intact. Only remove special characters but keep spaces.
          // However, asterisk * shouldn't be counted if it's purely profanity, but we let it pass as a phrase.
          const cw = phrase.toLowerCase().replace(/[^a-z0-9 *]/g, '').replace(/\s+/g, ' ').trim();
          if(cw) freq[cw] = (freq[cw] || 0) + 1;
        }
      });
      
      const maxFreq = Math.max(...Object.values(freq), 1);
      
      // Setup Canvas
      const canvas = document.createElement('canvas');
      canvas.id = 'wordcloud-canvas';
      // Give canvas strict pixel dimensions based on container to avoid blurry rendering
      const width = div.clientWidth || 800;
      const height = 400; // Fixed height for word cloud container
      canvas.width = width;
      canvas.height = height;
      canvas.style.cssText = `width: 100%; height: ${height}px; animation: popIn 0.8s ease-out;`;
      div.appendChild(canvas);
      
      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4', '#14b8a6'];
      
      const list = Object.keys(freq).map(w => {
        // Base size 24. Words scale up to 4x based on frequency relative to maxFreq.
        const baseSize = Math.max(16, (width / 40)); 
        const size = baseSize * (1 + (freq[w] / maxFreq) * 3);
        return [w, size];
      });
      
      if (typeof WordCloud !== 'undefined') {
        WordCloud(canvas, {
          list: list,
          gridSize: Math.round(16 * width / 1024), // Tighter grid for better packing
          weightFactor: function (size) {
            return size; 
          },
          fontFamily: 'Inter, system-ui, sans-serif',
          color: function (word, weight) {
            return colors[Math.floor(Math.random() * colors.length)];
          },
          rotateRatio: 0.3, // 30% chance for vertical rotation (Mentimeter style)
          rotationSteps: 2, // Only 0 or 90 degrees
          backgroundColor: 'transparent',
          shrinkToFit: true,
          drawOutOfBound: false,
          shape: 'circle'
        });
      }
    }
  }
})();
