import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 fixo e imutável no backend

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawCode = body?.code || body?.couponCode || (typeof body?.coupon === 'string' ? body?.coupon : body?.coupon?.code);
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return res.status(400).json({
        valid: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Informe o código do cupom.',
      });
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const supabase = getOptionalSupabaseAdmin();

    let coupon: any = null;

    // 1. Buscar cupom no banco de dados se Supabase estiver ativo
    if (supabase) {
      const { data, error: fetchErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (fetchErr) {
        console.error('[Coupons] Erro ao consultar cupom no banco:', fetchErr);
      } else if (data) {
        coupon = data;
      }
    }

    // 1.1 Se não encontrou no Supabase (ou Supabase não está configurado), verificar metadados enviados pelo cliente/admin
    if (!coupon && req.body?.coupon) {
      const bCoupon = req.body.coupon;
      const bCode = (bCoupon.code || '').trim().toUpperCase();
      if (bCode === cleanCode) {
        coupon = {
          id: bCoupon.id || `cpn-${cleanCode}`,
          code: cleanCode,
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

    if (!coupon) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_NOT_FOUND',
        message: 'Cupom inexistente ou inválido.',
      });
    }

    // 2. Validações de Status e Regras de Negócio
    if (!coupon.active) {
      return res.status(200).json({
        valid: false,
        error: 'COUPON_INACTIVE',
        message: 'Este cupom foi desativado.',
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

    // 3. Validação por Usuário Autenticado (se token fornecido e Supabase ativo)
    const user = await getAuthenticatedUser(req);
    if (user && supabase) {
      const { data: redemption } = await supabase
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (redemption) {
        return res.status(200).json({
          valid: false,
          error: 'COUPON_ALREADY_USED',
          message: 'Você já utilizou este cupom em sua conta.',
        });
      }
    }

    // 4. Cálculo Rigoroso Server-Side do Desconto
    const basePriceCents = FIXED_PRODUCT_PRICE_CENTS; // R$ 37,00
    let discountCents = 0;

    if (coupon.discount_type === 'PERCENTAGE') {
      const pct = Math.min(100, Math.max(0, coupon.discount_value));
      discountCents = Math.round((basePriceCents * pct) / 100);
    } else {
      // FIXED (em centavos)
      discountCents = Math.min(basePriceCents, Math.max(0, coupon.discount_value));
    }

    const amountDueCents = Math.max(0, basePriceCents - discountCents);

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
      productPriceCents: basePriceCents,
      discountCents,
      amountDueCents,
      isFree: amountDueCents === 0,
      message: amountDueCents === 0
        ? 'Cupom de 100% de desconto! Acesso gratuito liberado.'
        : `Cupom aplicado! Desconto de R$ ${(discountCents / 100).toFixed(2).replace('.', ',')}`,
    });
  } catch (err: any) {
    console.error('[Coupons] Erro inesperado na validação:', err);
    return res.status(500).json({ valid: false, message: err?.message || 'Erro interno na validação do cupom.' });
  }
}
