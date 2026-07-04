const fs = require('fs');
const path = 'c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\quiz.js';

let code = fs.readFileSync(path, 'utf8');

// Replace renderActiveSurveySlide
const regex = /function renderActiveSurveySlide\(slide\) \{[\s\S]*?async function submitSurveyResponse/m;

const newRender = `function renderActiveSurveySlide(slide) {
    document.getElementById('portal-step-survey-lobby').style.display = 'none';
    const container = document.getElementById('portal-step-survey-active');
    container.style.display = 'block';
    document.getElementById('survey-submitted-msg').style.display = 'none';
    
    // Apply custom slide background styles
    const s = slide.styles || {};
    if (s.slide) {
      container.style.background = s.slide.background || '';
      if (s.slide.design === 'glass') { container.style.background = 'rgba(255,255,255,0.2)'; container.style.backdropFilter = 'blur(12px)'; container.style.color = 'var(--text)'; }
      else if (s.slide.design === 'solid-dark') { container.style.background = '#1e293b'; container.style.color = 'white'; }
      else if (s.slide.design === 'solid-light') { container.style.background = '#ffffff'; container.style.color = '#1e293b'; }
      else if (s.slide.design === 'gradient-ocean') { container.style.background = 'linear-gradient(135deg, #0ea5e9, #3b82f6)'; container.style.color = 'white'; }
      else if (s.slide.design === 'gradient-sunset') { container.style.background = 'linear-gradient(135deg, #f97316, #ec4899)'; container.style.color = 'white'; }
      // Apply border radius and padding if we applied a background
      if(s.slide.background || s.slide.design) {
         container.style.padding = '40px';
         container.style.borderRadius = '24px';
      }
    } else {
      container.style.background = '';
      container.style.backdropFilter = '';
      container.style.color = '';
      container.style.padding = '0';
    }
    
    document.getElementById('survey-slide-question').innerHTML = slide.question || 'Untitled Question';
    const interactiveArea = document.getElementById('survey-interactive-area');
    interactiveArea.style.display = 'flex';
    interactiveArea.innerHTML = '';
    
    function applyElementStyle(el, typeObj) {
      if(!typeObj) return;
      if (typeObj.background) el.style.setProperty('background', typeObj.background, 'important');
      if (typeObj.design === 'glass') { el.style.setProperty('background', 'rgba(255,255,255,0.2)', 'important'); el.style.setProperty('backdrop-filter', 'blur(12px)', 'important'); el.style.setProperty('border', '1px solid rgba(255,255,255,0.4)', 'important'); el.style.setProperty('color', 'var(--text)', 'important'); }
      else if (typeObj.design === 'solid-dark') { el.style.setProperty('background', '#1e293b', 'important'); el.style.setProperty('color', 'white', 'important'); el.style.setProperty('border', 'none', 'important'); }
      else if (typeObj.design === 'solid-light') { el.style.setProperty('background', '#ffffff', 'important'); el.style.setProperty('color', '#1e293b', 'important'); el.style.setProperty('border', '1px solid #e2e8f0', 'important'); }
      else if (typeObj.design === 'gradient-ocean') { el.style.setProperty('background', 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 'important'); el.style.setProperty('color', 'white', 'important'); el.style.setProperty('border', 'none', 'important'); }
      else if (typeObj.design === 'gradient-sunset') { el.style.setProperty('background', 'linear-gradient(135deg, #f97316, #ec4899)', 'important'); el.style.setProperty('color', 'white', 'important'); el.style.setProperty('border', 'none', 'important'); }
    }
    
    if(slide.type === 'multiple_choice') {
      (slide.options || []).forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = 'width: 100%; padding: 16px; font-size: 1.1rem; font-weight: 600; background: #f8fafc; border: 2px solid var(--section-divider); border-radius: 12px; color: var(--text); cursor: pointer; transition: all 0.2s; text-align: center;';
        applyElementStyle(btn, s.option);
        btn.innerHTML = opt;
        btn.onclick = () => submitSurveyResponse(slide, opt);
        // Only apply hover if no custom background is set
        if(!s.option || (!s.option.background && !s.option.design)) {
          btn.onmouseover = () => { btn.style.borderColor = '#0ea5e9'; btn.style.background = 'rgba(14,165,233,0.05)'; };
          btn.onmouseout = () => { btn.style.borderColor = 'var(--section-divider)'; btn.style.background = '#f8fafc'; };
        }
        interactiveArea.appendChild(btn);
      });
    } 
    else if (slide.type === 'open_ended' || slide.type === 'word_cloud' || slide.type === 'q_and_a') {
      const isWordCloud = slide.type === 'word_cloud';
      const isQA = slide.type === 'q_and_a';
      
      const inp = isWordCloud ? document.createElement('input') : document.createElement('textarea');
      if (isWordCloud) inp.type = 'text';
      else inp.rows = 4;
      
      inp.placeholder = isQA ? 'Ask a question...' : 'Type your answer...';
      inp.style.cssText = \`width: 100%; padding: \${isWordCloud ? '16px' : '12px'}; font-size: 1.1rem; border-radius: \${isWordCloud ? '12px' : '24px'}; border: 2px solid var(--section-divider); outline: none; margin-bottom: 12px; box-sizing: border-box; resize: none;\`;
      applyElementStyle(inp, s.input);
      
      const btn = document.createElement('button');
      btn.innerHTML = s.submitText || 'Submit';
      btn.className = 'btn-sky';
      btn.style.cssText = 'width: 100%; padding: 14px; font-size: 1.1rem; border-radius: 12px; cursor: pointer; border: none;';
      applyElementStyle(btn, s.button);
      
      btn.onclick = () => {
        if(inp.value.trim()) {
          submitSurveyResponse(slide, inp.value.trim());
        }
      };
      
      interactiveArea.appendChild(inp);
      interactiveArea.appendChild(btn);
    }
  }

  async function submitSurveyResponse`;

code = code.replace(regex, newRender);
fs.writeFileSync(path, code);
console.log('Patched active quiz render.');
