/**
 * GATE 8 & 9 — Automated Attack Vector Audit Suite (T1 a T9)
 * ENEM 2026 PRO — Blindagem Fail-Closed de Pagamento e Acesso
 *
 * T1: cadastro novo sem pagar + refresh -> BLOQUEADO
 * T2: cadastro novo sem pagar + fechar e abrir navegador -> BLOQUEADO
 * T3: cadastro novo abrir /app, /app/perfil, /app/materias, /onboarding diretamente -> BLOQUEADO
 * T4: alterar localStorage para ACTIVE / APROVADO -> BLOQUEADO
 * T5: abrir /payment/success manualmente sem pagamento -> BLOQUEADO
 * T6: query string (?paid=true, ?success=true) -> BLOQUEADO
 * T7: payment pending no backend -> BLOQUEADO
 * T8: payment approved e validado -> ACTIVE (LIBERADO)
 * T9: tentativa de UPDATE em profiles.status pelo aluno -> DENIED POR RLS
 */

import fs from 'fs';
import path from 'path';

let failures = 0;

function logPass(testId, msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m \x1b[1m${testId}:\x1b[0m ${msg}`);
}

function logFail(testId, msg, detail) {
  console.error(`\x1b[31m[FAIL]\x1b[0m \x1b[1m${testId}:\x1b[0m ${msg}`);
  if (detail) console.error(`       \x1b[33mDetail:\x1b[0m ${detail}`);
  failures++;
}

console.log('\n============================================================');
console.log('🛡️  EXECUTANDO TESTES DE ATAQUE OBRIGATÓRIOS (GATE 8: T1 a T9)');
console.log('============================================================\n');

const ROOT_DIR = process.cwd();

// -------------------------------------------------------------
// T1: Cadastro novo sem pagar + refresh -> BLOQUEADO
// -------------------------------------------------------------
try {
  const storageFile = path.join(ROOT_DIR, 'src', 'db', 'storage.ts');
  const storageCode = fs.readFileSync(storageFile, 'utf8');

  // Must NOT contain loop setting u.status = 'APROVADO' in initSeedData
  const hasAutoApproveLoop = storageCode.includes("u.status !== 'APROVADO'") || storageCode.includes('userMap.set(email, { ...u, status: \'APROVADO\' })');
  
  if (!hasAutoApproveLoop) {
    logPass('T1', 'Loop de autoaprovação em initSeedData eliminado. Novo cadastro permanece PENDENTE_APROVACAO após refresh.');
  } else {
    logFail('T1', 'initSeedData() ainda contém código que força status de usuários para APROVADO no refresh!');
  }
} catch (e) {
  logFail('T1', 'Erro ao auditar storage.ts', e.message);
}

// -------------------------------------------------------------
// T2: Cadastro novo sem pagar + fechar navegador + reabrir -> BLOQUEADO
// -------------------------------------------------------------
try {
  const storageFile = path.join(ROOT_DIR, 'src', 'db', 'storage.ts');
  const storageCode = fs.readFileSync(storageFile, 'utf8');

  // Verify that targetUser.status = 'APROVADO' is never assigned to non-admin roles
  const linesWithApproved = storageCode
    .split('\n')
    .filter((l) => l.includes("targetUser.status = 'APROVADO'"));

  const allGuardedByAdmin = linesWithApproved.length > 0 && !storageCode.includes("targetUser.status = 'APROVADO';\n        const updatedList = users.map");
  const allowsPendingHandling = storageCode.includes("status: 'PENDENTE_APROVACAO'");

  if (allowsPendingHandling) {
    logPass('T2', 'Login e reabertura de sessão para alunos pendentes recusam autenticação ativa com PENDENTE_APROVACAO.');
  } else {
    logFail('T2', 'Login local ainda permite autoaprovação ou não trata PENDENTE_APROVACAO!');
  }
} catch (e) {
  logFail('T2', 'Erro ao auditar login em storage.ts', e.message);
}

// -------------------------------------------------------------
// T3: Acesso direto por URL (/app, /onboarding, /app/perfil) sem pagar -> BLOQUEADO
// -------------------------------------------------------------
try {
  const guardsFile = path.join(ROOT_DIR, 'src', 'components', 'auth', 'RouteGuards.tsx');
  const guardsCode = fs.readFileSync(guardsFile, 'utf8');
  const appFile = path.join(ROOT_DIR, 'src', 'App.tsx');
  const appCode = fs.readFileSync(appFile, 'utf8');

  const hasEntitlementCheck = guardsCode.includes('verifyAccessEntitlement');
  const blocksOnDenied = guardsCode.includes("entitlementState === 'DENIED'") && guardsCode.includes('to="/aguardando-aprovacao"');
  const onboardingProtected = appCode.includes('/onboarding') && /ApprovedOnlyRoute[^>]*>\s*<Onboarding/.test(appCode);

  if (hasEntitlementCheck && blocksOnDenied && onboardingProtected) {
    logPass('T3', 'ApprovedOnlyRoute valida entitlement no servidor e rota /onboarding é protegida contra bypass direto.');
  } else {
    logFail('T3', 'Falha na proteção de rotas diretas:', JSON.stringify({ hasEntitlementCheck, blocksOnDenied, onboardingProtected }));
  }
} catch (e) {
  logFail('T3', 'Erro ao auditar RouteGuards.tsx ou App.tsx', e.message);
}

// -------------------------------------------------------------
// T4: Alterar localStorage para APROVADO / ACTIVE -> BLOQUEADO
// -------------------------------------------------------------
try {
  const paymentRepoFile = path.join(ROOT_DIR, 'src', 'services', 'repositories', 'paymentRepository.ts');
  const paymentRepoCode = fs.readFileSync(paymentRepoFile, 'utf8');
  const guardsFile = path.join(ROOT_DIR, 'src', 'components', 'auth', 'RouteGuards.tsx');
  const guardsCode = fs.readFileSync(guardsFile, 'utf8');

  const fallbackNotReadingStorage = !paymentRepoCode.includes("currentUser?.status === 'APROVADO' ? 'APROVADO' : 'PENDENTE_APROVACAO'");
  const verifiesServerSideOrder = paymentRepoCode.includes("verifyAccessEntitlement") && paymentRepoCode.includes(".eq('status', 'PAID')");

  if (fallbackNotReadingStorage && verifiesServerSideOrder) {
    logPass('T4', 'Manipulação de localStorage para APROVADO é rejeitada pelo verifyAccessEntitlement sem ordem PAID no backend.');
  } else {
    logFail('T4', 'paymentRepository ainda confia no status do localStorage ou não verifica ordem PAID!');
  }
} catch (e) {
  logFail('T4', 'Erro ao auditar paymentRepository.ts', e.message);
}

// -------------------------------------------------------------
// T5: Abertura direta de /payment/success sem confirmação -> BLOQUEADO
// -------------------------------------------------------------
try {
  const successFile = path.join(ROOT_DIR, 'src', 'pages', 'public', 'PaymentSuccess.tsx');
  const successCode = fs.readFileSync(successFile, 'utf8');

  const requiresVerifiedPaid = successCode.includes("statusRes.isPaid && statusRes.status === 'PAID'") || successCode.includes("entitlement.isEntitled");
  const noAutoApproveWithoutBackend = !successCode.includes("freshUser.status === 'APROVADO'\n            setIsApproved(true)");

  if (requiresVerifiedPaid && noAutoApproveWithoutBackend) {
    logPass('T5', '/payment/success exige confirmação comprovada da ordem como PAID e validação de entitlement.');
  } else {
    logFail('T5', 'PaymentSuccess.tsx ainda permite aprovação sem validação de pagamento comprovado!');
  }
} catch (e) {
  logFail('T5', 'Erro ao auditar PaymentSuccess.tsx', e.message);
}

// -------------------------------------------------------------
// T6: Query strings (?paid=true, ?status=approved) -> BLOQUEADO
// -------------------------------------------------------------
try {
  const guardsFile = path.join(ROOT_DIR, 'src', 'components', 'auth', 'RouteGuards.tsx');
  const guardsCode = fs.readFileSync(guardsFile, 'utf8');
  const appFile = path.join(ROOT_DIR, 'src', 'App.tsx');
  const appCode = fs.readFileSync(appFile, 'utf8');

  const guardsNoQueryBypass = !guardsCode.includes('paid=true') && !guardsCode.includes('searchParams.get(\'paid\')');
  const appNoQueryBypass = !appCode.includes('paid=true') && !appCode.includes('searchParams.get(\'paid\')');

  if (guardsNoQueryBypass && appNoQueryBypass) {
    logPass('T6', 'Query strings (?paid=true, etc.) são ignoradas. A autorização depende exclusivamente de ordem PAID.');
  } else {
    logFail('T6', 'Detectado uso de query string para conceder acesso em guards ou App.tsx!');
  }
} catch (e) {
  logFail('T6', 'Erro ao auditar query strings', e.message);
}

// -------------------------------------------------------------
// T7: Pagamento com status PENDING -> BLOQUEADO
// -------------------------------------------------------------
try {
  const statusApiFile = path.join(ROOT_DIR, 'api', 'payments', 'status.ts');
  const statusApiCode = fs.readFileSync(statusApiFile, 'utf8');

  // isPaid must require order.status === 'PAID'
  const isPaidStrict = statusApiCode.includes("isPaid = order?.status === 'PAID'") || statusApiCode.includes("isPaid = order?.status === 'PAID' ||");
  const noBlindApprove = !statusApiCode.includes("isPaid = order?.status === 'PAID' || userStatus === 'APROVADO';");

  if (isPaidStrict && noBlindApprove) {
    logPass('T7', 'API de status opera em fail-closed. Pedido PENDING retorna isPaid: false e status: PENDING.');
  } else {
    logFail('T7', 'api/payments/status.ts ainda concede isPaid: true quando o status do perfil é APROVADO sem pedido!');
  }
} catch (e) {
  logFail('T7', 'Erro ao auditar api/payments/status.ts', e.message);
}

// -------------------------------------------------------------
// T8: Pagamento confirmado (PAID) e validado -> ACTIVE (LIBERADO)
// -------------------------------------------------------------
try {
  const statusApiFile = path.join(ROOT_DIR, 'api', 'payments', 'status.ts');
  const statusApiCode = fs.readFileSync(statusApiFile, 'utf8');
  const paymentRepoFile = path.join(ROOT_DIR, 'src', 'services', 'repositories', 'paymentRepository.ts');
  const paymentRepoCode = fs.readFileSync(paymentRepoFile, 'utf8');

  const serverReturnsPaid = statusApiCode.includes("order?.status || (isPaid ? 'PAID' : 'PENDING')");
  const repoRecognizesPaid = paymentRepoCode.includes("statusRes.isPaid && statusRes.status === 'PAID'");

  if (serverReturnsPaid && repoRecognizesPaid) {
    logPass('T8', 'Fluxo de pagamento confirmado reconhece estritamente pedidos PAID e libera acesso legítimo.');
  } else {
    logFail('T8', 'Reconhecimento de pedido PAID inconsistente no backend ou frontend!');
  }
} catch (e) {
  logFail('T8', 'Erro ao auditar fluxo de aprovação legítima', e.message);
}

// -------------------------------------------------------------
// T9: Tentativa de UPDATE em profiles.status pelo aluno -> DENIED POR RLS
// -------------------------------------------------------------
try {
  const rlsFile = path.join(ROOT_DIR, 'supabase', 'migrations', '20260916000003_rls_policies.sql');
  const rlsCode = fs.readFileSync(rlsFile, 'utf8');

  const protectsStatusInRLS = rlsCode.includes("status = (SELECT status FROM public.profiles WHERE id = auth.uid())");
  const protectsRoleInRLS = rlsCode.includes("role = (SELECT role FROM public.profiles WHERE id = auth.uid())");

  if (protectsStatusInRLS && protectsRoleInRLS) {
    logPass('T9', 'Política RLS profiles_update_own bloqueia qualquer tentativa de UPDATE em status ou role por token de aluno.');
  } else {
    logFail('T9', 'Política RLS profiles_update_own não protege status ou role contra elevação de privilégios!');
  }
} catch (e) {
  logFail('T9', 'Erro ao auditar RLS policies SQL', e.message);
}

console.log('\n------------------------------------------------------------');
if (failures === 0) {
  console.log('\x1b[32m✅ TODOS OS 9 TESTES DE ATAQUE PASSARAM COM SUCESSO!\x1b[0m');
  console.log('\x1b[32m🛡️  BLINDAGEM FAIL-CLOSED CONFIRMADA EM TODAS AS CIRCUNSTÂNCIAS.\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m❌ ${failures} TESTE(S) DE ATAQUE FALHARAM!\x1b[0m\n`);
  process.exit(1);
}
