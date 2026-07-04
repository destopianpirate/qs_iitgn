const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("admin.html", "utf-8");
const adminCore = fs.readFileSync("js/admin-core.js", "utf-8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.localStorage.setItem('qs_admin', 'true');
dom.window.localStorage.setItem('qs_admin_quizzes', '[]');

// Mock Quill
dom.window.Quill = class {
  constructor() {}
  setText() {}
};
dom.window.firebase = { auth: () => ({}) };

dom.window.document.addEventListener("DOMContentLoaded", () => {
  // Execute admin-core.js
  const scriptEl = dom.window.document.createElement("script");
  scriptEl.textContent = adminCore;
  dom.window.document.body.appendChild(scriptEl);

  setTimeout(() => {
    const btn = dom.window.document.getElementById('btn-new-quiz');
    if (btn) {
      console.log("Found btn-new-quiz, clicking...");
      try {
        btn.click();
        const activeScreen = dom.window.document.querySelector('.screen.active');
        console.log("Active screen is now:", activeScreen ? activeScreen.id : "none");
        
        // Print alerts
        console.log("Alerts:", dom.window._alerts || []);
      } catch (e) {
        console.log("Error during click:", e.message);
      }
    } else {
      console.log("Could not find btn-new-quiz!");
    }
  }, 1000);
});

dom.window.alert = (msg) => {
  dom.window._alerts = dom.window._alerts || [];
  dom.window._alerts.push(msg);
  console.log("ALERT CALLED:", msg);
};
