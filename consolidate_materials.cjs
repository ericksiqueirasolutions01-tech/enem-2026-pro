const fs = require('fs');

const rootCatalog = JSON.parse(fs.readFileSync('drive_catalog.json', 'utf8'));
const nestedCatalog = JSON.parse(fs.readFileSync('drive_nested_catalog.json', 'utf8'));

const allMaterials = [];
let fileIdCounter = 1;

// 1. Files in root catalog directly under categories
for (const [category, data] of Object.entries(rootCatalog)) {
  for (const item of data.items) {
    if (!item.isFolder) {
      allMaterials.push({
        id: item.id,
        title: item.name.replace(/\.[a-zA-Z0-9]+$/, ''),
        fileName: item.name,
        category: category,
        subfolder: null,
        mimeType: item.mimeType,
        size: item.size,
        googleDriveId: item.id,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view?usp=sharing`,
        embedUrl: `https://drive.google.com/file/d/${item.id}/preview`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${item.id}`,
        type: item.name.toLowerCase().endsWith('.pdf') ? 'PDF' :
              item.name.toLowerCase().endsWith('.mp3') ? 'AUDIO' :
              item.name.toLowerCase().match(/\.(jpg|png|jpeg)$/) ? 'IMAGEM' : 'DOCUMENTO'
      });
    }
  }
}

// 2. Files in nested catalog
for (const [category, subfolders] of Object.entries(nestedCatalog)) {
  for (const sub of subfolders) {
    for (const item of sub.items) {
      if (!item.isFolder) {
        allMaterials.push({
          id: item.id,
          title: item.name.replace(/\.[a-zA-Z0-9]+$/, ''),
          fileName: item.name,
          category: category,
          subfolder: sub.folderName,
          mimeType: item.mimeType,
          size: item.size,
          googleDriveId: item.id,
          driveUrl: `https://drive.google.com/file/d/${item.id}/view?usp=sharing`,
          embedUrl: `https://drive.google.com/file/d/${item.id}/preview`,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${item.id}`,
          type: item.name.toLowerCase().endsWith('.pdf') ? 'PDF' :
                item.name.toLowerCase().endsWith('.mp3') ? 'AUDIO' :
                item.name.toLowerCase().match(/\.(jpg|png|jpeg)$/) ? 'IMAGEM' : 'DOCUMENTO'
        });
      }
    }
  }
}

// Remove duplicates by ID if any
const uniqueMaterials = [];
const seenIds = new Set();
for (const m of allMaterials) {
  if (!seenIds.has(m.id)) {
    seenIds.add(m.id);
    uniqueMaterials.push(m);
  }
}

console.log(`\n========================================`);
console.log(`TOTAL DE MATERIAIS EXTRAÍDOS DO DRIVE: ${uniqueMaterials.length}`);
console.log(`========================================`);

const byCat = {};
for (const m of uniqueMaterials) {
  byCat[m.category] = (byCat[m.category] || 0) + 1;
}

for (const [cat, count] of Object.entries(byCat)) {
  console.log(`- ${cat}: ${count} arquivos`);
}

fs.writeFileSync('all_drive_materials.json', JSON.stringify(uniqueMaterials, null, 2));
console.log('\nSalvo em all_drive_materials.json!');

