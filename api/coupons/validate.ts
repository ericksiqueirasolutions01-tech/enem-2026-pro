import {
  FIXED_PRODUCT_PRICE_CENTS,
  getOptionalSupabaseAdmin,
  getAuthenticatedUser,
  normalizeCouponCode,
  getCentralCoupon,
  validateCouponRules,
  calculateCouponDiscount,
} from './_shared.ts';

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
    const { discountCents, amountDueCents, isFree } = calculateCouponDiscount(coupon, FIXED_PRODUCT_PRICE_CENTS);

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
