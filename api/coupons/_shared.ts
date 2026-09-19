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
  created_at: string;
  updated_at: string;
}

export const UNIVERSAL_COUPONS: Record<string, CentralCoupon> = {
  'ERICK20': {
    id: 'cpn-erick20',
    code: 'ERICK20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'ERICK': {
    id: 'cpn-erick',
    code: 'ERICK',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'ENEM20': {
    id: 'cpn-enem20',
    code: 'ENEM20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'ENEM2026': {
    id: 'cpn-enem2026',
    code: 'ENEM2026',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'PROMO10': {
    id: 'cpn-promo10',
    code: 'PROMO10',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'PROMO20': {
    id: 'cpn-promo20',
    code: 'PROMO20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'PROMO30': {
    id: 'cpn-promo30',
    code: 'PROMO30',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'PROMO50': {
    id: 'cpn-promo50',
    code: 'PROMO50',
    discount_type: 'PERCENTAGE',
    discount_value: 50,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'BOLSA100': {
    id: 'cpn-bolsa100',
    code: 'BOLSA100',
    discount_type: 'PERCENTAGE',
    discount_value: 100,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'DESCONTO10': {
    id: 'cpn-desconto10',
    code: 'DESCONTO10',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'DESCONTO20': {
    id: 'cpn-desconto20',
    code: 'DESCONTO20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'DESCONTO30': {
    id: 'cpn-desconto30',
    code: 'DESCONTO30',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'MEDICINA': {
    id: 'cpn-medicina',
    code: 'MEDICINA',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'MEDICINA2026': {
    id: 'cpn-medicina2026',
    code: 'MEDICINA2026',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'VIP2026': {
    id: 'cpn-vip2026',
    code: 'VIP2026',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  'ALUNO2026': {
    id: 'cpn-aluno2026',
    code: 'ALUNO2026',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    used_count: 0,
    active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
};

/**
 * Normalização única e centralizada para todos os cupons (GATE 5).
 * Remove espaços externos, converte para maiúsculas e remove caracteres especiais inválidos.
 */
export function normalizeCouponCode(code: string): string {
  return (code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Registro de memória global no processo do servidor para persistência
 * durante o ciclo de vida da instância serverless e testes integrados.
 */
declare global {
  // eslint-disable-next-line no-var
  var __enem2026_server_coupons_cache: Map<string, CentralCoupon> | undefined;
}

function getServerCache(): Map<string, CentralCoupon> {
  if (!globalThis.__enem2026_server_coupons_cache) {
    const map = new Map<string, CentralCoupon>();
    // Inicializar com cupons universais
    Object.values(UNIVERSAL_COUPONS).forEach((c) => map.set(c.code, { ...c }));
    globalThis.__enem2026_server_coupons_cache = map;
  }
  return globalThis.__enem2026_server_coupons_cache;
}

export function getOptionalSupabaseAdmin(): SupabaseClient | null {
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

export async function getAuthenticatedUser(req: any) {
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

/**
 * Consulta um cupom centralmente (Supabase -> Cache Server -> Universais).
 */
export async function getCentralCoupon(rawCode: string, supabase?: SupabaseClient | null): Promise<CentralCoupon | null> {
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
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch (dbErr) {
      console.warn('[CouponsShared] Falha ao consultar Supabase:', dbErr);
    }
  }

  // 2. Cache central do servidor
  const cache = getServerCache();
  if (cache.has(cleanCode)) {
    return cache.get(cleanCode)!;
  }

  // 3. Cupons universais da plataforma
  if (UNIVERSAL_COUPONS[cleanCode]) {
    return { ...UNIVERSAL_COUPONS[cleanCode] };
  }

  return null;
}

/**
 * Salva um cupom centralmente (Supabase + Cache Server).
 */
export async function saveCentralCoupon(coupon: CentralCoupon, supabase?: SupabaseClient | null): Promise<boolean> {
  const cleanCode = normalizeCouponCode(coupon.code);
  const normalized: CentralCoupon = {
    ...coupon,
    code: cleanCode,
    updated_at: new Date().toISOString(),
  };

  const client = supabase !== undefined ? supabase : getOptionalSupabaseAdmin();

  // 1. Gravar no cache do servidor
  const cache = getServerCache();
  cache.set(cleanCode, normalized);

  // 2. Gravar no Supabase (se configurado)
  if (client) {
    try {
      const { error } = await client
        .from('coupons')
        .upsert({
          code: normalized.code,
          discount_type: normalized.discount_type,
          discount_value: normalized.discount_value,
          max_uses: normalized.max_uses ?? null,
          used_count: normalized.used_count || 0,
          active: normalized.active,
          starts_at: normalized.starts_at || new Date().toISOString(),
          expires_at: normalized.expires_at || null,
          updated_at: normalized.updated_at,
        }, { onConflict: 'code' });

      if (error) {
        console.warn('[CouponsShared] Erro ao persistir no Supabase:', error);
      }
    } catch (err) {
      console.warn('[CouponsShared] Exceção ao gravar no Supabase:', err);
    }
  }

  console.log('[CouponsShared] coupon_created:', {
    code: normalized.code,
    discount_type: normalized.discount_type,
    discount_value: normalized.discount_value,
    active: normalized.active,
  });

  return true;
}

/**
 * Lista todos os cupons cadastrados.
 */
export async function listCentralCoupons(supabase?: SupabaseClient | null): Promise<CentralCoupon[]> {
  const map = new Map<string, CentralCoupon>();

  // Base universal
  Object.values(UNIVERSAL_COUPONS).forEach((c) => map.set(c.code, { ...c }));

  // Cache do servidor
  const cache = getServerCache();
  cache.forEach((c, k) => map.set(k, { ...c }));

  // Banco Supabase
  const client = supabase !== undefined ? supabase : getOptionalSupabaseAdmin();
  if (client) {
    try {
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          if (row?.code) {
            map.set(normalizeCouponCode(row.code), {
              id: row.id,
              code: row.code,
              discount_type: row.discount_type,
              discount_value: row.discount_value,
              max_uses: row.max_uses,
              used_count: row.used_count || 0,
              starts_at: row.starts_at,
              expires_at: row.expires_at,
              active: row.active,
              created_at: row.created_at,
              updated_at: row.updated_at,
            });
          }
        });
      }
    } catch (err) {
      console.warn('[CouponsShared] Erro ao listar cupons do Supabase:', err);
    }
  }

  return Array.from(map.values());
}

/**
 * Remove ou desativa um cupom centralmente.
 */
export async function removeCentralCoupon(codeOrId: string, supabase?: SupabaseClient | null): Promise<boolean> {
  const clean = normalizeCouponCode(codeOrId);
  const cache = getServerCache();

  let targetCode = clean;
  if (!cache.has(clean)) {
    for (const [k, v] of cache.entries()) {
      if (v.id === codeOrId) {
        targetCode = k;
        break;
      }
    }
  }

  cache.delete(targetCode);

  const client = supabase !== undefined ? supabase : getOptionalSupabaseAdmin();
  if (client) {
    try {
      await client.from('coupons').delete().eq('code', targetCode);
    } catch (err) {
      console.warn('[CouponsShared] Erro ao deletar do Supabase:', err);
    }
  }

  return true;
}

/**
 * Validação rigorosa de regras de negócio (GATE 9).
 */
export function validateCouponRules(coupon: CentralCoupon, now = new Date()): { valid: boolean; error?: string; message?: string } {
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

/**
 * Cálculo rigoroso server-side do desconto e valor devido (GATE 10).
 */
export function calculateCouponDiscount(
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

