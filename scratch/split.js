const fs = require('fs');
const lines = fs.readFileSync('js/admin-surveys-refactored.js', 'utf8').split('\n');

const stateLines = [];
const editorLines = [];
const presenterLines = [];

let currentSection = 'state';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('// --- EDITOR LOGIC ---')) {
    currentSection = 'editor';
  } else if (line.includes('// --- LIVE PRESENTER LOGIC ---')) {
    currentSection = 'presenter';
  }

  // Handle the IIFE closing brace at the very end
  if (i === lines.length - 1 && line.trim() === '})();') {
    stateLines.push('})();');
    editorLines.push('})();');
    presenterLines.push('})();');
    continue;
  }

  if (currentSection === 'state') {
    stateLines.push(line);
  } else if (currentSection === 'editor') {
    editorLines.push(line);
  } else if (currentSection === 'presenter') {
    presenterLines.push(line);
  }
}

// Add IIFE wrappers to editor and presenter
editorLines.unshift('(function() {');
presenterLines.unshift('(function() {');

fs.writeFileSync('js/admin-survey-state.js', stateLines.join('\n'));
fs.writeFileSync('js/admin-survey-editor.js', editorLines.join('\n'));
fs.writeFileSync('js/admin-survey-presenter.js', presenterLines.join('\n'));
