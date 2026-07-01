const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

async function runTest() {
  const html = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: "http://localhost:8080/admin.html",
    runScripts: "dangerously",
    resources: "usable"
  });

  const window = dom.window;
  const document = window.document;

  // Mock essential globals
  window.localStorage = {
    getItem: () => JSON.stringify([{id: 'quiz1', name: 'Test Quiz', visibility: 'private'}]),
    setItem: () => {}
  };
  window.sessionStorage = {
    getItem: (k) => k === 'qs_admin' ? 'true' : 'test@test.com',
    setItem: () => {},
    removeItem: () => {}
  };

  // Wait for scripts to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("Mocking Firebase...");
  window.firebase = {
    auth: () => ({
      onAuthStateChanged: (cb) => cb({ uid: 'test@test.com' })
    }),
    firestore: () => ({
      collection: () => ({
        where: () => ({
          get: async () => ({ forEach: (cb) => cb({ id: 'quiz1', data: () => ({ name: 'Test Quiz' }) }) })
        }),
        get: async () => ({ forEach: () => {} })
      })
    })
  };
  window.db = window.firebase.firestore();

  // Manually run admin-core.js logic to bypass any JSDOM script loading quirks
  const adminCore = fs.readFileSync(path.join(__dirname, 'js/admin-core.js'), 'utf8');
  try {
    window.eval(adminCore);
  } catch (e) {
    console.error("Error loading admin-core.js:", e);
  }

  // Trigger DOMContentLoaded
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  // Trigger login flow to render dashboard
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find card and click
  const card = document.querySelector('.quiz-card');
  if (!card) {
    console.log("No quiz card found in JSDOM!");
    // Dump HTML to see why
    console.log(document.getElementById('grid-private').innerHTML);
    return;
  }
  
  console.log("Found card:", card.outerHTML);
  
  // Override console.error and alert to capture them
  window.console.error = (...args) => console.log("CAUGHT CONSOLE ERROR:", ...args);
  window.alert = (msg) => console.log("CAUGHT ALERT:", msg);

  console.log("Clicking card...");
  try {
    card.click();
  } catch (e) {
    console.log("Error during click:", e);
  }

  console.log("Screen active:", document.getElementById('screen-quiz-analytics').className);
}

runTest();
