const fs = require('fs');
let code = fs.readFileSync('js/admin-surveys.js', 'utf8');

// Replace state variables
const varsToReplace = ['surveys', 'currentSurveyId', 'activeSlideIndex', 'liveSurveyUnsubscribe', 'liveResponsesUnsubscribe', 'liveChart'];
varsToReplace.forEach(v => {
  const regex = new RegExp('\\b' + v + '\\b', 'g');
  code = code.replace(regex, 'window.SurveyState.' + v);
});

// Fix the declarations
code = code.replace(/let window\.SurveyState\.surveys = \[\];/, '');
code = code.replace(/let window\.SurveyState\.currentSurveyId = null;/, '');
code = code.replace(/let window\.SurveyState\.activeSlideIndex = 0;/, '');
code = code.replace(/let window\.SurveyState\.liveSurveyUnsubscribe = null;/, '');
code = code.replace(/let window\.SurveyState\.liveResponsesUnsubscribe = null;/, '');
code = code.replace(/let window\.SurveyState\.liveChart = null;/, '');
code = code.replace(/let db = null;/, '');
code = code.replace(/let window\.db = null;/, '');

// Fix 'db' references to 'window.db'
code = code.replace(/\bdb\b/g, 'window.db');
// Fix 'window.window.db' just in case
code = code.replace(/window\.window\.db/g, 'window.db');

// Fix 'saveSurveys' to 'window.SurveyState.saveSurveys' so it can be called from other files
code = code.replace(/async function saveSurveys\(\)/g, 'window.SurveyState.saveSurveys = async function()');
code = code.replace(/function debouncedSaveSurveys\(\)/g, 'window.SurveyState.debouncedSaveSurveys = function()');
code = code.replace(/debouncedSaveSurveys\(\)/g, 'window.SurveyState.debouncedSaveSurveys()');
code = code.replace(/saveSurveys\(\)/g, 'window.SurveyState.saveSurveys()');
code = code.replace(/window\.SurveyState\.window\.SurveyState/g, 'window.SurveyState');

// Add the SurveyState initialization at the top
const stateInit = `
window.SurveyState = window.SurveyState || {
  surveys: [],
  currentSurveyId: null,
  activeSlideIndex: 0,
  liveSurveyUnsubscribe: null,
  liveResponsesUnsubscribe: null,
  liveChart: null
};
`;

code = code.replace('(function() {', '(function() {' + stateInit);

// Write to a refactored file
fs.writeFileSync('js/admin-surveys-refactored.js', code);
