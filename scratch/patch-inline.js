const fs = require('fs');

let adminJs = fs.readFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', 'utf8');

// We need to inject the slide styling logic into renderSimulatedStudentSlide for isInline = true
const findStr = 'innerContent = contentHtml;';
const replaceStr = `innerContent = contentHtml;
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
      }`;

adminJs = adminJs.replace(findStr, replaceStr);

fs.writeFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', adminJs);
console.log('Patched isInline styles');
