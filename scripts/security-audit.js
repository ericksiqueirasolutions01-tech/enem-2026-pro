/**
 * Automated Security & Quality Regression Test Suite
 * ENEM 2026 PRO
 * 
 * Verifies non-negotiable security constraints:
 * 1. Zero plaintext credentials in frontend source code
 * 2. Zero universal bypass logic (123456, admin)
 * 3. Zero auto-approval / simulated approval test buttons
 * 4. Zero client-side role switcher buttons
 * 5. All target="_blank" links must have rel="noopener noreferrer"
 * 6. No service-role key or private secrets in frontend bundles
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(process.cwd(), 'src');
let hasFailures = false;

function logPass(msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

function logFail(msg, detail) {
  console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
  if (detail) console.error(`       ${detail}`);
  hasFailures = true;
}

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const sourceFiles = getAllFiles(SRC_DIR);

console.log(`\n🔍 Executando Auditoria Automatizada de Segurança em ${sourceFiles.length} arquivos...\n`);

// 1. Verificar senhas em texto puro nos seeds / storage
const forbiddenCredentials = [
  /password:\s*['"`][^'"`]+['"`]/i,
  /pass\s*===\s*['"`]123456['"`]/i,
  /pass\s*===\s*['"`]admin['"`]/i,
  /ADMIN_INITIAL_PASSWORD\s*=\s*['"`][^'"`]+['"`]/i,
];

let credViolations = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenCredentials) {
    if (pattern.test(content)) {
      credViolations.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
    }
  }
}

if (credViolations.length === 0) {
  logPass('Nenhuma credencial ou bypass universal encontrado no código fonte do frontend.');
} else {
  logFail('Credenciais ou bypasses detectados no frontend:', credViolations.join('\n'));
}

// 2. Verificar botões de autoaprovação e role-switcher
const forbiddenButtons = [
  /handleSimulateApproval/i,
  /handleSwitchToAdmin/i,
  /handleSwitchToAluno/i,
  /Aprovar Imediatamente/i,
  /Alternar para Admin/i,
];

let buttonViolations = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenButtons) {
    if (pattern.test(content)) {
      buttonViolations.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
    }
  }
}

if (buttonViolations.length === 0) {
  logPass('Nenhum botão de autoaprovação, simulação de aprovação ou role switcher encontrado.');
} else {
  logFail('Botões ou rotinas de bypass de controle de acesso encontrados:', buttonViolations.join('\n'));
}

// 3. Verificar rel="noopener noreferrer" em todos os target="_blank"
let linkViolations = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('target="_blank"') || line.includes("target='_blank'")) {
      // Verifica na mesma linha ou no bloco próximo
      const nearbyBlock = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join(' ');
      if (!nearbyBlock.includes('rel="noopener noreferrer"') && !nearbyBlock.includes("rel='noopener noreferrer'")) {
        linkViolations.push(`${path.relative(process.cwd(), file)}:${index + 1}`);
      }
    }
  });
}

if (linkViolations.length === 0) {
  logPass('Todos os links target="_blank" possuem rel="noopener noreferrer" estrito.');
} else {
  logFail('Links target="_blank" sem rel="noopener noreferrer" detectados:', linkViolations.join('\n'));
}

// 4. Verificar ausência de service_role secret em arquivos client-side
let secretViolations = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('service_role')) {
    // Permitir se for comentário explicativo informando proibição
    if (!content.includes('PROIBIDO no frontend') && !content.includes('APENAS no servidor')) {
      secretViolations.push(path.relative(process.cwd(), file));
    }
  }
}

if (secretViolations.length === 0) {
  logPass('Nenhuma chave de serviço (service_role) vazada no frontend.');
} else {
  logFail('Possível vazamento de service_role no código client:', secretViolations.join('\n'));
}

console.log('\n------------------------------------------------------------');
if (hasFailures) {
  console.error('\x1b[31m❌ AUDITORIA DE SEGURANÇA FALHOU. Corrija as violações acima.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32m✅ TODAS AS POLÍTICAS DE SEGURANÇA E CONFORMIDADE FORAM APROVADAS COM SUCESSO!\x1b[0m\n');
  process.exit(0);
}
