const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('drive_mobile.html', 'utf8');

const match = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'((?:[^'\\]|\\.)*)';/);
if (!match) {
  console.log('No regex match with semicolon');
  // find start and end
  const start = html.indexOf("window['_DRIVE_ivd'] = '");
  const end = html.indexOf("';", start);
  const snippet = html.slice(start, end + 2);
  const sandbox = { window: {} };
  vm.runInNewContext(snippet, sandbox);
  const jsonStr = sandbox.window['_DRIVE_ivd'];
  console.log('Evaluated length:', jsonStr.length);
  const data = JSON.parse(jsonStr);
  fs.writeFileSync('drive_data.json', JSON.stringify(data, null, 2));
  console.log('Parsed successfully! Root length:', data.length);
} else {
  const snippet = match[0];
  const sandbox = { window: {} };
  vm.runInNewContext(snippet, sandbox);
  const jsonStr = sandbox.window['_DRIVE_ivd'];
  console.log('Evaluated length:', jsonStr.length);
  const data = JSON.parse(jsonStr);
  fs.writeFileSync('drive_data.json', JSON.stringify(data, null, 2));
  console.log('Parsed successfully! Root length:', data.length);
}

