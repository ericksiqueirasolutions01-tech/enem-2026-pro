const fs = require('fs');
const data = JSON.parse(fs.readFileSync('drive_data.json', 'utf8'));

console.log('Structure of data:');
console.log('Root is array of length:', data.length);

// In Google Drive mobile data, items are usually in data[0] or data[1] or similar
function explore(node, depth = 0, path = '') {
  if (!node) return;
  if (Array.isArray(node)) {
    // Check if this looks like a file/folder tuple: [id, parents, name, mime, ...]
    if (typeof node[0] === 'string' && typeof node[2] === 'string' && Array.isArray(node[1])) {
      console.log(`${'  '.repeat(depth)}[ITEM] ID: ${node[0]} | Name: "${node[2]}" | Type: ${node[3] || 'folder/file'}`);
      return;
    }
    node.forEach((child, idx) => {
      explore(child, depth + 1, `${path}[${idx}]`);
    });
  }
}

explore(data);

