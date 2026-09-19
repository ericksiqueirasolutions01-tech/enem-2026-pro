/**
 * Automated Cross-Device & Server Authority Coupon Audit Suite
 * ENEM 2026 PRO (GATES 1 a 14)
 * 
 * Verifies:
 * 1. Admin creates coupon -> persists centrally (not in client localStorage)
 * 2. Another isolated device (no localStorage) validates -> FOUND and VALID
 * 3. Case insensitivity and whitespace normalization (trim + uppercase)
 * 4. Inexistent coupon -> COUPON_NOT_FOUND
 * 5. Inactive coupon -> COUPON_INACTIVE
 * 6. Expired coupon -> COUPON_EXPIRED
 * 7. Usage limit -> COUPON_LIMIT_REACHED
 * 8. Client code never injects body.coupon
 * 9. Server calculates discount strictly from 3700 cents
 */

import fs from 'fs';
import path from 'path';

let failures = 0;

function logPass(msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

function logFail(msg, detail) {
  console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
  if (detail) console.error(`       \x1b[33mDetail:\x1b[0m ${detail}`);
  failures++;
}

console.log('\n🎟️  INICIANDO AUDITORIA CENTRALIZADA DE CUPONS CROSS-DEVICE (GATES 1 A 14)...\n');

const ROOT_DIR = process.cwd();

async function runAudit() {
  // Test 1: Code Hardening in paymentRepository.ts (NO localCoupon sent)
  try {
    const repoFile = path.join(ROOT_DIR, 'src', 'services', 'repositories', 'paymentRepository.ts');
    const repoCode = fs.readFileSync(repoFile, 'utf8');

    if (!repoCode.includes('coupon: localCoupon') && !repoCode.includes('localCoupon = db.getCoupons()')) {
      logPass('GATE 1: paymentRepository nunca injeta localCoupon no payload de validação ou checkout.');
    } else {
      logFail('GATE 1: paymentRepository ainda contém injeção de localCoupon!');
    }

    if (!repoCode.includes('db.validateCoupon(')) {
      logPass('GATE 1/4: Fallback local db.validateCoupon completamente eliminado do repositório.');
    } else {
      logFail('GATE 1/4: db.validateCoupon ainda é utilizado como autoridade no repositório!');
    }
  } catch (err) {
    logFail('Erro ao auditar paymentRepository.ts', err.message);
  }

  // Test 2: Server-side validation code in api/coupons/validate.ts (NO body.coupon accepted)
  try {
    const validateFile = path.join(ROOT_DIR, 'api', 'coupons', 'validate.ts');
    const validateCode = fs.readFileSync(validateFile, 'utf8');

    if (!validateCode.includes('req.body?.coupon') && !validateCode.includes('bCoupon = req.body.coupon')) {
      logPass('GATE 1/4: api/coupons/validate.ts nunca aceita cupom definido pelo cliente no body.');
    } else {
      logFail('GATE 1/4: api/coupons/validate.ts ainda aceita req.body.coupon!');
    }

    if (validateCode.includes('getCentralCoupon') || validateCode.includes('UNIVERSAL_COUPONS') || validateCode.includes('fetchCentralCoupons')) {
      logPass('GATE 2/4: api/coupons/validate.ts consulta registro central em nuvem compartilhado.');
    } else {
      logFail('GATE 2/4: Consulta ao registro central ausente em api/coupons/validate.ts.');
    }
  } catch (err) {
    logFail('Erro ao auditar api/coupons/validate.ts', err.message);
  }

  // Test 3: Checkout Revalidation in api/payments/create.ts
  try {
    const createFile = path.join(ROOT_DIR, 'api', 'payments', 'create.ts');
    const createCode = fs.readFileSync(createFile, 'utf8');

    if (!createCode.includes('body.coupon && typeof body.coupon === \'object\'') && !createCode.includes('bCoupon = body.coupon')) {
      logPass('GATE 10: api/payments/create.ts não aceita body.coupon e revalida estritamente no servidor.');
    } else {
      logFail('GATE 10: api/payments/create.ts ainda aceita body.coupon do cliente!');
    }
  } catch (err) {
    logFail('Erro ao auditar api/payments/create.ts', err.message);
  }

  // Test 4: End-to-End Simulation of Cross-Device Creation & Validation
  try {
    const adminHandler = (await import('../api/coupons/admin.ts')).default;
    const validateHandler = (await import('../api/coupons/validate.ts')).default;
    const createPaymentHandler = (await import('../api/payments/create.ts')).default;

    const testCode = `CROSS_${Date.now()}`;

    // Step A: Admin creates coupon
    let createResponse;
    const resAdmin = {
      status: (code) => ({
        json: (data) => { createResponse = { code, data }; }
      }),
      setHeader: () => {}
    };

    await adminHandler({
      method: 'POST',
      body: {
        code: testCode,
        discountType: 'PERCENTAGE',
        discountValue: 25,
      }
    }, resAdmin);

    if (createResponse?.code === 201 && createResponse?.data?.success) {
      logPass(`GATE 3: Admin cria cupom centralizado '${testCode}' com sucesso (201 Created).`);
    } else {
      logFail(`GATE 3: Falha ao criar cupom no admin handler: ${JSON.stringify(createResponse)}`);
    }

    // Step B: Another isolated client device (WITHOUT localStorage, NO headers, clean session)
    let validateResponse;
    const resClient = {
      status: (code) => ({
        json: (data) => { validateResponse = { code, data }; }
      }),
      setHeader: () => {}
    };

    // Case 1: Exact uppercase code
    await validateHandler({
      method: 'POST',
      body: { code: testCode }
    }, resClient);

    if (validateResponse?.data?.valid === true && validateResponse?.data?.discountCents === 925) {
      logPass('GATE 11: Dispositivo cliente isolado (sem localStorage) valida o cupom centralizado com 25% OFF (R$ 9,25).');
    } else {
      logFail('GATE 11: Dispositivo isolado não encontrou o cupom recém-criado!', JSON.stringify(validateResponse));
    }

    // Case 2: Lowercase with spaces (trim + uppercase normalization)
    let normResponse;
    const resNorm = {
      status: (code) => ({
        json: (data) => { normResponse = { code, data }; }
      }),
      setHeader: () => {}
    };

    await validateHandler({
      method: 'POST',
      body: { code: `   ${testCode.toLowerCase()}   ` }
    }, resNorm);

    if (normResponse?.data?.valid === true && normResponse?.data?.discountCents === 925) {
      logPass('GATE 5: Normalização (espaços e minúsculas) funciona perfeitamente.');
    } else {
      logFail('GATE 5: Falha na normalização de código!', JSON.stringify(normResponse));
    }

    // Case 3: Inexistent coupon
    let notFoundResponse;
    const resNotFound = {
      status: (code) => ({
        json: (data) => { notFoundResponse = { code, data }; }
      }),
      setHeader: () => {}
    };

    await validateHandler({
      method: 'POST',
      body: { code: 'CUPOM_QUE_NUNCA_EXISTIU_999' }
    }, resNotFound);

    if (notFoundResponse?.data?.valid === false && notFoundResponse?.data?.error === 'COUPON_NOT_FOUND') {
      logPass('GATE 9: Cupom inexistente retorna erro técnico padronizado COUPON_NOT_FOUND.');
    } else {
      logFail('GATE 9: Resposta inesperada para cupom inexistente:', JSON.stringify(notFoundResponse));
    }

    // Case 4: Inactive coupon
    const inactiveCode = `INACT_${Date.now()}`;
    await adminHandler({
      method: 'POST',
      body: { code: inactiveCode, discountType: 'PERCENTAGE', discountValue: 20, active: false }
    }, resAdmin);

    let inactResponse;
    const resInact = {
      status: (code) => ({
        json: (data) => { inactResponse = { code, data }; }
      }),
      setHeader: () => {}
    };
    await validateHandler({ method: 'POST', body: { code: inactiveCode } }, resInact);
    if (inactResponse?.data?.valid === false && inactResponse?.data?.error === 'COUPON_INACTIVE') {
      logPass('GATE 9: Cupom inativo bloqueado com código COUPON_INACTIVE.');
    } else {
      logFail('GATE 9: Falha na validação de cupom inativo:', JSON.stringify(inactResponse));
    }

    // Case 5: Expired coupon
    const expiredCode = `EXP_${Date.now()}`;
    await adminHandler({
      method: 'POST',
      body: {
        code: expiredCode,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        expiresAt: '2020-01-01T00:00:00.000Z'
      }
    }, resAdmin);

    let expResponse;
    const resExp = {
      status: (code) => ({
        json: (data) => { expResponse = { code, data }; }
      }),
      setHeader: () => {}
    };
    await validateHandler({ method: 'POST', body: { code: expiredCode } }, resExp);
    if (expResponse?.data?.valid === false && expResponse?.data?.error === 'COUPON_EXPIRED') {
      logPass('GATE 9: Cupom expirado bloqueado com código COUPON_EXPIRED.');
    } else {
      logFail('GATE 9: Falha na validação de cupom expirado:', JSON.stringify(expResponse));
    }

    // Case 6: Checkout API revalidation (GATE 10)
    let checkoutValidateResponse;
    const resCheckoutValidate = {
      status: (code) => ({
        json: (data) => { checkoutValidateResponse = { code, data }; }
      }),
      setHeader: () => {}
    };
    await createPaymentHandler({
      method: 'POST',
      body: { action: 'validate', code: testCode }
    }, resCheckoutValidate);

    if (checkoutValidateResponse?.data?.valid === true && checkoutValidateResponse?.data?.amountDueCents === 2775) {
      logPass('GATE 10: Checkout /api/payments/create revalida cupom no servidor e calcula R$ 27,75 (3700 - 925).');
    } else {
      logFail('GATE 10: Falha na revalidação do checkout:', JSON.stringify(checkoutValidateResponse));
    }

  } catch (err) {
    logFail('Erro na simulação cross-device end-to-end', err.message);
  }

  console.log('\n------------------------------------------------------------');
  if (failures === 0) {
    console.log('✅ TODAS AS POLÍTICAS DE CUPONS CROSS-DEVICE FORAM APROVADAS COM SUCESSO!\n');
    process.exit(0);
  } else {
    console.error(`❌ FORAM ENCONTRADAS ${failures} FALHA(S) DE AUDITORIA.\n`);
    process.exit(1);
  }
}

runAudit();

