(function() {
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
        activeSlideIndex: window.SurveyState.activeSlideIndex,
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
        const uniqueParticipants = new Set();
        responses.forEach(r => {
          if (r.participantId) uniqueParticipants.add(r.participantId);
          else uniqueParticipants.add(r.participantName || 'Anonymous');
        });
        
        document.getElementById('live-survey-participant-count').innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="vertical-align: middle; margin-right: 4px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          ${uniqueParticipants.size}
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

  window.stopLiveSurvey = function() {
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

  window.changeLiveSlide = async function(delta) {
    if(!currentLiveSurvey) return;
    const newIdx = window.SurveyState.activeSlideIndex + delta;
    if(newIdx >= 0 && newIdx < currentLiveSurvey.slides.length) {
      window.SurveyState.activeSlideIndex = newIdx;
      try {
        await window.db.collection('live_surveys').doc(currentLiveCode).update({
          activeSlideIndex: window.SurveyState.activeSlideIndex
        });
        
        renderLiveSlide();
        startListeningToLiveResponses();
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
