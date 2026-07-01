const fs = require('fs');

const adminHtml = fs.readFileSync('admin.html', 'utf8');
const adminCore = fs.readFileSync('js/admin-core.js', 'utf8');

const regex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const missing = new Set();

while ((match = regex.exec(adminCore)) !== null) {
  const id = match[1];
  if (!adminHtml.includes('id="' + id + '"') && !adminHtml.includes("id='" + id + "'")) {
    missing.add(id);
  }
}

console.log("Missing IDs used in getElementById:", Array.from(missing));
