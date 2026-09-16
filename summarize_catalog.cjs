const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('drive_catalog.json', 'utf8'));

let totalItems = 0;
let totalFolders = 0;
let totalFiles = 0;

console.log('=== RESUMO DO CATÁLOGO DO GOOGLE DRIVE ===');
for (const [folderName, data] of Object.entries(catalog)) {
  const folders = data.items.filter(i => i.isFolder);
  const files = data.items.filter(i => !i.isFolder);
  totalItems += data.items.length;
  totalFolders += folders.length;
  totalFiles += files.length;
  console.log(`- ${folderName}: ${data.items.length} itens (${folders.length} subpastas, ${files.length} arquivos)`);
  if (files.length > 0) {
    console.log(`    Amostras de arquivos:`, files.slice(0, 3).map(f => f.name).join(' | '));
  }
}

console.log(`\nTOTAL: ${totalItems} itens (${totalFolders} subpastas, ${totalFiles} arquivos)`);

