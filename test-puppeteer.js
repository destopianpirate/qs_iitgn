const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  try {
    // Try to find Edge or Chrome path
    const paths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    ];
    let execPath = paths.find(p => fs.existsSync(p));
    
    if (!execPath) {
      console.log("Could not find Edge or Chrome!");
      return;
    }
    
    console.log("Using browser:", execPath);
    const browser = await puppeteer.launch({
      executablePath: execPath,
      headless: "new"
    });
    
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:8080/admin.html');
    
    // login
    await page.type('#inp-user', 'admin');
    await page.type('#inp-pass', 'admin');
    
    // stub firebase auth
    await page.evaluate(() => {
      window.firebase = {
        auth: () => ({
          signInWithEmailAndPassword: async () => ({})
        })
      };
      window.fetchQuizzesFromDB = async () => {};
    });
    
    await page.click('#login-form button[type="submit"]');
    
    await page.waitForTimeout(1000);
    console.log("After login, looking for btn-new-quiz");
    
    await page.click('#btn-new-quiz');
    
    await page.waitForTimeout(1000);
    
    const activeScreen = await page.evaluate(() => {
      const active = document.querySelector('.screen.active');
      return active ? active.id : null;
    });
    
    console.log("Active screen after click:", activeScreen);
    
    await browser.close();
  } catch (e) {
    console.log("Error:", e);
  }
})();
