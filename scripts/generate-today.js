const fs = require('fs');
const path = require('path');
const outputDir = path.join(__dirname, '../js/data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outputFile = path.join(outputDir, 'on-this-day.json');

const today = new Date();
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const day = today.getDate().toString().padStart(2, '0');

async function getToday() {
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'QuizzingSocietyApp/1.0' }});
  if (res.ok) {
    const data = await res.json();
    const top10 = (data.events || [])
      .sort((a, b) => (b.pages?.length || 0) - (a.pages?.length || 0))
      .slice(0, 10)
      .map(e => ({ year: e.year, text: e.text }))
      .sort((a, b) => a.year - b.year);
      
    // Write just today's data so the UI works immediately
    let existingData = {};
    if (fs.existsSync(outputFile)) {
      try { existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8')); } catch(e){}
    }
    existingData[`${month}-${day}`] = top10;
    fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));
    console.log("Successfully wrote TODAY's data to the database.");
  } else {
    console.error("Failed to fetch today's data.");
  }
}
getToday();
