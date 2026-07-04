// Script to safely rewrite admin-surveys.js
const fs = require('fs');
const path = 'c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js';

let code = fs.readFileSync(path, 'utf8');

// 1. Replace the old PQ and RT toolbar logic with the new one
const pqRegex = /const pq = document\.getElementById\('preview-question'\);[\s\S]*?}\n\n\s*document\.getElementById\('btn-survey-add-option'\)/;

const newEvents = `
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
          rtToolbar.style.top = (rect.bottom - pRect.top + 8) + 'px';
          
          let leftPos = rect.left - pRect.left;
          if (leftPos + 400 > pRect.width) leftPos = pRect.width - 400; // prevent overflow
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
          const pRect = previewContainer.parentElement.getBoundingClientRect();
          styleToolbar.style.top = (rect.bottom - pRect.top + 8) + 'px';
          
          let leftPos = rect.left - pRect.left;
          if (leftPos + 300 > pRect.width) leftPos = pRect.width - 300;
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
        const survey = surveys.find(s => s.id === currentSurveyId);
        if (!survey || !survey.slides[activeSlideIndex]) return;
        
        if (e.target.id === 'preview-question') {
          survey.slides[activeSlideIndex].question = e.target.innerHTML;
          document.getElementById('survey-question-text').value = e.target.innerHTML;
        } else if (e.target.hasAttribute('data-option-idx')) {
          const idx = parseInt(e.target.getAttribute('data-option-idx'));
          window.updateOption(idx, e.target.innerHTML, true);
        } else if (e.target.id === 'preview-submit-btn-text') {
          if(!survey.slides[activeSlideIndex].styles) survey.slides[activeSlideIndex].styles = {};
          survey.slides[activeSlideIndex].styles.submitText = e.target.innerHTML;
        }
      });
    }

    document.getElementById('btn-survey-add-option')`;

code = code.replace(pqRegex, newEvents);

// 2. Add applyStyleToActiveTarget before changeLiveSlide
const applyStyleFn = `
  window.applyStyleToActiveTarget = function(prop, val) {
    const survey = surveys.find(s => s.id === currentSurveyId);
    if (!survey || !survey.slides[activeSlideIndex]) return;
    if (!survey.slides[activeSlideIndex].styles) survey.slides[activeSlideIndex].styles = {};
    
    const type = window.activeStylingTargetType;
    if (!type) return;
    if (!survey.slides[activeSlideIndex].styles[type]) survey.slides[activeSlideIndex].styles[type] = {};
    
    if (prop === 'clear') {
      survey.slides[activeSlideIndex].styles[type] = {};
    } else {
      survey.slides[activeSlideIndex].styles[type][prop] = val;
    }
    
    renderEditor(); // This will trigger a re-render of the preview inline
  };

  async function changeLiveSlide`;

code = code.replace(/async function changeLiveSlide/, applyStyleFn);

