const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../js/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'on-this-day.json');
const allData = {};

const months = [
  { m: 1, days: 31 }, { m: 2, days: 29 }, { m: 3, days: 31 },
  { m: 4, days: 30 }, { m: 5, days: 31 }, { m: 6, days: 30 },
  { m: 7, days: 31 }, { m: 8, days: 31 }, { m: 9, days: 30 },
  { m: 10, days: 31 }, { m: 11, days: 30 }, { m: 12, days: 31 }
];

async function fetchDay(month, day, retries = 3) {
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const res = await fetch(url, {
        headers: { 'User-Agent': 'QuizzingSocietyApp/1.0 (Contact: test@example.com)' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.events || [];
    } catch (e) {
      if (i === retries - 1) {
        console.error(`Failed ${month}/${day}:`, e.message);
        return [];
      }
      await new Promise(r => setTimeout(r, 1000)); // wait before retry
    }
  }
}

async function generate() {
  console.log("Starting fast history generation...");
  let totalEvents = 0;
  
  for (const month of months) {
    // We can fetch days in parallel for speed, but limit concurrency
    for (let i = 1; i <= month.days; i += 5) {
      const chunk = [];
      for (let j = 0; j < 5 && (i + j) <= month.days; j++) {
        chunk.push(i + j);
      }
      
      await Promise.all(chunk.map(async (day) => {
        const key = `${String(month.m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const events = await fetchDay(month.m, day);
        
        const top10 = events
          .sort((a, b) => (b.pages?.length || 0) - (a.pages?.length || 0))
          .slice(0, 10)
          .map(e => ({ year: e.year, text: e.text }))
          .sort((a, b) => a.year - b.year);
          
        allData[key] = top10;
        totalEvents += top10.length;
      }));
      
      console.log(`Fetched month ${month.m}, up to day ${chunk[chunk.length - 1]}`);
      await new Promise(r => setTimeout(r, 100)); // slight delay
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`\\nSuccessfully generated ${totalEvents} events! File saved at: ${outputFile}`);
}

generate();
