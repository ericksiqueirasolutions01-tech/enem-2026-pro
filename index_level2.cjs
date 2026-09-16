const fs = require('fs');
const vm = require('vm');

const catalog = JSON.parse(fs.readFileSync('drive_catalog.json', 'utf8'));

async function fetchFolder(folderId, folderName) {
  const url = `https://drive.google.com/drive/mobile/folders/${folderId}?usp=sharing`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
      }
    });
    const html = await res.text();
    const start = html.indexOf("window['_DRIVE_ivd'] = '");
    if (start === -1) {
      return [];
    }
    const end = html.indexOf("';", start);
    const snippet = html.slice(start, end + 2);
    const sandbox = { window: {} };
    vm.runInNewContext(snippet, sandbox);
    const jsonStr = sandbox.window['_DRIVE_ivd'];
    const data = JSON.parse(jsonStr);

    const items = [];
    function findItems(node) {
      if (!node) return;
      if (Array.isArray(node)) {
        if (typeof node[0] === 'string' && typeof node[2] === 'string' && Array.isArray(node[1])) {
          items.push({
            id: node[0],
            name: node[2].trim(),
            mimeType: node[3] || '',
            isFolder: (node[3] || '').includes('folder'),
            size: node[5] || null,
            parentId: folderId,
            parentName: folderName,
          });
          return;
        }
        node.forEach(findItems);
      }
    }
    findItems(data);
    return items;
  } catch (err) {
    return [];
  }
}

async function run() {
  const subfoldersToFetch = [];
  for (const [parentCategory, data] of Object.entries(catalog)) {
    for (const item of data.items) {
      if (item.isFolder) {
        subfoldersToFetch.push({
          category: parentCategory,
          folderId: item.id,
          folderName: item.name
        });
      }
    }
  }

  console.log(`Total subfolders to index: ${subfoldersToFetch.length}`);
  const nestedResults = {};

  // Batch process with concurrency of 5
  const concurrency = 5;
  let completed = 0;

  for (let i = 0; i < subfoldersToFetch.length; i += concurrency) {
    const batch = subfoldersToFetch.slice(i, i + concurrency);
    await Promise.all(batch.map(async (sub) => {
      const items = await fetchFolder(sub.folderId, sub.folderName);
      if (!nestedResults[sub.category]) nestedResults[sub.category] = [];
      nestedResults[sub.category].push({
        folderId: sub.folderId,
        folderName: sub.folderName,
        itemsCount: items.length,
        items: items
      });
      completed++;
    }));
    if (completed % 25 === 0 || completed === subfoldersToFetch.length) {
      console.log(`Progress: ${completed} / ${subfoldersToFetch.length} subfolders indexed`);
    }
  }

  fs.writeFileSync('drive_nested_catalog.json', JSON.stringify(nestedResults, null, 2));
  console.log('Saved drive_nested_catalog.json!');
}

run();