// 3. Rewrite renderSimulatedStudentSlide
const renderRegex = /window\.renderSimulatedStudentSlide = function\(container, slide, requireName, isInline = false\) \{[\s\S]*?\/\/ --- LIVE PRESENTER LOGIC ---/;

const newRender = `window.renderSimulatedStudentSlide = function(container, slide, requireName, isInline = false) {
    let contentHtml = '';
    const themeClass = slide.theme || 'theme-default';
    
    const s = slide.styles || {};
    
    function buildCss(stylesObj, defaults) {
      let str = defaults || '';
      if (!stylesObj) return str;
      if (stylesObj.background) str += \`background:\${stylesObj.background} !important; \`;
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
    const btnHtml = \`<button style="\${btnCss}" data-style-target="button">\${isInline ? \`<span id="preview-submit-btn-text" contenteditable="true" style="outline:none;">\${submitText}</span>\` : submitText}</button>\`;

    if (slide.type === 'multiple_choice') {
      contentHtml = \`<div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:400px;">
        \${(slide.options || []).map((o, i) => \`<div data-style-target="option" data-option-idx="\${i}" \${isInline ? 'contenteditable="true"' : ''} style="\${optionCss} text-align:center; outline:none; cursor:\${isInline ? 'text' : 'pointer'};">\${o}</div>\`).join('')}
      </div>\`;
    } else if (slide.type === 'word_cloud') {
      contentHtml = \`<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:400px;">
        <input type="text" placeholder="Enter a word..." \${isInline ? 'disabled' : ''} data-style-target="input" style="\${inputCss} margin-bottom:12px; \${isInline ? 'opacity:0.7;' : ''}">
        \${btnHtml.replace('#0ea5e9', '#0ea5e9')}
      </div>\`;
    } else if (slide.type === 'open_ended' || slide.type === 'q_and_a') {
      contentHtml = \`<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:500px;">
        <textarea rows="4" placeholder="\${slide.type === 'q_and_a' ? 'Ask a question...' : 'Type your answer here...'}" \${isInline ? 'disabled' : ''} data-style-target="input" style="\${textareaCss} margin-bottom:12px; \${isInline ? 'opacity:0.7;' : ''}"></textarea>
        \${btnHtml.replace('#0ea5e9', '#10b981')}
      </div>\`;
    } else if (slide.type === 'scales') {
      contentHtml = \`<div style="width:100%; max-width:500px; display:flex; flex-direction:column; gap:16px;">
        \${(slide.options || []).map((o, i) => \`
          <div style="background:rgba(255,255,255,0.8); padding:16px; border-radius:12px;">
            <div \${isInline ? 'contenteditable="true"' : ''} data-option-idx="\${i}" style="font-weight:700; margin-bottom:12px; color:#1e293b; outline:none; cursor:\${isInline ? 'text' : 'default'};">\${o}</div>
            <input type="range" min="1" max="5" value="3" \${isInline ? 'disabled' : ''} style="width:100%;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-top:4px;"><span>Strongly Disagree</span><span>Strongly Agree</span></div>
          </div>
        \`).join('')}
        \${btnHtml.replace('#0ea5e9', '#8b5cf6')}
      </div>\`;
    } else if (slide.type === 'ranking') {
      contentHtml = \`<div style="width:100%; max-width:400px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:0.9rem; margin-bottom:8px;">Drag to rank options (1st is highest)</div>
        \${(slide.options || []).map((o, i) => \`
          <div data-style-target="option" style="\${optionCss} display:flex; align-items:center; gap:12px; padding:16px 24px;">
            <div style="background:#e2e8f0; color:#475569; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; flex-shrink: 0;">\${i+1}</div>
            <div \${isInline ? 'contenteditable="true"' : ''} data-option-idx="\${i}" style="flex:1; outline:none; cursor:\${isInline ? 'text' : 'pointer'};">\${o}</div>
          </div>
        \`).join('')}
        <div style="margin-top:8px;">\${btnHtml.replace('#0ea5e9', '#ec4899')}</div>
      </div>\`;
    } else if (slide.type === 'guess_number') {
      contentHtml = \`<div style="padding:16px; background:rgba(255,255,255,0.8); border-radius:12px; width:100%; max-width:400px; display:flex; flex-direction:column; gap:12px;">
        <input type="number" placeholder="Enter your guess..." \${isInline ? 'disabled' : ''} data-style-target="input" style="\${inputCss} font-size:1.5rem; text-align:center; \${isInline ? 'opacity:0.7;' : ''}">
        \${btnHtml.replace('#0ea5e9', '#f59e0b')}
      </div>\`;
    }

    let reactionHtml = '';
    if ((slide.reactions || []).length > 0) {
      reactionHtml = \`<div style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); display:flex; gap:12px; background:rgba(255,255,255,0.9); padding:12px 24px; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        \${slide.reactions.map(r => \`<button style="background:none; border:none; cursor:pointer; color: var(--text); transition:transform 0.1s; display: flex; align-items: center; justify-content: center;" onmousedown="this.style.transform='scale(0.8)'" onmouseup="this.style.transform='scale(1)'">\${REACTION_SVGS[r] || r}</button>\`).join('')}
      </div>\`;
    }

    let innerContent = '';
    if (isInline) {
      innerContent = contentHtml;
    } else {
      innerContent = \`
        <div class="\${themeClass}" data-style-target="slide" style="width:100%; min-height:100%; padding:40px 20px; display:flex; flex-direction:column; align-items:center; position:relative; \${slideCss}">
          <h2 id="preview-question" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 40px; text-align:center; max-width:800px;">\${slide.question || 'Untitled Question'}</h2>
          \${contentHtml}
          \${reactionHtml}
        </div>
      \`;
    }

    container.innerHTML = innerContent;
  };

  // --- LIVE PRESENTER LOGIC ---
`;

code = code.replace(renderRegex, newRender);
fs.writeFileSync(path, code);
console.log('Successfully applied updates to admin-surveys.js');
