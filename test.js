const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:8080/admin.html');
  
  console.log("Typing login credentials...");
  // Try to bypass login by setting sessionStorage directly or actually login
  await page.evaluate(() => {
    sessionStorage.setItem('qs_admin', 'true');
    sessionStorage.setItem('qs_admin_id', 'test@test.com');
  });
  
  await page.reload();
  await page.waitForTimeout(2000); // wait for dashboard to render

  console.log("Clicking first quiz card...");
  await page.evaluate(() => {
    const card = document.querySelector('.quiz-card');
    if (card) {
      card.click();
    } else {
      console.log('No quiz card found!');
    }
  });

  await page.waitForTimeout(1000);
  
  const isActive = await page.evaluate(() => {
    const s = document.getElementById('screen-quiz-analytics');
    return s && s.classList.contains('active');
  });
  console.log("Is Analytics Screen Active? ", isActive);

  await browser.close();
})();
