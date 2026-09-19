import {
  getOptionalSupabaseAdmin,
  getAuthenticatedUser,
  normalizeCouponCode,
  listCentralCoupons,
  saveCentralCoupon,
  removeCentralCoupon,
  getCentralCoupon,
  type CentralCoupon,
} from './_shared.ts';

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
      const allCoupons = await listCentralCoupons(supabase);
      return res.status(200).json({ success: true, coupons: allCoupons });
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

      await saveCentralCoupon(newCouponRecord, supabase);

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

      const existing = await getCentralCoupon(targetCode, supabase);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cupom não encontrado para atualização.' });
      }

      const updated: CentralCoupon = {
        ...existing,
        active: typeof active === 'boolean' ? active : existing.active,
        max_uses: maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : existing.max_uses,
        expires_at: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt).toISOString() : null) : existing.expires_at,
        updated_at: new Date().toISOString(),
      };

      await saveCentralCoupon(updated, supabase);
      return res.status(200).json({ success: true, coupon: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao atualizar cupom.' });
    }
  }

  // 5. DELETE: Desativar ou excluir cupom
  if (req.method === 'DELETE') {
    try {
      const couponId = req.query?.id || req.body?.id;
      const couponCode = req.query?.code || req.body?.code;
      const target = couponCode || couponId;
      if (!target) {
        return res.status(400).json({ success: false, message: 'ID ou código do cupom obrigatório.' });
      }

      await removeCentralCoupon(target, supabase);
      return res.status(200).json({ success: true, message: 'Cupom excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao excluir cupom.' });
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ success: false, message: 'Método não permitido.' });
}
