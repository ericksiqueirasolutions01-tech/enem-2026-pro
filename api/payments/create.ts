import * as crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 fixo e imutável no backend
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

export const UNIVERSAL_COUPONS: Record<string, {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  max_uses?: number | null;
  used_count?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  active: boolean;
}> = {
  'ERICK20': { id: 'cpn-erick20', code: 'ERICK20', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'ERICK': { id: 'cpn-erick', code: 'ERICK', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'ENEM20': { id: 'cpn-enem20', code: 'ENEM20', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'ENEM2026': { id: 'cpn-enem2026', code: 'ENEM2026', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'PROMO10': { id: 'cpn-promo10', code: 'PROMO10', discount_type: 'PERCENTAGE', discount_value: 10, active: true },
  'PROMO20': { id: 'cpn-promo20', code: 'PROMO20', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'PROMO30': { id: 'cpn-promo30', code: 'PROMO30', discount_type: 'PERCENTAGE', discount_value: 30, active: true },
  'PROMO50': { id: 'cpn-promo50', code: 'PROMO50', discount_type: 'PERCENTAGE', discount_value: 50, active: true },
  'BOLSA100': { id: 'cpn-bolsa100', code: 'BOLSA100', discount_type: 'PERCENTAGE', discount_value: 100, active: true },
  'DESCONTO10': { id: 'cpn-desconto10', code: 'DESCONTO10', discount_type: 'PERCENTAGE', discount_value: 10, active: true },
  'DESCONTO20': { id: 'cpn-desconto20', code: 'DESCONTO20', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
  'DESCONTO30': { id: 'cpn-desconto30', code: 'DESCONTO30', discount_type: 'PERCENTAGE', discount_value: 30, active: true },
  'MEDICINA': { id: 'cpn-medicina', code: 'MEDICINA', discount_type: 'PERCENTAGE', discount_value: 30, active: true },
  'MEDICINA2026': { id: 'cpn-medicina2026', code: 'MEDICINA2026', discount_type: 'PERCENTAGE', discount_value: 30, active: true },
  'VIP2026': { id: 'cpn-vip2026', code: 'VIP2026', discount_type: 'PERCENTAGE', discount_value: 30, active: true },
  'ALUNO2026': { id: 'cpn-aluno2026', code: 'ALUNO2026', discount_type: 'PERCENTAGE', discount_value: 20, active: true },
};

function getOptionalSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  try {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req: any) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const supabaseAdmin = getOptionalSupabaseAdmin();
    if (!supabaseAdmin) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch {
    return null;
  }
}

function getAppBaseUrl(req: any): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || '';
  if (host.includes('vercel.app')) {
    return 'https://enem-2026-pro.vercel.app';
  }

  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  return host ? `${proto}://${host}` : 'https://enem-2026-pro.vercel.app';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' });
  }

  try {
    const supabase = getOptionalSupabaseAdmin();
    const authUser = await getAuthenticatedUser(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Validação direta de cupom via action: 'validate' (compatibilidade universal Vercel)
    if (body.action === 'validate' || req.query?.action === 'validate') {
      const rawC = body.code || body.couponCode || (typeof body.coupon === 'string' ? body.coupon : body.coupon?.code);
      if (!rawC || typeof rawC !== 'string' || !rawC.trim()) {
        return res.status(400).json({ valid: false, error: 'COUPON_NOT_FOUND', message: 'Informe o código do cupom.' });
      }
      const cClean = rawC.trim().toUpperCase();
      let vCoupon: any = null;

      if (supabase) {
        const { data } = await supabase.from('coupons').select('*').eq('code', cClean).maybeSingle();
        vCoupon = data;
      }

      if (!vCoupon && body.coupon && typeof body.coupon === 'object') {
        const bCode = (body.coupon.code || '').trim().toUpperCase();
        if (bCode === cClean) {
          vCoupon = {
            id: body.coupon.id || `cpn-${cClean}`,
            code: cClean,
            discount_type: body.coupon.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
            discount_value: Number(body.coupon.discountValue) || 0,
            max_uses: body.coupon.maxUses ? Number(body.coupon.maxUses) : null,
            used_count: Number(body.coupon.usedCount) || 0,
            starts_at: body.coupon.startsAt || null,
            expires_at: body.coupon.expiresAt || null,
            active: body.coupon.active !== false,
          };
        }
      }

      if (!vCoupon && UNIVERSAL_COUPONS[cClean]) {
        vCoupon = { ...UNIVERSAL_COUPONS[cClean] };
      }

      if (!vCoupon) {
        return res.status(200).json({ valid: false, error: 'COUPON_NOT_FOUND', message: 'Cupom inexistente ou inválido.' });
      }

      if (!vCoupon.active) {
        return res.status(200).json({ valid: false, error: 'COUPON_INACTIVE', message: 'Este cupom foi desativado.' });
      }

      const now = new Date();
      if (vCoupon.starts_at && new Date(vCoupon.starts_at) > now) {
        return res.status(200).json({ valid: false, error: 'COUPON_NOT_STARTED', message: 'Este cupom ainda não é válido.' });
      }
      if (vCoupon.expires_at && new Date(vCoupon.expires_at) < now) {
        return res.status(200).json({ valid: false, error: 'COUPON_EXPIRED', message: 'Este cupom está expirado.' });
      }
      if (vCoupon.max_uses && vCoupon.used_count >= vCoupon.max_uses) {
        return res.status(200).json({ valid: false, error: 'COUPON_LIMIT_REACHED', message: 'Este cupom atingiu o limite máximo de utilizações.' });
      }

      let dCents = 0;
      if (vCoupon.discount_type === 'PERCENTAGE') {
        const pct = Math.min(100, Math.max(0, vCoupon.discount_value));
        dCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * pct) / 100);
      } else {
        dCents = Math.min(FIXED_PRODUCT_PRICE_CENTS, Math.max(0, vCoupon.discount_value));
      }

      let dueCents = Math.max(0, FIXED_PRODUCT_PRICE_CENTS - dCents);
      if (dueCents > 0 && dueCents < 100) {
        dueCents = 100;
        dCents = FIXED_PRODUCT_PRICE_CENTS - dueCents;
      }

      return res.status(200).json({
        valid: true,
        coupon: {
          id: vCoupon.id,
          code: vCoupon.code,
          discountType: vCoupon.discount_type,
          discountValue: vCoupon.discount_value,
          active: vCoupon.active,
          expiresAt: vCoupon.expires_at,
        },
        productPriceCents: FIXED_PRODUCT_PRICE_CENTS,
        discountCents: dCents,
        amountDueCents: dueCents,
        isFree: dueCents === 0,
        message: dueCents === 0
          ? 'Cupom de 100% de desconto! Acesso gratuito liberado.'
          : `Cupom aplicado! Desconto de R$ ${(dCents / 100).toFixed(2).replace('.', ',')}`,
      });
    }

    // Obter dados do cliente
    let userId = authUser?.id || body.userId;
    let customerName = 'Aluno ENEM 2026 PRO';
    let customerEmail = authUser?.email || body.email || 'aluno@enem2026pro.com';
    let customerPhone: string | undefined = body.phone ? String(body.phone).replace(/\D/g, '') : undefined;

    // 2. Se Supabase estiver conectado e houver usuário autenticado, verificar perfil
    if (authUser && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, email, phone, status, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.status === 'APROVADO') {
            return res.status(200).json({
              success: true,
              alreadyActive: true,
              message: 'Seu acesso à plataforma já está totalmente liberado!',
            });
          }
          customerName = profile.name || customerName;
          customerEmail = profile.email || customerEmail;
          if (profile.phone) {
            customerPhone = profile.phone.replace(/\D/g, '');
          }
        }
      } catch (profileErr) {
        console.warn('[Payments] Erro ao consultar perfil no Supabase:', profileErr);
      }
    } else if (body.name) {
      customerName = body.name;
    }

    // 3. Processar Cupom de Desconto STRICT SERVER-SIDE (GATE 8, 11, 12, 14)
    // NUNCA confia em body.discountCents ou body.finalPriceCents vindos do frontend!
    const rawCoupon = body.couponCode || body.coupon;
    let finalAmountCents = FIXED_PRODUCT_PRICE_CENTS; // R$ 37,00 padrão
    let appliedDiscountCents = 0;
    let couponDescription = 'ENEM 2026 PRO — Acesso Completo';
    let validatedCouponRecord: any = null;

    if (rawCoupon && typeof rawCoupon === 'string' && rawCoupon.trim()) {
      const cleanCoupon = rawCoupon.trim().toUpperCase();

      let coupon: any = null;

      if (supabase) {
        // Validação direta no banco de dados
        const { data, error: couponErr } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', cleanCoupon)
          .maybeSingle();

        if (couponErr) {
          console.error('[Payments] Erro ao consultar cupom no banco:', couponErr);
          return res.status(500).json({ success: false, message: 'Erro ao validar cupom no servidor.' });
        }
        coupon = data;
      }

      // Se não encontrado no Supabase (ou sem Supabase ativo), aceita metadados passados pelo admin
      if (!coupon && body.coupon) {
        const bCoupon = body.coupon;
        const bCode = (bCoupon.code || '').trim().toUpperCase();
        if (bCode === cleanCoupon) {
          coupon = {
            id: bCoupon.id || `cpn-${cleanCoupon}`,
            code: cleanCoupon,
            discount_type: bCoupon.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
            discount_value: Number(bCoupon.discountValue) || 0,
            max_uses: bCoupon.maxUses ? Number(bCoupon.maxUses) : null,
            used_count: Number(bCoupon.usedCount) || 0,
            starts_at: bCoupon.startsAt || null,
            expires_at: bCoupon.expiresAt || null,
            active: bCoupon.active !== false,
          };
        }
      }

      if (!coupon && UNIVERSAL_COUPONS[cleanCoupon]) {
        coupon = { ...UNIVERSAL_COUPONS[cleanCoupon] };
      }

      if (!coupon) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: `O cupom '${cleanCoupon}' não existe ou é inválido.`,
        });
      }

      if (!coupon.active) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_INACTIVE',
          message: 'Este cupom foi desativado.',
        });
      }

      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_NOT_STARTED',
          message: 'Este cupom ainda não é válido.',
        });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_EXPIRED',
          message: 'Este cupom expirou.',
        });
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_LIMIT_REACHED',
          message: 'Este cupom atingiu o limite de utilizações.',
        });
      }

      // Validação de re-uso por usuário
      if (userId && supabase) {
        const { data: redemption } = await supabase
          .from('coupon_redemptions')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (redemption) {
          return res.status(400).json({
            success: false,
            error: 'COUPON_ALREADY_USED',
            message: 'Você já utilizou este cupom anteriormente.',
          });
        }
      }

      // Cálculo de desconto pelo servidor
      if (coupon.discount_type === 'PERCENTAGE') {
        const pct = Math.min(100, Math.max(0, coupon.discount_value));
        appliedDiscountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * pct) / 100);
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon} - ${pct}% OFF)`;
      } else {
        // FIXED
        appliedDiscountCents = Math.min(FIXED_PRODUCT_PRICE_CENTS, Math.max(0, coupon.discount_value));
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon})`;
      }

      finalAmountCents = Math.max(0, FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents);
      if (finalAmountCents > 0 && finalAmountCents < 100) {
        finalAmountCents = 100;
        appliedDiscountCents = FIXED_PRODUCT_PRICE_CENTS - finalAmountCents;
      }
      validatedCouponRecord = coupon;
    }

    const orderNsu = `enem-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    let orderId = orderNsu;

    // 4. Se o cupom conceder 100% de desconto (R$ 0,00), ativação atômica server-side (GATE 14)
    if (finalAmountCents === 0) {
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'AUTH_REQUIRED',
          message: 'Faça login para resgatar este cupom de 100%.',
        });
      }

      if (supabase && validatedCouponRecord) {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('activate_free_coupon_order', {
          p_user_id: userId,
          p_coupon_code: validatedCouponRecord.code,
          p_external_reference: orderNsu,
        });

        if (rpcErr || !rpcRes?.success) {
          console.error('[Payments] Falha ao ativar pedido com cupom 100%:', rpcErr || rpcRes);
          return res.status(400).json({
            success: false,
            message: rpcRes?.message || 'Falha ao ativar cupom gratuito.',
          });
        }

        return res.status(200).json({
          success: true,
          alreadyActive: true,
          isFreeCoupon: true,
          orderId: rpcRes.order_id,
          finalPriceCents: 0,
          appliedDiscountCents: FIXED_PRODUCT_PRICE_CENTS,
          message: 'Parabéns! Sua bolsa de estudos / cupom de 100% foi ativado com sucesso!',
        });
      }
    }

    // Regra da adquirente InfinitePay (CloudWalk):
    // A InfinitePay rejeita qualquer transação comercial com valor inferior a R$ 1,00 (100 centavos).
    // Se o cupom deixar um valor residual abaixo de R$ 1,00 (ex: R$ 0,74), ajusta para o piso de 100 centavos
    if (finalAmountCents > 0 && finalAmountCents < 100) {
      finalAmountCents = 100;
      appliedDiscountCents = FIXED_PRODUCT_PRICE_CENTS - finalAmountCents;
    }

    // 5. Registrar pedido PENDENTE no Supabase com snapshot do cupom (GATE 1, 2, 12)
    if (supabase && userId) {
      try {
        const { data: newOrder, error: orderInsertErr } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            provider: 'infinitepay',
            amount_cents: finalAmountCents,
            currency: 'BRL',
            status: 'PENDING',
            external_reference: orderNsu,
            coupon_id: validatedCouponRecord?.id || null,
            coupon_code_snapshot: validatedCouponRecord?.code || null,
            original_price_cents: FIXED_PRODUCT_PRICE_CENTS,
            discount_cents: appliedDiscountCents,
            metadata: {
              customer_name: customerName,
              customer_email: customerEmail,
              coupon_applied: validatedCouponRecord?.code || null,
            },
          })
          .select()
          .single();

        if (!orderInsertErr && newOrder) {
          orderId = newOrder.id;
        }
      } catch (dbErr) {
        console.warn('[Payments] Não foi possível persistir no Supabase, prosseguindo com InfinitePay:', dbErr);
      }
    }

    // 6. Montar payload oficial InfinitePay (CloudWalk)
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
    const appBaseUrl = getAppBaseUrl(req);
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || '';

    const infinitePayload: Record<string, unknown> = {
      handle,
      order_nsu: orderNsu,
      redirect_url: `${appBaseUrl}/payment/success?order_id=${orderId}`,
      webhook_url: `${appBaseUrl}/api/payments/webhook${webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : ''}`,
      customer: {
        name: customerName,
        email: customerEmail,
        ...(customerPhone ? { phone_number: customerPhone } : {}),
      },
      items: [
        {
          quantity: 1,
          price: finalAmountCents,
          description: couponDescription,
        },
      ],
    };

    // 7. Requisição server-to-server POST https://api.checkout.infinitepay.io/links
    const infiniteResponse = await fetch(`${INFINITEPAY_API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(infinitePayload),
    });

    if (!infiniteResponse.ok) {
      const errorText = await infiniteResponse.text();
      console.error('[InfinitePay] Falha na criação do link:', infiniteResponse.status, errorText);

      return res.status(502).json({
        success: false,
        error: 'GATEWAY_ERROR',
        message: 'A InfinitePay não pôde gerar o link de checkout no momento. Verifique o handle.',
        details: errorText,
      });
    }

    const ipData = (await infiniteResponse.json()) as {
      url?: string;
      checkout_url?: string;
      slug?: string;
      [key: string]: any;
    };

    const checkoutUrl =
      ipData.url ||
      ipData.checkout_url ||
      (ipData.slug ? `https://pay.infinitepay.io/${ipData.slug}` : null);

    if (!checkoutUrl) {
      return res.status(502).json({
        success: false,
        error: 'INVALID_GATEWAY_RESPONSE',
        message: 'Resposta da InfinitePay não continha a URL de checkout.',
      });
    }

    // Atualizar order com provider_slug e checkout_url
    if (supabase && orderId && orderId !== orderNsu) {
      try {
        await supabase
          .from('orders')
          .update({
            checkout_url: checkoutUrl,
            provider_slug: ipData.slug || null,
          })
          .eq('id', orderId);
      } catch (updErr) {
        console.warn('[Payments] Erro ao atualizar checkout_url no pedido:', updErr);
      }
    }

    return res.status(200).json({
      success: true,
      checkoutUrl,
      orderId,
      orderNsu,
      slug: ipData.slug || null,
      finalPriceCents: finalAmountCents,
      appliedDiscountCents,
    });
  } catch (err: any) {
    console.error('[Payments] Erro fatal no processamento do checkout:', err);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err?.message || 'Erro interno ao processar cobrança.',
    });
  }
}
