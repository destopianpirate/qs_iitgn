(function() {
  let db = null;
  const initInterval = setInterval(() => {
    if (window.db) {
      db = window.db;
      clearInterval(initInterval);
      setup();
    }
  }, 100);

  let currentCode = null;
  let participantName = '';
  let liveSurveyUnsubscribe = null;
  let currentSlideId = null;

  function setup() {
    document.getElementById('btn-survey-join').addEventListener('click', joinSurvey);
  }

  async function joinSurvey() {
    const nameInp = document.getElementById('inp-survey-name').value.trim();
    const codeInp = document.getElementById('inp-survey-code').value.trim();
    const errEl = document.getElementById('survey-join-err');
    
    if(!nameInp || !codeInp) {
      errEl.textContent = "Please enter your name and code.";
      errEl.style.display = 'block';
      return;
    }
    
    try {
      const doc = await db.collection('live_surveys').doc(codeInp).get();
      if(!doc.exists || doc.data().status !== 'active') {
        errEl.textContent = "Invalid or inactive survey code.";
        errEl.style.display = 'block';
        return;
      }
      
      participantName = nameInp;
      currentCode = codeInp;
      errEl.style.display = 'none';
      
      document.getElementById('survey-step-join').style.display = 'none';
      document.getElementById('survey-step-lobby').style.display = 'block';
      
      startListening();
      
    } catch(e) {
      console.error(e);
      errEl.textContent = "Connection error. Try again.";
      errEl.style.display = 'block';
    }
  }

  function startListening() {
    liveSurveyUnsubscribe = db.collection('live_surveys').doc(currentCode).onSnapshot(doc => {
      if(!doc.exists || doc.data().status !== 'active') {
        // Survey ended
        document.getElementById('survey-step-active').style.display = 'none';
        document.getElementById('survey-step-lobby').style.display = 'block';
        document.getElementById('survey-step-lobby').innerHTML = `<h4 style="font-size: 1.5rem; margin-bottom: 16px; font-weight: 800; color: #ef4444;">Survey Ended</h4><p style="color: var(--text-secondary); font-size: 1.1rem;">Thank you for participating!</p>`;
        if(liveSurveyUnsubscribe) liveSurveyUnsubscribe();
        return;
      }
      
      const data = doc.data();
      const slide = data.slides[data.activeSlideIndex];
      
      if(slide.id !== currentSlideId) {
        currentSlideId = slide.id;
        renderActiveSlide(slide);
      }
    });
  }

  function renderActiveSlide(slide) {
    document.getElementById('survey-step-lobby').style.display = 'none';
    document.getElementById('survey-step-active').style.display = 'block';
    document.getElementById('survey-submitted-msg').style.display = 'none';
    
    document.getElementById('survey-slide-question').textContent = slide.question;
    const interactiveArea = document.getElementById('survey-interactive-area');
    interactiveArea.style.display = 'flex';
    interactiveArea.innerHTML = '';
    
    if(slide.type === 'multiple_choice') {
      (slide.options || []).forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'width: 100%; padding: 16px; font-size: 1.1rem; font-weight: 600; background: #f8fafc; border: 2px solid var(--section-divider); border-radius: 12px; color: var(--text); cursor: pointer; transition: all 0.2s;';
        btn.textContent = opt;
        btn.onclick = () => {
          submitResponse(slide.id, opt);
        };
        // hover effect
        btn.onmouseover = () => { btn.style.borderColor = '#0ea5e9'; btn.style.background = 'rgba(14,165,233,0.05)'; };
        btn.onmouseout = () => { btn.style.borderColor = 'var(--section-divider)'; btn.style.background = '#f8fafc'; };
        interactiveArea.appendChild(btn);
      });
    } 
    else if (slide.type === 'open_ended' || slide.type === 'word_cloud') {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = 'Type your answer...';
      inp.style.cssText = 'width: 100%; padding: 16px; font-size: 1.1rem; border-radius: 12px; border: 2px solid var(--section-divider); outline: none; margin-bottom: 12px;';
      
      const btn = document.createElement('button');
      btn.textContent = 'Submit';
      btn.className = 'btn-sky';
      btn.style.cssText = 'width: 100%; padding: 14px; font-size: 1.1rem; border-radius: 12px;';
      
      btn.onclick = () => {
        if(inp.value.trim()) {
          submitResponse(slide.id, inp.value.trim());
        }
      };
      
      interactiveArea.appendChild(inp);
      interactiveArea.appendChild(btn);
    }
  }

  async function submitResponse(slideId, answerText) {
    // Hide controls, show success
    document.getElementById('survey-interactive-area').style.display = 'none';
    document.getElementById('survey-submitted-msg').style.display = 'block';
    
    try {
      await db.collection('survey_responses').add({
        code: currentCode,
        slideId: slideId,
        participantName: participantName,
        answer: answerText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) {
      console.error("Failed to submit response:", e);
      alert("Failed to submit response. Please try again.");
      document.getElementById('survey-interactive-area').style.display = 'flex';
      document.getElementById('survey-submitted-msg').style.display = 'none';
    }
  }
})();
