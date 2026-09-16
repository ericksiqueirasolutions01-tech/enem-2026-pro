const fs = require('fs');

const html = fs.readFileSync('drive_mobile.html', 'utf8');

const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/);
if (!match) {
  console.log('No _DRIVE_ivd found');
  process.exit(1);
}

const raw = match[1];
// raw has hex escapes like \x5b, \x22, etc.
const unescaped = raw.replace(/\\x([0-9A-Fa-f]{2})/g, (m, p) => String.fromCharCode(parseInt(p, 16)))
                     .replace(/\\u([0-9A-Fa-f]{4})/g, (m, p) => String.fromCharCode(parseInt(p, 16)))
                     .replace(/\\"/g, '"')
                     .replace(/\\\\/g, '\\');

try {
  const data = JSON.parse(unescaped);
  console.log('Successfully parsed JSON!');
  fs.writeFileSync('drive_data.json', JSON.stringify(data, null, 2));
  
  // Let's inspect the structure
  console.log('Type of data:', Array.isArray(data) ? `Array (${data.length})` : typeof data);
  if (Array.isArray(data)) {
    console.log('Data[0]:', JSON.stringify(data[0]).slice(0, 300));
  }
} catch (e) {
  console.error('Parse error:', e.message);
  fs.writeFileSync('drive_raw_unescaped.txt', unescaped);
}

