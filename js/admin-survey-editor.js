(function() {
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

  window.applySlideStyle = function(prop, val) {
    const survey = window.SurveyState.surveys.find(s => s.id === window.SurveyState.currentSurveyId);
    if (!survey || !survey.slides[window.SurveyState.activeSlideIndex]) return;
    
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles) {
      survey.slides[window.SurveyState.activeSlideIndex].styles = {};
    }
    
    if (!survey.slides[window.SurveyState.activeSlideIndex].styles['slide']) {
      survey.slides[window.SurveyState.activeSlideIndex].styles['slide'] = {};
    }
    
    if (prop === 'clear') {
      survey.slides[window.SurveyState.activeSlideIndex].styles['slide'] = {};
    } else {
      survey.slides[window.SurveyState.activeSlideIndex].styles['slide'][prop] = val;
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

})();
