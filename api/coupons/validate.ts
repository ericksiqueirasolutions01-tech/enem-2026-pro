import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 fixo e imutável

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

declare global {
  // eslint-disable-next-line no-var
  var __enem2026_server_coupons_cache: Map<string, CentralCoupon> | undefined;
}

function getServerCache(): Map<string, CentralCoupon> {
  if (!globalThis.__enem2026_server_coupons_cache) {
    const map = new Map<string, CentralCoupon>();
    Object.values(UNIVERSAL_COUPONS).forEach((c) => map.set(c.code, { ...c }));
    globalThis.__enem2026_server_coupons_cache = map;
  }
  return globalThis.__enem2026_server_coupons_cache;
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

  // 1. Supabase (banco primário se configurado)
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
      console.warn('[ValidateCoupons] Falha ao consultar Supabase:', dbErr);
    }
  }

  // 2. Cache global do servidor
  const cache = getServerCache();
  if (cache.has(cleanCode)) {
    return cache.get(cleanCode)!;
  }

  // 3. Base universal oficial da plataforma
  if (UNIVERSAL_COUPONS[cleanCode]) {
    return { ...UNIVERSAL_COUPONS[cleanCode] };
  }

  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      valid: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Método não permitido.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawCode = body?.code || body?.couponCode;
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return res.status(400).json({
        valid: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Informe o código do cupom.',
      });
    }

    const cleanCode = normalizeCouponCode(rawCode.trim().toUpperCase());
    if (!cleanCode) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Cupom não encontrado. Verifique o código digitado.',
      });
    }

    const supabase = getOptionalSupabaseAdmin();
    const coupon = await getCentralCoupon(cleanCode, supabase);

    if (!coupon) {
      console.log('[Coupons] coupon_validation_failed:', { code: cleanCode, reason: 'COUPON_NOT_FOUND' });
      return res.status(200).json({
        valid: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Cupom não encontrado. Verifique o código digitado.',
      });
    }

    // Validações de regras de negócio (GATE 9, GATE 11, GATE 19)
    if (!coupon.active) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_INACTIVE',
        message: 'Este cupom foi desativado pela coordenação.',
      });
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_NOT_STARTED',
        message: 'Este cupom ainda não é válido.',
      });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_EXPIRED',
        message: 'Este cupom está expirado.',
      });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_LIMIT_REACHED',
        message: 'Este cupom atingiu o limite máximo de utilizações.',
      });
    }

    // Validação por Usuário Autenticado (se token fornecido e Supabase ativo)
    const user = await getAuthenticatedUser(req);
    if (user && supabase) {
      try {
        const { data: redemption } = await supabase
          .from('coupon_redemptions')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (redemption) {
          console.log('[Coupons] coupon_validation_failed:', { code: cleanCode, reason: 'COUPON_ALREADY_USED', userId: user.id });
          return res.status(200).json({
            valid: false,
            error: 'COUPON_ALREADY_USED',
            message: 'Você já utilizou este cupom em sua conta.',
          });
        }
      } catch (redErr) {
        console.warn('[Coupons] Erro ao checar redemption:', redErr);
      }
    }

    // Cálculo Rigoroso Server-Side do Desconto (GATE 10)
    let discountCents = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      const pct = Math.min(100, Math.max(0, coupon.discount_value));
      discountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * pct) / 100);
    } else {
      discountCents = Math.min(FIXED_PRODUCT_PRICE_CENTS, Math.max(0, coupon.discount_value));
    }

    const amountDueCents = Math.max(0, FIXED_PRODUCT_PRICE_CENTS - discountCents);
    const isFree = amountDueCents === 0;

    console.log('[Coupons] coupon_validation_success:', {
      code: coupon.code,
      discountCents,
      amountDueCents,
      isFree,
    });

    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        active: coupon.active,
        expiresAt: coupon.expires_at,
      },
      productPriceCents: FIXED_PRODUCT_PRICE_CENTS,
      discountCents,
      amountDueCents,
      isFree,
      message: isFree
        ? 'Cupom de 100% de desconto! Acesso gratuito liberado.'
        : `Cupom aplicado! Desconto de R$ ${(discountCents / 100).toFixed(2).replace('.', ',')}`,
    });
  } catch (err: any) {
    console.error('[Coupons] Erro inesperado na validação:', err);
    return res.status(500).json({ valid: false, message: err?.message || 'Erro interno na validação do cupom.' });
  }
}
