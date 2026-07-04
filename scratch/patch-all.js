const fs = require('fs');

// --- Patch admin.html ---
let adminHtml = fs.readFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\admin.html', 'utf8');

adminHtml = adminHtml.replace(/id="rich-text-toolbar" style="display: none; position: absolute;/, 'id="rich-text-toolbar" style="display: none; position: fixed;');
adminHtml = adminHtml.replace(/id="style-toolbar" style="display: none; position: absolute;/, 'id="style-toolbar" style="display: none; position: fixed;');
adminHtml = adminHtml.replace(/id="survey-slide-preview" class="theme-default" style="/, 'id="survey-slide-preview" class="theme-default" data-style-target="slide" style="');
adminHtml = adminHtml.replace(/onchange="document.execCommand\('hiliteColor', false, this.value\)"/g, 'oninput="document.execCommand(\'hiliteColor\', false, this.value)"');
adminHtml = adminHtml.replace(/onchange="window.applyStyleToActiveTarget\('background', this.value\)"/g, 'oninput="window.applyStyleToActiveTarget(\'background\', this.value)"');

// Move toolbars outside to body
// Find the exact strings and move them to end of body
let rtStart = adminHtml.indexOf('<!-- Floating Rich Text Toolbar -->');
let rtEnd = adminHtml.indexOf('</div>', adminHtml.indexOf('</select>', rtStart)) + 6;
let stStart = adminHtml.indexOf('<!-- Floating Style Toolbar -->');
let stEnd = adminHtml.indexOf('</div>', adminHtml.indexOf('Clear Styles', stStart)) + 6;

if (rtStart !== -1 && stStart !== -1) {
  let rtHtml = adminHtml.substring(rtStart, rtEnd);
  let stHtml = adminHtml.substring(stStart, stEnd);
  
  // Remove them from their current place
  adminHtml = adminHtml.substring(0, rtStart) + adminHtml.substring(rtEnd, stStart) + adminHtml.substring(stEnd);
  
  // Add before closing body
  adminHtml = adminHtml.replace('</body>', rtHtml + '\n' + stHtml + '\n</body>');
}

fs.writeFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\admin.html', adminHtml);


// --- Patch admin-surveys.js ---
let adminJs = fs.readFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', 'utf8');

adminJs = adminJs.replace(/const pRect = previewContainer\.parentElement\.getBoundingClientRect\(\);\s*rtToolbar\.style\.top = \(rect\.bottom - pRect\.top \+ 8\) \+ 'px';\s*let leftPos = rect\.left - pRect\.left;\s*if \(leftPos \+ 400 > pRect\.width\) leftPos = pRect\.width - 400;\s*rtToolbar\.style\.left = Math\.max\(0, leftPos\) \+ 'px';/g, 
`rtToolbar.style.top = (rect.bottom + 8) + 'px';
let leftPos = rect.left;
if (leftPos + 400 > window.innerWidth) leftPos = window.innerWidth - 400;
rtToolbar.style.left = Math.max(0, leftPos) + 'px';`);

adminJs = adminJs.replace(/const pRect = previewContainer\.parentElement\.getBoundingClientRect\(\);\s*styleToolbar\.style\.top = \(rect\.bottom - pRect\.top \+ 8\) \+ 'px';\s*let leftPos = rect\.left - pRect\.left;\s*if \(leftPos \+ 300 > pRect\.width\) leftPos = pRect\.width - 300;\s*styleToolbar\.style\.left = Math\.max\(0, leftPos\) \+ 'px';/g, 
`styleToolbar.style.top = (rect.bottom + 8) + 'px';
let leftPos = rect.left;
if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 300;
styleToolbar.style.left = Math.max(0, leftPos) + 'px';`);

adminJs = adminJs.replace(
  /<div data-style-target="option" data-option-idx="\${i}" \${isInline \? 'contenteditable="true"' : ''} style="\${optionCss} text-align:center; outline:none; cursor:\${isInline \? 'text' : 'pointer'};\}>\${o}<\/div>/g,
  `<div data-style-target="option" style="\${optionCss} text-align:center; outline:none; cursor:pointer;"><span data-option-idx="\${i}" \${isInline ? 'contenteditable="true"' : ''} style="cursor:\${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:\${isInline ? 'auto' : 'none'};">\${o}</span></div>`
);

adminJs = adminJs.replace(
  /<div \${isInline \? 'contenteditable="true"' : ''} data-option-idx="\${i}" style="font-weight:700; margin-bottom:12px; color:#1e293b; outline:none; cursor:\${isInline \? 'text' : 'default'};\}>\${o}<\/div>/g,
  `<div style="font-weight:700; margin-bottom:12px; color:#1e293b; outline:none;"><span data-option-idx="\${i}" \${isInline ? 'contenteditable="true"' : ''} style="cursor:\${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:\${isInline ? 'auto' : 'none'};">\${o}</span></div>`
);

adminJs = adminJs.replace(
  /<div \${isInline \? 'contenteditable="true"' : ''} data-option-idx="\${i}" style="flex:1; outline:none; cursor:\${isInline \? 'text' : 'pointer'};\}>\${o}<\/div>/g,
  `<div style="flex:1; outline:none;"><span data-option-idx="\${i}" \${isInline ? 'contenteditable="true"' : ''} style="cursor:\${isInline ? 'text' : 'pointer'}; outline:none; display:inline-block; min-width:50px; pointer-events:\${isInline ? 'auto' : 'none'};">\${o}</span></div>`
);

fs.writeFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', adminJs);
console.log('Patched');
