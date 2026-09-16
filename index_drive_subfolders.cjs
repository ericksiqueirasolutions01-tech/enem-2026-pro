const fs = require('fs');
const vm = require('vm');

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
      console.log(`[!] No _DRIVE_ivd for ${folderName} (${folderId})`);
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
    console.error(`Error fetching folder ${folderName}:`, err.message);
    return [];
  }
}

async function run() {
  const rootFolders = [
    { id: "1o-PRUISC10xpcwlbxpCDE1X3UFr9gwez", name: "Atualidades" },
    { id: "1KgSrF5HuVSSz-rm13sU_pWz4F6tULv1q", name: "Artes" },
    { id: "1KTd9L2G3pUqfPoBXuzbgs46Qje8xzQNb", name: "Biologia" },
    { id: "11kGAR4iTSTLy6DKscfJobPvfppjDt8Tr", name: "Educação Física" },
    { id: "1h_on70ALYC8Bf0U_ZiIjbxJo7w04SiyG", name: "Espanhol" },
    { id: "13oJ4UqfbaKjKqh272Ox_6mQheVCPlM7d", name: "Débora Aladim - Estudar é Resistir" },
    { id: "11et5OUKUdttky9gcEccjxwihyQiHOueH", name: "Filosofia" },
    { id: "1KaCSXScGrfgkdGPbCKgUKdNBBAaBCxBj", name: "Física" },
    { id: "1KRmTvwbs7UGUuLk9neZ_XoUrGB2jOl2g", name: "Geografia" },
    { id: "1_i2Ajp_GTxdyhORL71WwcgTW9ImHECVa", name: "Guia do Estudo Perfeito - GEP" },
    { id: "1KP4BBfhMubXjou9jgPTlmIucfBJF1H8Z", name: "História" },
    { id: "1KJrNpCoPreRRj4hXluUHsSdX72EaiVoS", name: "Inglês" },
    { id: "1KxSc-VmTXVcwTE5c8KB9zRJEe96aKiKJ", name: "Língua Portuguesa" },
    { id: "1KcZaIxkSxe13poCSEyUb4yhdpC5_Ff7O", name: "Literatura" },
    { id: "1KqPM5oxEAXYf65gIxbs9LV2EWoF23HBH", name: "Matemática" },
    { id: "1e_fDA4k47c7hGXJZzlTZVPXu38oj_2M2", name: "Provas Anteriores" },
    { id: "1KOIIIx5bL5IS_MeceifyNXI5xmPHSkwb", name: "Química" },
    { id: "1I4wfyEWmeH1iNN_QHRnbuHzzkKxj2ekP", name: "Redação" },
    { id: "1KW-4sAAlMv1II4xLGPadvk6l_R0UhzkI", name: "Sociologia" },
  ];

  const results = {};
  for (const f of rootFolders) {
    console.log(`Fetching items for: ${f.name}...`);
    const items = await fetchFolder(f.id, f.name);
    console.log(`  -> Found ${items.length} items in ${f.name}`);
    results[f.name] = {
      folderId: f.id,
      items: items
    };
    // small delay to be polite
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync('drive_catalog.json', JSON.stringify(results, null, 2));
  console.log('Finished saving drive_catalog.json!');
}

run();

