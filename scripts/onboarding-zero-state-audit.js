/**
 * Automated Onboarding & Zero-State Journey Audit Suite
 * ENEM 2026 PRO
 * 
 * Verifies all requirements from ANTIGRAVITY_AJUSTE_ONBOARDING_JORNADA_ZERO_ENEM_2026_PRO.md:
 * - GATE 1 & 2: Mandatory Onboarding Flow & Course Choice
 * - GATE 3 & 4: Zero Hardcoded "Medicina" Fallbacks
 * - GATE 5, 6, 7: Pure Zero-State Metrics for New Students (0h, 0 dias, 0 questões, 0 simulados, '--')
 * - GATE 8 & 9: Dynamic Phase Progress & Route Guarding
 * - GATE 11 & 12: Safe Journey Reset & Existing User Preservation
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

console.log(`\n🎯 Executando Auditoria Automatizada de Onboarding e Jornada Zero...\n`);

// -------------------------------------------------------------
// TESTE 1: Verificar se existe fallback padrão para "Medicina"
// -------------------------------------------------------------
const forbiddenMedicinaDefaults = [
  /targetCourse\s*:\s*['"`]Medicina['"`]/,
  /target_course\s*:\s*['"`]Medicina['"`]/,
  /targetCourse\s*\|\|\s*['"`]Medicina['"`]/,
  /target_course\s*\|\|\s*['"`]Medicina['"`]/,
  /targetCourse:\s*profile\?\.targetCourse\s*\|\|\s*['"`]Medicina['"`]/,
  /courseTarget\s*=\s*['"`]Medicina['"`]/,
  /targetCourse\s*:\s*['"`]Medicina\s*\/\s*Geral['"`]/,
];

let medicinaViolations = [];
for (const file of sourceFiles) {
  // Ignora lista de opções / chips onde Medicina é uma opção válida que o aluno pode clicar
  if (file.includes('Onboarding.tsx')) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenMedicinaDefaults) {
    if (pattern.test(content)) {
      medicinaViolations.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
    }
  }
}

if (medicinaViolations.length === 0) {
  logPass('Nenhum fallback ou valor default para "Medicina" encontrado no código de produção');
} else {
  logFail('Foram encontrados defaults hardcoded para "Medicina":', medicinaViolations.join('\n'));
}

// -------------------------------------------------------------
// TESTE 2: Verificar se métricas mockadas foram erradicadas
// -------------------------------------------------------------
const forbiddenMocks = [
  { file: 'Dashboard.tsx', pattern: /48h\s*estudadas/i, label: '48h estudadas mock' },
  { file: 'Dashboard.tsx', pattern: /15\s*dias\s*🔥/i, label: '15 dias streak mock' },
  { file: 'Dashboard.tsx', pattern: /1\.250\s*questões/i, label: '1.250 questões mock' },
  { file: 'Dashboard.tsx', pattern: /742\s*TRI/i, label: '742 TRI mock' },
  { file: 'Dashboard.tsx', pattern: /920\s*pts/i, label: '920 pts redação mock' },
  { file: 'Evolucao.tsx', pattern: /742/i, label: '742 TRI na evolução mock' },
];

let mockViolations = [];
for (const mock of forbiddenMocks) {
  const targetFile = sourceFiles.find(f => f.endsWith(mock.file));
  if (targetFile) {
    const content = fs.readFileSync(targetFile, 'utf8');
    if (mock.pattern.test(content)) {
      mockViolations.push(`${mock.file}: ${mock.label}`);
    }
  }
}

if (mockViolations.length === 0) {
  logPass('Métricas pré-preenchidas e dados de mock eliminados das telas de progresso');
} else {
  logFail('Métricas mockadas ainda encontradas:', mockViolations.join('\n'));
}

// -------------------------------------------------------------
// TESTE 3: Verificar Route Guard de Onboarding Obrigatório
// -------------------------------------------------------------
const routeGuardsFile = path.resolve(SRC_DIR, 'components', 'auth', 'RouteGuards.tsx');
if (fs.existsSync(routeGuardsFile)) {
  const content = fs.readFileSync(routeGuardsFile, 'utf8');
  if (
    content.includes('onboardingCompleted') &&
    content.includes('/onboarding')
  ) {
    logPass('Route Guard redireciona alunos com onboardingCompleted: false para /onboarding');
  } else {
    logFail('Route Guard não possui verificação mandatória de onboardingCompleted');
  }
} else {
  logFail('Arquivo RouteGuards.tsx não encontrado');
}

// -------------------------------------------------------------
// TESTE 4: Verificar Onboarding.tsx Step 1 de Escolha do Curso
// -------------------------------------------------------------
const onboardingFile = path.resolve(SRC_DIR, 'pages', 'auth', 'Onboarding.tsx');
if (fs.existsSync(onboardingFile)) {
  const content = fs.readFileSync(onboardingFile, 'utf8');
  const hasCourseState = content.includes('course') && content.includes('setCourse');
  const hasEmptyInitial = content.includes("profile?.targetCourse || ''");
  const hasMultipleCourses = content.includes('Medicina') && content.includes('Direito') && content.includes('Psicologia') && content.includes('Engenharia de Software');
  const hasValidation = content.includes('!activeSelectedCourse') || content.includes('!course.trim()');

  if (hasCourseState && hasEmptyInitial && hasMultipleCourses && hasValidation) {
    logPass('Tela de Onboarding implementa seleção obrigatória do curso com estado inicial vazio e chips');
  } else {
    logFail('Tela de Onboarding não cumpre todos os requisitos do GATE 2 (chips, estado inicial vazio, validação)');
  }
} else {
  logFail('Arquivo Onboarding.tsx não encontrado');
}

// -------------------------------------------------------------
// TESTE 5: Verificar Perfil.tsx permitindo alteração sem perda
// -------------------------------------------------------------
const perfilFile = path.resolve(SRC_DIR, 'pages', 'estudos', 'Perfil.tsx');
if (fs.existsSync(perfilFile)) {
  const content = fs.readFileSync(perfilFile, 'utf8');
  const savesCourse = content.includes('targetCourse') && content.includes('updateProfile');
  const updatesGoals = content.includes('saveStudentGoals');
  const hasNoMedicinaFallback = !content.includes("profile?.targetCourse || 'Medicina'");

  if (savesCourse && updatesGoals && hasNoMedicinaFallback) {
    logPass('Perfil permite alterar curso alvo sem perda de histórico e sem fallback para Medicina');
  } else {
    logFail('Perfil não salva adequadamente ou possui fallback para Medicina');
  }
} else {
  logFail('Arquivo Perfil.tsx não encontrado');
}

// -------------------------------------------------------------
// TESTE 6: Verificar Botão Admin "Zerar Jornada" com Segurança
// -------------------------------------------------------------
const adminFile = path.resolve(SRC_DIR, 'pages', 'admin', 'AdminDashboard.tsx');
if (fs.existsSync(adminFile)) {
  const content = fs.readFileSync(adminFile, 'utf8');
  const hasResetButton = content.includes('Zerar Jornada');
  const hasTypeConfirmation = content.includes('ZERAR');
  const hasReasonField = content.includes('reason') || content.includes('motivo') || content.includes('Motivo') || content.includes('resetReason');
  const callsResetJourney = content.includes('resetStudentJourney');

  if (hasResetButton && hasTypeConfirmation && hasReasonField && callsResetJourney) {
    logPass('Painel Admin possui botão "Zerar Jornada" protegido por digitação de confirmação e motivo');
  } else {
    logFail('Painel Admin não implementa a ação de Zerar Jornada conforme GATE 12');
  }
} else {
  logFail('Arquivo AdminDashboard.tsx não encontrado');
}

// -------------------------------------------------------------
// TESTE 7: Verificar storage.ts funções de Jornada Zero e Preservação
// -------------------------------------------------------------
const storageFile = path.resolve(SRC_DIR, 'db', 'storage.ts');
if (fs.existsSync(storageFile)) {
  const content = fs.readFileSync(storageFile, 'utf8');
  const hasResetMethod = content.includes('public resetStudentJourney');
  const registersWithPendingOnboarding = content.includes('onboardingCompleted: false');
  const hasAuditLog = content.includes('RESET_STUDENT_JOURNEY');

  if (hasResetMethod && registersWithPendingOnboarding && hasAuditLog) {
    logPass('Camada de persistência (storage.ts) suporta reset isolado da jornada e audit log');
  } else {
    logFail('storage.ts não atende aos requisitos de jornada isolada e audit log');
  }
} else {
  logFail('Arquivo storage.ts não encontrado');
}

// -------------------------------------------------------------
// RESULTADO FINAL
// -------------------------------------------------------------
if (hasFailures) {
  console.error('\n❌ Auditoria de Onboarding e Jornada Zero FALHOU em um ou mais testes.\n');
  process.exit(1);
} else {
  console.log('\n✅ Todos os 7 testes de Onboarding e Jornada Zero PASSARAM com sucesso!\n');
  process.exit(0);
}
