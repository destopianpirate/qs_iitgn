const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot.png' });
    await browser.close();
    console.log('Screenshot saved to screenshot.png');
  } catch (err) {
    console.error(err);
  }
})();
