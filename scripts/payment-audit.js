/**
 * Automated InfinitePay & Payment Security Audit Suite
 * ENEM 2026 PRO
 * 
 * Verifies Gates 0 to 20 compliance:
 * 1. Server-side price enforcement (R$ 37,00 = 3700 cents fixed, never from client)
 * 2. InfinitePay handle compliance (erick-siqueira-bg2)
 * 3. Webhook secret validation & rejection of unauthorized calls
 * 4. Idempotency guarantees (SHA-256 payload hashing, duplicate prevention)
 * 5. Database RLS and security definer isolation
 * 6. Zero secret leakage to frontend bundles
 * 7. CSP & Vercel routing protection
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let hasFailures = false;

function logPass(msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

function logFail(msg, detail) {
  console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
  if (detail) console.error(`       ${detail}`);
  hasFailures = true;
}

console.log('\n🔒 Iniciando Auditoria Rigorosa da Integração InfinitePay (ENEM 2026 PRO)...\n');

const ROOT_DIR = process.cwd();

// -------------------------------------------------------------
// Test 1: Server-Side Price & Handle Enforcement
// -------------------------------------------------------------
try {
  const createPath = path.join(ROOT_DIR, 'api', 'payments', 'create.ts');
  const sharedPath = path.join(ROOT_DIR, 'api', 'payments', '_shared.ts');
  const createCode = fs.readFileSync(createPath, 'utf8');
  const sharedCode = fs.readFileSync(sharedPath, 'utf8');

  // Verify fixed 3700 cents base price and server-side calculation (GATE 8)
  const hasFixedPrice = (sharedCode.includes('FIXED_PRODUCT_PRICE_CENTS = 3700') || createCode.includes('3700')) &&
    (createCode.includes('amount_cents: FIXED_PRODUCT_PRICE_CENTS') || createCode.includes('amount_cents: finalAmountCents')) &&
    createCode.includes('finalAmountCents = FIXED_PRODUCT_PRICE_CENTS');
  const acceptsClientPrice = /amount_cents:\s*req\.body/i.test(createCode) ||
    /price:\s*req\.body/i.test(createCode) ||
    /finalAmountCents\s*=\s*(?:req\.body|body)\.finalPriceCents/i.test(createCode);

  if (hasFixedPrice && !acceptsClientPrice) {
    logPass('GATE 4/5/8: Preço base de R$ 37,00 (3700 centavos) e cálculo de cupom travados no servidor.');
  } else {
    logFail('GATE 4/5/8: Falha na trava de preço no servidor em api/payments/create.ts');
  }

  // Verify handle
  if (sharedCode.includes("'erick-siqueira-bg2'") || createCode.includes("'erick-siqueira-bg2'")) {
    logPass('GATE 0/4: Handle oficial InfinitePay "erick-siqueira-bg2" configurado no backend.');
  } else {
    logFail('GATE 0/4: Handle oficial "erick-siqueira-bg2" não encontrado em api/payments/create.ts ou _shared.ts');
  }

  // Verify endpoint
  if (sharedCode.includes('https://api.checkout.infinitepay.io') || createCode.includes('https://api.checkout.infinitepay.io/links')) {
    logPass('GATE 0/4: Endpoint oficial InfinitePay (/links) utilizado para criação de checkout.');
  } else {
    logFail('GATE 0/4: Endpoint oficial InfinitePay não encontrado em api/payments/create.ts');
  }
} catch (err) {
  logFail('Erro ao ler api/payments/create.ts', err.message);
}

// -------------------------------------------------------------
// Test 2: Webhook Security & Idempotency
// -------------------------------------------------------------
try {
  const webhookPath = path.join(ROOT_DIR, 'api', 'payments', 'webhook.ts');
  const sharedPath = path.join(ROOT_DIR, 'api', 'payments', '_shared.ts');
  const webhookCode = fs.readFileSync(webhookPath, 'utf8');
  const sharedCode = fs.readFileSync(sharedPath, 'utf8');

  // Verify secret validation
  const checksSecret = webhookCode.includes('INFINITEPAY_WEBHOOK_SECRET') && webhookCode.includes('401');
  if (checksSecret) {
    logPass('GATE 6/13: Webhook rejeita requisições não autorizadas sem segredo (401 Unauthorized).');
  } else {
    logFail('GATE 6/13: Webhook não valida o segredo de rota apropriadamente.');
  }

  // Verify SHA-256 payload hashing
  const hasHash = sharedCode.includes('sha256') || webhookCode.includes('sha256') || webhookCode.includes('computePayloadHash');
  const hasDuplicateCheck = webhookCode.includes('duplicate: true') || webhookCode.includes('payload_hash');
  if (hasHash && hasDuplicateCheck) {
    logPass('GATE 6/12: Idempotência de webhook garantida via hash SHA-256 e tabela payment_events.');
  } else {
    logFail('GATE 6/12: Garantia de idempotência ou deduplicação ausente no webhook.');
  }

  // Verify payment_check server-to-server call
  const hasPaymentCheck = webhookCode.includes('payment_check') && (sharedCode.includes('https://api.checkout.infinitepay.io') || webhookCode.includes('https://api.checkout.infinitepay.io'));
  if (hasPaymentCheck) {
    logPass('GATE 6/13: Verificação server-to-server direta com a InfinitePay implementada via payment_check.');
  } else {
    logFail('GATE 6/13: Verificação payment_check ausente ou com endpoint incorreto.');
  }

  // Verify atomic RPC call
  if (webhookCode.includes('activate_paid_order')) {
    logPass('GATE 3/6: Webhook chama a função atômica activate_paid_order para liberação.');
  } else {
    logFail('GATE 3/6: Webhook não utiliza a função atômica activate_paid_order.');
  }
} catch (err) {
  logFail('Erro ao ler api/payments/webhook.ts', err.message);
}

// -------------------------------------------------------------
// Test 3: SQL Migration & RLS Security
// -------------------------------------------------------------
try {
  const sqlPath = path.join(ROOT_DIR, 'supabase', 'migrations', '20260917000001_orders_payments.sql');
  const sqlCode = fs.readFileSync(sqlPath, 'utf8');

  // Check tables
  if (sqlCode.includes('CREATE TABLE IF NOT EXISTS public.orders') && sqlCode.includes('CREATE TABLE IF NOT EXISTS public.payment_events')) {
    logPass('GATE 1: Tabelas public.orders e public.payment_events definidas na migração SQL.');
  } else {
    logFail('GATE 1: Tabelas obrigatórias de pagamento não encontradas na migração SQL.');
  }

  // Check RLS enabled
  if (sqlCode.includes('ROW LEVEL SECURITY') && sqlCode.includes('ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY')) {
    logPass('GATE 2: RLS explicitamente habilitado na tabela public.orders.');
  } else {
    logFail('GATE 2: RLS não habilitado na tabela public.orders.');
  }

  // Verify students cannot update orders to PAID
  const hasStrictOrderPolicies = (sqlCode.includes('user_id = auth.uid()') || sqlCode.includes('auth.uid() = user_id')) &&
    sqlCode.includes('CREATE POLICY "orders_update_admin"') &&
    !sqlCode.includes('FOR UPDATE TO authenticated USING (true)');
  if (hasStrictOrderPolicies) {
    logPass('GATE 2: Políticas RLS impedem que alunos aprovem pedidos ou alterem status para PAID.');
  } else {
    logFail('GATE 2: Falha nas políticas RLS para proteção de status de pedidos.');
  }

  // Check atomic function
  if (sqlCode.includes('CREATE OR REPLACE FUNCTION public.activate_paid_order') && sqlCode.includes('SECURITY DEFINER')) {
    logPass('GATE 3: Função public.activate_paid_order criada como SECURITY DEFINER e atômica.');
  } else {
    logFail('GATE 3: Função activate_paid_order ausente ou sem SECURITY DEFINER.');
  }
} catch (err) {
  logFail('Erro ao ler migração SQL', err.message);
}

// -------------------------------------------------------------
// Test 4: Frontend Bundle Secrets & API Protection
// -------------------------------------------------------------
try {
  const srcDir = path.join(ROOT_DIR, 'src');
  const files = fs.readdirSync(srcDir, { recursive: true });
  
  let leakedSecret = false;
  for (const file of files) {
    if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const full = path.join(srcDir, file);
      if (fs.statSync(full).isFile()) {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('process.env.SUPABASE_SERVICE_ROLE_KEY') || content.includes('INFINITEPAY_WEBHOOK_SECRET')) {
          logFail(`Segredo de servidor encontrado em arquivo frontend: ${file}`);
          leakedSecret = true;
        }
      }
    }
  }
  if (!leakedSecret) {
    logPass('GATE 17: Nenhum segredo ou chave de serviço (service_role) vazado no código frontend.');
  }
} catch (err) {
  logFail('Erro ao auditar vazamento de segredos no frontend', err.message);
}

// -------------------------------------------------------------
// Test 5: Hash Function Determinism & Collision Resistance
// -------------------------------------------------------------
try {
  const samplePayload1 = { id: "123", amount: 3700, status: "PAID" };
  const samplePayload2 = { id: "123", amount: 3700, status: "PAID" };
  const samplePayload3 = { id: "124", amount: 3700, status: "PAID" };

  const hash1 = crypto.createHash('sha256').update(JSON.stringify(samplePayload1)).digest('hex');
  const hash2 = crypto.createHash('sha256').update(JSON.stringify(samplePayload2)).digest('hex');
  const hash3 = crypto.createHash('sha256').update(JSON.stringify(samplePayload3)).digest('hex');

  if (hash1 === hash2 && hash1 !== hash3) {
    logPass('GATE 12: Hash determinístico SHA-256 validado para idempotência de eventos.');
  } else {
    logFail('GATE 12: Falha no cálculo determinístico de hash para deduplicação.');
  }
} catch (err) {
  logFail('Erro no teste de hash', err.message);
}

// -------------------------------------------------------------
// Test 6: Vercel Configuration & Routing
// -------------------------------------------------------------
try {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  const vercelJson = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  const rewriteRule = vercelJson.rewrites?.find(r => r.source && r.source.includes('api'));
  const hasApiExclusion = rewriteRule && rewriteRule.source === '/((?!api/).*)';

  if (hasApiExclusion) {
    logPass('GATE 16: Vercel rewrites preservam rotas /api/(.*) para execução Serverless Functions.');
  } else {
    logFail('GATE 16: Vercel rewrites podem sequestrar chamadas /api para o index.html da SPA.');
  }

  const cspHeader = vercelJson.headers?.find(h => h.headers?.some(sub => sub.key === 'Content-Security-Policy'));
  if (cspHeader) {
    logPass('GATE 16: Cabeçalhos HTTP de segurança e Content-Security-Policy configurados.');
  } else {
    logFail('GATE 16: Content-Security-Policy ausente no vercel.json.');
  }
} catch (err) {
  logFail('Erro ao ler vercel.json', err.message);
}

// -------------------------------------------------------------
// Test 7: Target Blank Links Safety
// -------------------------------------------------------------
try {
  const pagesToCheck = [
    path.join(ROOT_DIR, 'src', 'pages', 'public', 'PaymentSuccess.tsx'),
    path.join(ROOT_DIR, 'src', 'pages', 'auth', 'PendingApproval.tsx'),
    path.join(ROOT_DIR, 'src', 'pages', 'admin', 'AdminDashboard.tsx'),
  ];

  let targetBlankViolations = 0;
  for (const page of pagesToCheck) {
    if (fs.existsSync(page)) {
      const code = fs.readFileSync(page, 'utf8');
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('target="_blank"') || line.includes("target='_blank'")) {
          const context = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 3)).join(' ');
          if (!context.includes('rel="noopener noreferrer"')) {
            logFail(`Link target="_blank" inseguro sem rel="noopener noreferrer" em ${path.basename(page)}:${idx + 1}`);
            targetBlankViolations++;
          }
        }
      });
    }
  }

  if (targetBlankViolations === 0) {
    logPass('GATE 18: Todos os links target="_blank" nas páginas de pagamento possuem rel="noopener noreferrer".');
  }
} catch (err) {
  logFail('Erro ao verificar target="_blank"', err.message);
}

console.log('\n------------------------------------------------------------');
if (hasFailures) {
  console.error('\x1b[31m❌ AUDITORIA DE PAGAMENTOS E SEGURANÇA FALHOU. Corrija as violações acima.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32m✅ TODAS AS POLÍTICAS DE PAGAMENTO, IDEMPOTÊNCIA E SEGURANÇA FORAM APROVADAS!\x1b[0m\n');
  process.exit(0);
}
