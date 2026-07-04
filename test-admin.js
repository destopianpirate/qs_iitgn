const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://127.0.0.1:8080/admin.html', { waitUntil: 'networkidle2' });
  
  console.log('Clicking login...');
  // Fill login form (assuming there's a login form, but maybe we can bypass or it works)
  await page.evaluate(() => {
    document.getElementById('inp-user').value = 'admin@example.com';
    document.getElementById('inp-pass').value = 'password';
    document.querySelector('#login-form button').click();
  });
  
  await page.waitForTimeout(1000);
  
  console.log('Clicking Create New Quiz...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-new-quiz');
    if (btn) btn.click();
    else console.log('Button not found');
  });
  
  await page.waitForTimeout(1000);
  
  console.log('Done.');
  await browser.close();
})();
