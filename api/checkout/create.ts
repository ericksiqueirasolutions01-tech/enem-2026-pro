import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 fixo e imutável
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

export interface CentralCoupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  max_uses?: number | null;
  used_count: number;
  starts_at?: string | null;
  expires_at?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const UNIVERSAL_COUPONS: Record<string, CentralCoupon> = {
  'ERICK20': { id: 'cpn-erick20', code: 'ERICK20', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'ERICK': { id: 'cpn-erick', code: 'ERICK', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'ENEM20': { id: 'cpn-enem20', code: 'ENEM20', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'ENEM2026': { id: 'cpn-enem2026', code: 'ENEM2026', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'PROMO10': { id: 'cpn-promo10', code: 'PROMO10', discount_type: 'PERCENTAGE', discount_value: 10, used_count: 0, active: true },
  'PROMO20': { id: 'cpn-promo20', code: 'PROMO20', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'PROMO30': { id: 'cpn-promo30', code: 'PROMO30', discount_type: 'PERCENTAGE', discount_value: 30, used_count: 0, active: true },
  'PROMO50': { id: 'cpn-promo50', code: 'PROMO50', discount_type: 'PERCENTAGE', discount_value: 50, used_count: 0, active: true },
  'BOLSA100': { id: 'cpn-bolsa100', code: 'BOLSA100', discount_type: 'PERCENTAGE', discount_value: 100, used_count: 0, active: true },
  'DESCONTO10': { id: 'cpn-desconto10', code: 'DESCONTO10', discount_type: 'PERCENTAGE', discount_value: 10, used_count: 0, active: true },
  'DESCONTO20': { id: 'cpn-desconto20', code: 'DESCONTO20', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
  'DESCONTO30': { id: 'cpn-desconto30', code: 'DESCONTO30', discount_type: 'PERCENTAGE', discount_value: 30, used_count: 0, active: true },
  'MEDICINA': { id: 'cpn-medicina', code: 'MEDICINA', discount_type: 'PERCENTAGE', discount_value: 30, used_count: 0, active: true },
  'MEDICINA2026': { id: 'cpn-medicina2026', code: 'MEDICINA2026', discount_type: 'PERCENTAGE', discount_value: 30, used_count: 0, active: true },
  'VIP2026': { id: 'cpn-vip2026', code: 'VIP2026', discount_type: 'PERCENTAGE', discount_value: 30, used_count: 0, active: true },
  'ALUNO2026': { id: 'cpn-aluno2026', code: 'ALUNO2026', discount_type: 'PERCENTAGE', discount_value: 20, used_count: 0, active: true },
};

function normalizeCouponCode(code: string): string {
  return (code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function getServerCache(): Map<string, CentralCoupon> {
  const g = globalThis as unknown as { __enem2026_server_coupons_cache?: Map<string, CentralCoupon> };
  if (!g.__enem2026_server_coupons_cache) {
    const map = new Map<string, CentralCoupon>();
    Object.values(UNIVERSAL_COUPONS).forEach((c) => map.set(c.code, { ...c }));
    g.__enem2026_server_coupons_cache = map;
  }
  return g.__enem2026_server_coupons_cache;
}

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

async function getCentralCoupon(rawCode: string, supabase?: SupabaseClient | null): Promise<CentralCoupon | null> {
  const cleanCode = normalizeCouponCode(rawCode);
  if (!cleanCode) return null;

  const client = supabase !== undefined ? supabase : getOptionalSupabaseAdmin();

  if (client) {
    try {
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          max_uses: data.max_uses,
          used_count: data.used_count || 0,
          starts_at: data.starts_at,
          expires_at: data.expires_at,
          active: data.active,
        };
      }
    } catch (dbErr) {
      console.warn('[Checkout] Falha ao consultar Supabase para cupom:', dbErr);
    }
  }

  const cache = getServerCache();
  if (cache.has(cleanCode)) {
    return cache.get(cleanCode)!;
  }

  if (UNIVERSAL_COUPONS[cleanCode]) {
    return { ...UNIVERSAL_COUPONS[cleanCode] };
  }

  return null;
}

function validateCouponRules(coupon: CentralCoupon, now = new Date()): { valid: boolean; error?: string; message?: string } {
  if (!coupon.active) {
    return {
      valid: false,
      error: 'COUPON_INACTIVE',
      message: 'Este cupom foi desativado pela coordenação.',
    };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return {
      valid: false,
      error: 'COUPON_NOT_STARTED',
      message: 'Este cupom ainda não é válido.',
    };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return {
      valid: false,
      error: 'COUPON_EXPIRED',
      message: 'Este cupom está expirado.',
    };
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return {
      valid: false,
      error: 'COUPON_LIMIT_REACHED',
      message: 'Este cupom atingiu o limite máximo de utilizações.',
    };
  }

  return { valid: true };
}

function calculateCouponDiscount(
  coupon: { discount_type: 'PERCENTAGE' | 'FIXED'; discount_value: number },
  basePriceCents = FIXED_PRODUCT_PRICE_CENTS
): { discountCents: number; amountDueCents: number; isFree: boolean } {
  let discountCents = 0;

  if (coupon.discount_type === 'PERCENTAGE') {
    const pct = Math.min(100, Math.max(0, coupon.discount_value));
    discountCents = Math.round((basePriceCents * pct) / 100);
  } else {
    discountCents = Math.min(basePriceCents, Math.max(0, coupon.discount_value));
  }

  const amountDueCents = Math.max(0, basePriceCents - discountCents);
  const isFree = amountDueCents === 0;

  return {
    discountCents,
    amountDueCents,
    isFree,
  };
}

function getAppBaseUrl(req: any): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  return host ? `${proto}://${host}` : 'https://enem2026pro.vercel.app';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' });
  }

  try {
    const supabase = getOptionalSupabaseAdmin();
    const authUser = await getAuthenticatedUser(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Obter dados do cliente
    let userId = authUser?.id || body.userId || `user-${Date.now()}`;
    let customerName = 'Aluno ENEM 2026 PRO';
    let customerEmail = authUser?.email || body.email || 'aluno@enem2026pro.com';
    let customerPhone: string | undefined = body.phone ? String(body.phone).replace(/\D/g, '') : undefined;

    // 1. Se Supabase estiver conectado e houver usuário autenticado, verificar perfil
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
        console.warn('[Checkout] Erro ao consultar perfil no Supabase:', profileErr);
      }
    } else if (body.name) {
      customerName = body.name;
    }

    // 2. Preço base oficial fixo (GATE 5 / GATE 8)
    const rawCoupon = body.couponCode || body.coupon;
    let finalAmountCents = FIXED_PRODUCT_PRICE_CENTS; // R$ 37,00 padrão
    let appliedDiscountCents = 0;
    let couponDescription = 'ENEM 2026 PRO — Acesso Completo';
    let validatedCouponRecord: any = null;

    if (rawCoupon && typeof rawCoupon === 'string' && rawCoupon.trim()) {
      const cleanCoupon = normalizeCouponCode(rawCoupon);
      const coupon = await getCentralCoupon(cleanCoupon, supabase);

      if (!coupon) {
        return res.status(400).json({
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: `O cupom '${cleanCoupon}' não existe ou é inválido.`,
        });
      }

      const ruleCheck = validateCouponRules(coupon);
      if (!ruleCheck.valid) {
        return res.status(400).json({
          success: false,
          error: ruleCheck.error,
          message: ruleCheck.message,
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
            error: 'COUPON_USER_LIMIT_REACHED',
            message: 'Você já utilizou este cupom anteriormente.',
          });
        }
      }

      // Cálculo de desconto estrito pelo servidor
      const calc = calculateCouponDiscount(coupon, FIXED_PRODUCT_PRICE_CENTS);
      appliedDiscountCents = calc.discountCents;
      finalAmountCents = calc.amountDueCents;
      couponDescription = calc.isFree
        ? `ENEM 2026 PRO (Cupom 100% Gratuito: ${cleanCoupon})`
        : `ENEM 2026 PRO (Cupom: ${cleanCoupon})`;

      if (finalAmountCents > 0 && finalAmountCents < 100) {
        finalAmountCents = 100;
        appliedDiscountCents = FIXED_PRODUCT_PRICE_CENTS - finalAmountCents;
      }
      validatedCouponRecord = coupon;
    }

    const orderNsu = `enem-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    let orderId = orderNsu;

    // 3. Se o cupom conceder 100% de desconto (R$ 0,00), ativação atômica server-side (GATE 11 / GATE 14)
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
          console.error('[Checkout] Falha ao ativar pedido com cupom 100%:', rpcErr || rpcRes);
          return res.status(400).json({
            success: false,
            message: rpcRes?.message || 'Falha ao ativar cupom gratuito.',
          });
        }

        console.log('[Checkout] order_created (FREE):', { orderNsu, userId, coupon: validatedCouponRecord.code });

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

    // Regra da InfinitePay: piso mínimo de R$ 1,00 para cobrança comercial
    if (finalAmountCents > 0 && finalAmountCents < 100) {
      finalAmountCents = 100;
      appliedDiscountCents = FIXED_PRODUCT_PRICE_CENTS - finalAmountCents;
    }

    // 4. Registrar pedido PENDENTE no Supabase (GATE 5)
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
        console.warn('[Checkout] Não foi possível persistir no Supabase, prosseguindo com InfinitePay:', dbErr);
      }
    }

    // 5. Montar payload oficial InfinitePay (CloudWalk)
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
    const appBaseUrl = getAppBaseUrl(req);
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || '';

    const infinitePayload: Record<string, unknown> = {
      handle,
      order_nsu: orderNsu,
      redirect_url: `${appBaseUrl}/payment/success?order_id=${orderId}&order_nsu=${orderNsu}`,
      webhook_url: `${appBaseUrl}/api/payments/infinitepay/webhook${webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : ''}`,
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

    // 6. Requisição server-to-server POST https://api.checkout.infinitepay.io/links (GATE 5)
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
        message: 'A resposta da InfinitePay não continha a URL de redirecionamento do checkout.',
      });
    }

    // Atualizar registro no banco com slug e checkoutUrl
    if (supabase && orderId !== orderNsu) {
      try {
        await supabase
          .from('orders')
          .update({
            checkout_url: checkoutUrl,
            provider_slug: ipData.slug || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (updateErr) {
        console.warn('[Checkout] Erro ao atualizar checkout_url no banco:', updateErr);
      }
    }

    console.log('[Checkout] checkout_link_created:', {
      orderId,
      orderNsu,
      slug: ipData.slug || null,
      finalPriceCents: finalAmountCents,
    });

    return res.status(200).json({
      success: true,
      orderId,
      orderNsu,
      checkoutUrl,
      finalPriceCents: finalAmountCents,
      appliedDiscountCents,
      status: 'PENDING',
    });
  } catch (error: any) {
    console.error('[Checkout] Erro inesperado em create:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'Erro interno ao processar pagamento.',
    });
  }
}

