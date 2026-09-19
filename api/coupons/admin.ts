import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const FIXED_PRODUCT_PRICE_CENTS = 3700;

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

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  const supabase = getOptionalSupabaseAdmin();

  // 1. Validar autenticação se Supabase estiver ativo
  const user = await getAuthenticatedUser(req);
  if (supabase && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'ADMINISTRADOR' || profile.status !== 'APROVADO') {
      return res.status(403).json({ success: false, message: 'Acesso restrito à coordenação.' });
    }
  }

  // 2. GET: Listar todos os cupons do banco central e registro compartilhado
  if (req.method === 'GET') {
    try {
      const map = new Map<string, CentralCoupon>();
      Object.values(UNIVERSAL_COUPONS).forEach((c) => map.set(c.code, { ...c }));
      const cache = getServerCache();
      cache.forEach((c, k) => map.set(k, { ...c }));

      if (supabase) {
        try {
          const { data, error } = await supabase
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
        } catch (dbErr) {
          console.warn('[AdminCoupons] Erro ao consultar Supabase:', dbErr);
        }
      }

      return res.status(200).json({ success: true, coupons: Array.from(map.values()) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao listar cupons.' });
    }
  }

  // 3. POST: Criar novo cupom na base central compartilhada (GATE 3)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const {
        code,
        discountType,
        discountValue,
        maxUses,
        expiresAt,
        startsAt,
        active,
      } = body;

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ success: false, message: 'O código do cupom é obrigatório.' });
      }

      const cleanCode = normalizeCouponCode(code);
      if (!cleanCode) {
        return res.status(400).json({ success: false, message: 'Código de cupom inválido após normalização.' });
      }

      const cleanType = discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE';
      const cleanValue = Math.round(Number(discountValue) || 0);

      if (cleanValue <= 0) {
        return res.status(400).json({ success: false, message: 'O valor do desconto deve ser maior que zero.' });
      }

      if (cleanType === 'PERCENTAGE' && cleanValue > 100) {
        return res.status(400).json({ success: false, message: 'O percentual de desconto não pode ser superior a 100%.' });
      }

      const nowIso = new Date().toISOString();
      const newCouponRecord: CentralCoupon = {
        id: `cpn-${cleanCode}-${Date.now()}`,
        code: cleanCode,
        discount_type: cleanType,
        discount_value: cleanValue,
        max_uses: maxUses && Number(maxUses) > 0 ? Number(maxUses) : null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : nowIso,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active: active !== false,
        used_count: 0,
        created_at: nowIso,
        updated_at: nowIso,
      };

      // 3.1 Salvar no cache do servidor
      getServerCache().set(cleanCode, newCouponRecord);

      // 3.2 Salvar no Supabase (se ativo)
      if (supabase) {
        try {
          const { data: created, error } = await supabase
            .from('coupons')
            .upsert({
              code: cleanCode,
              discount_type: cleanType,
              discount_value: cleanValue,
              max_uses: newCouponRecord.max_uses,
              starts_at: newCouponRecord.starts_at,
              expires_at: newCouponRecord.expires_at,
              active: newCouponRecord.active,
              used_count: 0,
            }, { onConflict: 'code' })
            .select('*')
            .single();

          if (created) {
            newCouponRecord.id = created.id;
          }
        } catch (dbErr) {
          console.warn('[AdminCoupons] Erro ao salvar cupom no Supabase:', dbErr);
        }
      }

      console.log('[CouponsShared] coupon_created:', {
        code: cleanCode,
        discount_type: cleanType,
        discount_value: cleanValue,
        active: newCouponRecord.active,
      });

      return res.status(201).json({ success: true, coupon: newCouponRecord });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao criar cupom.' });
    }
  }

  // 4. PATCH: Atualizar cupom (status ativo/inativo, limites)
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { id, code, active, maxUses, expiresAt } = body;
      const targetCode = normalizeCouponCode(code || id);
      if (!targetCode) {
        return res.status(400).json({ success: false, message: 'ID ou código do cupom é obrigatório.' });
      }

      const cache = getServerCache();
      const existing = cache.get(targetCode);

      const updates: any = {
        updated_at: new Date().toISOString(),
      };
      if (typeof active === 'boolean') updates.active = active;
      if (maxUses !== undefined) updates.max_uses = maxUses ? Number(maxUses) : null;
      if (expiresAt !== undefined) updates.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;

      if (existing) {
        Object.assign(existing, updates);
        cache.set(targetCode, existing);
      }

      if (supabase) {
        try {
          await supabase.from('coupons').update(updates).eq('code', targetCode);
        } catch (dbErr) {
          console.warn('[AdminCoupons] Erro ao atualizar no Supabase:', dbErr);
        }
      }

      return res.status(200).json({ success: true, coupon: existing || { code: targetCode, ...updates } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao atualizar cupom.' });
    }
  }

  // 5. DELETE: Desativar ou excluir cupom
  if (req.method === 'DELETE') {
    try {
      const couponId = req.query?.id || req.body?.id;
      const couponCode = req.query?.code || req.body?.code;
      const target = normalizeCouponCode(couponCode || couponId);
      if (!target) {
        return res.status(400).json({ success: false, message: 'ID ou código do cupom obrigatório.' });
      }

      getServerCache().delete(target);

      if (supabase) {
        try {
          await supabase.from('coupons').delete().eq('code', target);
        } catch (dbErr) {
          console.warn('[AdminCoupons] Erro ao excluir do Supabase:', dbErr);
        }
      }

      return res.status(200).json({ success: true, message: 'Cupom excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao excluir cupom.' });
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ success: false, message: 'Método não permitido.' });
}
