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
window.rgbToHex = function(rgb) {
  let [r, g, b] = rgb.match(/\d+/g) || [0,0,0];
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
};
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
    document.getElementById('btn-end-live-survey')?.addEventListener('click', () => {
      if(confirm('Are you sure you want to end this survey? Participants will be disconnected.')) {
        if(window.stopLiveSurvey) window.stopLiveSurvey();
        window.showScreen('screen-surveys-dashboard');
        window.renderSurveysDashboard();
      }
    });

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
      window.showScreen('screen-surveys-dashboard');
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
          let topPos = rect.bottom + 8;
          if (topPos + rtToolbar.offsetHeight > window.innerHeight) {
            topPos = rect.top - rtToolbar.offsetHeight - 8;
          }
          rtToolbar.style.top = Math.max(0, topPos) + 'px';
          
          let leftPos = rect.left;
          if (leftPos + rtToolbar.offsetWidth > window.innerWidth) leftPos = window.innerWidth - rtToolbar.offsetWidth;
          rtToolbar.style.left = Math.max(0, leftPos) + 'px';
          
          // Update text editor colors to reflect current selection/element
          const computed = window.getComputedStyle(target);
          const foreColorInput = rtToolbar.querySelector('input[title="Text Color"]');
          const bgInput = rtToolbar.querySelector('input[title="Highlight"]');
          if(foreColorInput) {
            let fc = computed.color;
            if (document.queryCommandValue('foreColor')) fc = document.queryCommandValue('foreColor');
            if (fc.startsWith('rgb')) fc = window.rgbToHex ? window.rgbToHex(fc) : fc;
            if(fc.startsWith('#')) foreColorInput.value = fc;
          }
          if(bgInput) {
            let bc = computed.backgroundColor;
            if (document.queryCommandValue('hiliteColor')) bc = document.queryCommandValue('hiliteColor');
            else if (document.queryCommandValue('backColor')) bc = document.queryCommandValue('backColor');
            if (bc.startsWith('rgb')) bc = window.rgbToHex ? window.rgbToHex(bc) : bc;
            if(bc.startsWith('#')) bgInput.value = bc;
          }
        } else {
          rtToolbar.style.display = 'none';
          previewContainer.querySelectorAll('[contenteditable]').forEach(el => el.style.outline = 'none');
        }
        
        const styleEl = e.target.closest('[data-style-target]');
        if (styleEl && !isTextTarget) {
          isStyleTarget = true;
          window.activeStylingTargetType = styleEl.getAttribute('data-style-target');
          styleToolbar.style.display = 'flex';
          let topPos, leftPos;
          if (styleEl.id === 'survey-slide-preview') {
            // For the slide background, position near the cursor
            topPos = e.clientY + 15;
            leftPos = e.clientX + 15;
          } else {
            const rect = styleEl.getBoundingClientRect();
            topPos = rect.bottom + 8;
            if (topPos + styleToolbar.offsetHeight > window.innerHeight) {
              topPos = rect.top - styleToolbar.offsetHeight - 8;
            }
            leftPos = rect.left;
          }
          
          if (topPos + styleToolbar.offsetHeight > window.innerHeight) topPos = window.innerHeight - styleToolbar.offsetHeight - 8;
          if (leftPos + styleToolbar.offsetWidth > window.innerWidth) leftPos = window.innerWidth - styleToolbar.offsetWidth - 8;
          
          styleToolbar.style.top = Math.max(0, topPos) + 'px';
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
      window.stopLiveSurvey();
      window.showScreen('screen-surveys-dashboard');
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
    
    document.getElementById('btn-survey-next')?.addEventListener('click', () => window.changeLiveSlide(1));
    document.getElementById('btn-survey-prev')?.addEventListener('click', () => window.changeLiveSlide(-1));
  }

  // --- DASHBOARD LOGIC ---
  window.renderSurveysDashboard = async function() {
    const grid = document.getElementById('grid-surveys');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">Loading...</div>';
    
    try {
      const doc = await window.db.collection('global').doc('allSurveys').get();
      if (doc.exists && doc.data().surveys) {
        window.SurveyState.surveys = doc.data().surveys;
      } else {
        window.SurveyState.surveys = [];
      }
    } catch (e) {
      console.error(e);
      window.SurveyState.surveys = [];
    }

    grid.innerHTML = '';
    
    if (window.SurveyState.surveys.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No surveys yet. Click Create New Survey!</div>';
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
    window.showScreen('screen-surveys-dashboard');
    window.renderSurveysDashboard();
  });

  window.SurveyState.saveSurveys = async function() {
    try {
      await window.db.collection('global').doc('allSurveys').set({ surveys: window.SurveyState.surveys }, { merge: true });
    } catch(e) {
      console.error('Error saving surveys:', e);
    }
  }

  let saveTimeout;
  window.SurveyState.debouncedSaveSurveys = function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      window.SurveyState.saveSurveys();
    }, 750);
  }

})();
