const fs = require('fs');
const path = 'c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js';

let code = fs.readFileSync(path, 'utf8');

const regex = /container\.classList\.add\(themeClass\);/;
const repl = `container.classList.add(themeClass);
    
    // Apply custom slide styles
    if (slide.styles && slide.styles.slide) {
      const s = slide.styles.slide;
      container.style.background = s.background || '';
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
`;

code = code.replace(regex, repl);
fs.writeFileSync(path, code);
console.log('Patched live render.');
