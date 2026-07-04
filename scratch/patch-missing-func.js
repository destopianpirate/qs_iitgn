const fs = require('fs');

let adminJs = fs.readFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', 'utf8');

if (!adminJs.includes('window.applyStyleToActiveTarget')) {
  adminJs += `
  window.applyStyleToActiveTarget = function(prop, val) {
    const survey = window.surveys ? window.surveys.find(s => s.id === window.currentSurveyId) : null;
    if (!survey || typeof window.activeSlideIndex === 'undefined' || !survey.slides[window.activeSlideIndex]) return;
    
    if (!survey.slides[window.activeSlideIndex].styles) {
      survey.slides[window.activeSlideIndex].styles = {};
    }
    
    const type = window.activeStylingTargetType;
    if (!type) return;
    
    if (!survey.slides[window.activeSlideIndex].styles[type]) {
      survey.slides[window.activeSlideIndex].styles[type] = {};
    }
    
    if (prop === 'clear') {
      survey.slides[window.activeSlideIndex].styles[type] = {};
    } else {
      survey.slides[window.activeSlideIndex].styles[type][prop] = val;
    }
    
    // Save locally
    if(window.saveSurveys) window.saveSurveys();
    
    // Re-render
    if(window.renderEditor) window.renderEditor();
  };
`;
  fs.writeFileSync('c:\\Users\\DELL\\OneDrive\\Desktop\\destopianpirate\\QS\\js\\admin-surveys.js', adminJs);
  console.log('Appended applyStyleToActiveTarget');
} else {
  console.log('Already exists');
}
