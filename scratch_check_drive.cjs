const fs = require('fs');

const html = fs.readFileSync('drive_mobile.html', 'utf8');

// Find all script blocks
const scripts = [];
const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  if (match[1].length > 100) {
    scripts.push(match[1]);
  }
}

console.log('Found scripts:', scripts.length);
scripts.forEach((s, i) => {
  console.log(`Script ${i} length: ${s.length}, sample: ${s.slice(0, 150).replace(/\n/g, ' ')}`);
  if (s.includes('window._DRIVE_') || s.includes('AF_') || s.includes('drive') || s.includes('folder') || s.includes('items') || s.includes('title')) {
    // Check for interesting substrings
    console.log(`Script ${i} has keywords`);
  }
});

