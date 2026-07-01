(function() {
  let db = null;
  // Wait for firebase to load
  const initInterval = setInterval(() => {
    if (window.db) {
      db = window.db;
      clearInterval(initInterval);
      setupSurveys();
    }
  }, 100);

  let surveys = [];
  let currentSurveyId = null;
  let activeSlideIndex = 0;
  
  // Live Presenter vars
  let liveSurveyUnsubscribe = null;
  let liveResponsesUnsubscribe = null;
  let liveChart = null;

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
      surveys.push(newSurvey);
      await saveSurveys();
      editSurvey(newSurvey.id);
    });

    document.getElementById('btn-survey-editor-back')?.addEventListener('click', () => {
      window.showScreen('screen-surveys-dashboard');
      window.renderSurveysDashboard();
    });

    document.getElementById('btn-save-survey')?.addEventListener('click', async () => {
      const survey = surveys.find(s => s.id === currentSurveyId);
      if (survey) {
        survey.name = document.getElementById('survey-title-input').value;
        await saveSurveys();
        alert('Survey Saved!');
      }
    });

    document.getElementById('btn-add-slide')?.addEventListener('click', () => {
      const survey = surveys.find(s => s.id === currentSurveyId);
      if (survey) {
        survey.slides.push({
          id: 'sl_' + Date.now(),
          type: 'multiple_choice',
          question: 'New Question',
          options: ['Option 1', 'Option 2']
        });
        activeSlideIndex = survey.slides.length - 1;
        renderEditor();
      }
    });

    document.getElementById('survey-slide-type')?.addEventListener('change', (e) => {
      const survey = surveys.find(s => s.id === currentSurveyId);
      if (survey && survey.slides[activeSlideIndex]) {
        survey.slides[activeSlideIndex].type = e.target.value;
        if (e.target.value === 'multiple_choice' && !survey.slides[activeSlideIndex].options) {
          survey.slides[activeSlideIndex].options = ['Option 1', 'Option 2'];
        }
        renderEditor();
      }
    });

    document.getElementById('survey-question-text')?.addEventListener('input', (e) => {
      const survey = surveys.find(s => s.id === currentSurveyId);
      if (survey && survey.slides[activeSlideIndex]) {
        survey.slides[activeSlideIndex].question = e.target.value;
        document.getElementById('preview-question').textContent = e.target.value || 'Untitled Question';
      }
    });

    document.getElementById('btn-survey-add-option')?.addEventListener('click', () => {
      const survey = surveys.find(s => s.id === currentSurveyId);
      if (survey && survey.slides[activeSlideIndex] && survey.slides[activeSlideIndex].type === 'multiple_choice') {
        survey.slides[activeSlideIndex].options.push('New Option');
        renderEditor();
      }
    });
    
    document.getElementById('btn-live-survey-back')?.addEventListener('click', () => {
      stopLiveSurvey();
      window.showScreen('screen-surveys-dashboard');
      window.renderSurveysDashboard();
    });
    
    document.getElementById('btn-survey-next')?.addEventListener('click', () => changeLiveSlide(1));
    document.getElementById('btn-survey-prev')?.addEventListener('click', () => changeLiveSlide(-1));
  }

  // --- DASHBOARD LOGIC ---
  window.renderSurveysDashboard = async function() {
    const grid = document.getElementById('grid-surveys');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">Loading...</div>';
    
    try {
      const doc = await db.collection('global').doc('allSurveys').get();
      if (doc.exists && doc.data().surveys) {
        surveys = doc.data().surveys;
      } else {
        surveys = [];
      }
    } catch (e) {
      console.error(e);
      surveys = [];
    }

    grid.innerHTML = '';
    
    if (surveys.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No surveys yet. Click Create New Survey!</div>';
      return;
    }

    surveys.forEach(s => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      const numSlides = s.slides ? s.slides.length : 0;
      card.innerHTML = `
        <div class="header">
          <div class="title">${s.name || 'Untitled Survey'}</div>
          <span class="pill" style="background:#0ea5e9; color:white; font-size:0.75rem;">${numSlides} Slides</span>
        </div>
        <div class="actions" style="margin-top: 16px; display: flex; gap: 8px;">
          <button class="btn" style="flex:1;" onclick="window.editSurvey('${s.id}')">Edit</button>
          <button class="btn" style="flex:1; background:#10b981; color:white; border:none;" onclick="window.presentSurvey('${s.id}')">Present</button>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  async function saveSurveys() {
    try {
      await db.collection('global').doc('allSurveys').set({ surveys: surveys }, { merge: true });
    } catch(e) {
      console.error('Error saving surveys:', e);
    }
  }

  // --- EDITOR LOGIC ---
  window.editSurvey = function(id) {
    currentSurveyId = id;
    const survey = surveys.find(s => s.id === id);
    if (survey) {
      window.showScreen('screen-survey-editor');
      document.getElementById('survey-title-input').value = survey.name;
      activeSlideIndex = 0;
      renderEditor();
    }
  };

  window.selectSlide = function(idx) {
    activeSlideIndex = idx;
    renderEditor();
  };

  window.deleteSlide = function(idx, e) {
    e.stopPropagation();
    const survey = surveys.find(s => s.id === currentSurveyId);
    if(survey && survey.slides.length > 1) {
      survey.slides.splice(idx, 1);
      if(activeSlideIndex >= survey.slides.length) activeSlideIndex = survey.slides.length - 1;
      renderEditor();
    } else {
      alert("Survey must have at least one slide.");
    }
  };

  function renderEditor() {
    const survey = surveys.find(s => s.id === currentSurveyId);
    if (!survey) return;

    // Render left sidebar slide list
    const slidesList = document.getElementById('survey-slides-list');
    slidesList.innerHTML = '';
    survey.slides.forEach((slide, idx) => {
      const activeClass = idx === activeSlideIndex ? 'box-shadow: 0 0 0 2px #0ea5e9;' : 'border: 1px solid var(--section-divider);';
      const div = document.createElement('div');
      div.style.cssText = `padding: 12px; background: var(--surface); border-radius: 8px; cursor: pointer; position: relative; ${activeClass}`;
      div.onclick = () => window.selectSlide(idx);
      
      const typeIcon = slide.type === 'multiple_choice' ? '📊' : (slide.type === 'word_cloud' ? '☁️' : '📝');
      div.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">Slide ${idx + 1} ${typeIcon}</div>
        <div style="font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${slide.question || 'Untitled'}</div>
        <button onclick="window.deleteSlide(${idx}, event)" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.7;">&times;</button>
      `;
      slidesList.appendChild(div);
    });

    const activeSlide = survey.slides[activeSlideIndex];
    if (!activeSlide) return;

    // Populate right sidebar
    document.getElementById('survey-slide-type').value = activeSlide.type || 'multiple_choice';
    document.getElementById('survey-question-text').value = activeSlide.question || '';

    const optsContainer = document.getElementById('survey-options-container');
    const optsList = document.getElementById('survey-options-list');
    
    if (activeSlide.type === 'multiple_choice') {
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
    } else {
      optsContainer.style.display = 'none';
    }

    // Populate Center Preview
    document.getElementById('preview-question').textContent = activeSlide.question || 'Untitled Question';
    const previewContent = document.getElementById('preview-content');
    
    if (activeSlide.type === 'multiple_choice') {
      previewContent.innerHTML = `<div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:400px;">
        ${(activeSlide.options || []).map(o => `<div style="padding:12px 24px; background:#f1f5f9; border-radius:999px; font-weight:600; color:#475569;">${o}</div>`).join('')}
      </div>`;
    } else if (activeSlide.type === 'word_cloud') {
      previewContent.innerHTML = `
        <div style="color:#0ea5e9; font-weight:800; font-size:3rem; opacity:0.8;">Cloud Word</div>
        <div style="color:#10b981; font-weight:700; font-size:2rem; opacity:0.6; position:absolute; transform:translate(-80px, -50px);">Thoughts</div>
        <div style="color:#f59e0b; font-weight:600; font-size:1.5rem; opacity:0.5; position:absolute; transform:translate(100px, 60px);">Ideas</div>
      `;
    } else if (activeSlide.type === 'open_ended') {
      previewContent.innerHTML = `
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
          <div style="padding:16px 24px; background:#fff; border-radius:12px; box-shadow:0 2px 4px rgba(0,0,0,0.1); font-size:1.2rem;">Sample Answer...</div>
          <div style="padding:16px 24px; background:#fff; border-radius:12px; box-shadow:0 2px 4px rgba(0,0,0,0.1); font-size:1.2rem;">Another response</div>
        </div>
      `;
    }
  }

  window.updateOption = function(idx, val) {
    const survey = surveys.find(s => s.id === currentSurveyId);
    if(survey && survey.slides[activeSlideIndex] && survey.slides[activeSlideIndex].type === 'multiple_choice') {
      survey.slides[activeSlideIndex].options[idx] = val;
      renderEditor();
    }
  };

  window.deleteOption = function(idx) {
    const survey = surveys.find(s => s.id === currentSurveyId);
    if(survey && survey.slides[activeSlideIndex] && survey.slides[activeSlideIndex].type === 'multiple_choice') {
      survey.slides[activeSlideIndex].options.splice(idx, 1);
      renderEditor();
    }
  };

  // --- LIVE PRESENTER LOGIC ---
  
  let currentLiveCode = null;
  let currentLiveSurvey = null;

  window.presentSurvey = async function(id) {
    currentSurveyId = id;
    currentLiveSurvey = surveys.find(s => s.id === id);
    if (!currentLiveSurvey) return;

    window.showScreen('screen-survey-live-admin');
    document.getElementById('live-survey-title').textContent = currentLiveSurvey.name;
    
    // Generate an easy 6 digit code
    currentLiveCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('live-survey-code').textContent = currentLiveCode;
    
    activeSlideIndex = 0;
    
    try {
      // Create session in live_surveys
      await db.collection('live_surveys').doc(currentLiveCode).set({
        surveyId: currentLiveSurvey.id,
        surveyName: currentLiveSurvey.name,
        activeSlideIndex: activeSlideIndex,
        totalSlides: currentLiveSurvey.slides.length,
        slides: currentLiveSurvey.slides, // include full structure so clients don't need to fetch global
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      startListeningToLiveResponses();
      renderLiveSlide();
    } catch(e) {
      console.error("Error starting live survey:", e);
    }
  };

  function startListeningToLiveResponses() {
    if (liveResponsesUnsubscribe) liveResponsesUnsubscribe();
    liveResponsesUnsubscribe = db.collection('survey_responses')
      .where('code', '==', currentLiveCode)
      .onSnapshot(snap => {
        const activeSlideId = currentLiveSurvey.slides[activeSlideIndex].id;
        
        // Filter responses for CURRENT slide
        const responses = [];
        snap.forEach(doc => {
          const d = doc.data();
          if(d.slideId === activeSlideId) {
            responses.push(d);
          }
        });
        
        document.getElementById('live-survey-participant-count').innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle; margin-right: 4px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          ${responses.length}
        `;
        
        renderLiveVisuals(responses);
      });
  }

  function stopLiveSurvey() {
    if (liveResponsesUnsubscribe) liveResponsesUnsubscribe();
    liveResponsesUnsubscribe = null;
    
    if (liveChart) {
      liveChart.destroy();
      liveChart = null;
    }
    
    if (currentLiveCode) {
      db.collection('live_surveys').doc(currentLiveCode).update({
        status: 'ended'
      }).catch(console.error);
      currentLiveCode = null;
    }
  }

  async function changeLiveSlide(delta) {
    if(!currentLiveSurvey) return;
    const newIdx = activeSlideIndex + delta;
    if(newIdx >= 0 && newIdx < currentLiveSurvey.slides.length) {
      activeSlideIndex = newIdx;
      try {
        await db.collection('live_surveys').doc(currentLiveCode).update({
          activeSlideIndex: activeSlideIndex
        });
        renderLiveSlide();
        // re-fetch responses for new slide
        startListeningToLiveResponses();
      } catch(e) {
        console.error("Failed to change slide:", e);
      }
    }
  }

  function renderLiveSlide() {
    const slide = currentLiveSurvey.slides[activeSlideIndex];
    document.getElementById('live-survey-question').textContent = slide.question;
    document.getElementById('survey-slide-counter').textContent = `${activeSlideIndex + 1} / ${currentLiveSurvey.slides.length}`;
    
    document.getElementById('survey-live-chart').style.display = 'none';
    document.getElementById('survey-live-open-ended').style.display = 'none';
    
    if(liveChart) {
      liveChart.destroy();
      liveChart = null;
    }
    
    if(slide.type === 'multiple_choice') {
      const ctx = document.getElementById('survey-live-chart');
      ctx.style.display = 'block';
      // Setup Chart.js
      liveChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: slide.options || [],
          datasets: [{
            label: 'Votes',
            data: new Array((slide.options || []).length).fill(0),
            backgroundColor: '#0ea5e9',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
            x: { grid: { display: false }, ticks: { font: { size: 16, weight: 'bold' } } }
          }
        }
      });
    } else if (slide.type === 'open_ended' || slide.type === 'word_cloud') {
      const div = document.getElementById('survey-live-open-ended');
      div.style.display = 'flex';
      div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
    }
  }

  function renderLiveVisuals(responses) {
    const slide = currentLiveSurvey.slides[activeSlideIndex];
    if(!slide) return;
    
    if (slide.type === 'multiple_choice' && liveChart) {
      // count votes
      const counts = new Array((slide.options || []).length).fill(0);
      responses.forEach(r => {
        const idx = slide.options.indexOf(r.answer);
        if(idx !== -1) counts[idx]++;
      });
      liveChart.data.datasets[0].data = counts;
      liveChart.update();
    } 
    else if (slide.type === 'open_ended') {
      const div = document.getElementById('survey-live-open-ended');
      div.innerHTML = '';
      if(responses.length === 0) {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
        return;
      }
      responses.forEach(r => {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 16px 24px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid var(--section-divider); font-size: 1.25rem; font-weight: 600; color: var(--text); max-width: 400px; animation: popIn 0.3s ease-out;';
        card.textContent = r.answer;
        div.appendChild(card);
      });
    }
    else if (slide.type === 'word_cloud') {
      // Basic text-based word cloud (font size scales by frequency)
      const div = document.getElementById('survey-live-open-ended');
      div.innerHTML = '';
      if(responses.length === 0) {
        div.innerHTML = '<div style="color:var(--text-secondary); margin-top:40px;">Waiting for responses...</div>';
        return;
      }
      
      const freq = {};
      responses.forEach(r => {
        const words = (r.answer || '').split(/\s+/);
        words.forEach(w => {
          const cw = w.toLowerCase().replace(/[^a-z0-9]/g, '');
          if(cw) freq[cw] = (freq[cw] || 0) + 1;
        });
      });
      
      const maxFreq = Math.max(...Object.values(freq), 1);
      
      // Shuffle keys for random layout
      const keys = Object.keys(freq).sort(() => Math.random() - 0.5);
      
      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      
      keys.forEach((w, idx) => {
        const count = freq[w];
        // Scale font size from 1rem to 4rem based on frequency
        const size = 1 + (count / maxFreq) * 3;
        const color = colors[idx % colors.length];
        
        const span = document.createElement('span');
        span.style.cssText = `font-size: ${size}rem; font-weight: 800; color: ${color}; margin: 8px; line-height: 1; transition: all 0.3s;`;
        span.textContent = w;
        div.appendChild(span);
      });
    }
  }
})();
