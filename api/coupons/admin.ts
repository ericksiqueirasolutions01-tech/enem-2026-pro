import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  const supabase = getOptionalSupabaseAdmin();
  if (!supabase) {
    return res.status(200).json({ success: true, message: 'Modo local ativo. Cupons gerenciados no cliente.', coupons: [] });
  }

  // 1. Validar autenticação e perfil de ADMINISTRADOR
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Autenticação necessária.' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'ADMINISTRADOR' || profile.status !== 'APROVADO') {
    return res.status(403).json({ success: false, message: 'Acesso restrito à coordenação.' });
  }

  // 2. GET: Listar todos os cupons com contagem de usos
  if (req.method === 'GET') {
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, coupons: coupons || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao listar cupons.' });
    }
  }

  // 3. POST: Criar novo cupom
  if (req.method === 'POST') {
    try {
      const {
        code,
        discountType,
        discountValue,
        maxUses,
        expiresAt,
        startsAt,
        active,
      } = req.body || {};

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ success: false, message: 'O código do cupom é obrigatório.' });
      }

      const cleanCode = code.trim().toUpperCase();
      const cleanType = discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE';
      const cleanValue = Math.round(Number(discountValue) || 0);

      if (cleanValue <= 0) {
        return res.status(400).json({ success: false, message: 'O valor do desconto deve ser maior que zero.' });
      }

      if (cleanType === 'PERCENTAGE' && cleanValue > 100) {
        return res.status(400).json({ success: false, message: 'O percentual de desconto não pode ser superior a 100%.' });
      }

      const { data: created, error } = await supabase
        .from('coupons')
        .insert({
          code: cleanCode,
          discount_type: cleanType,
          discount_value: cleanValue,
          max_uses: maxUses && Number(maxUses) > 0 ? Number(maxUses) : null,
          starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          active: active !== false,
          used_count: 0,
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ success: false, message: `O cupom '${cleanCode}' já existe.` });
        }
        throw error;
      }

      return res.status(201).json({ success: true, coupon: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao criar cupom.' });
    }
  }

  // 4. PATCH: Atualizar cupom (ex: status ativo/inativo)
  if (req.method === 'PATCH') {
    try {
      const { id, active, maxUses, expiresAt } = req.body || {};
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID do cupom obrigatório.' });
      }

      const updates: any = {};
      if (typeof active === 'boolean') updates.active = active;
      if (maxUses !== undefined) updates.max_uses = maxUses ? Number(maxUses) : null;
      if (expiresAt !== undefined) updates.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;

      const { data: updated, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, coupon: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao atualizar cupom.' });
    }
  }

  // 5. DELETE: Desativar ou excluir cupom
  if (req.method === 'DELETE') {
    try {
      const couponId = req.query?.id || req.body?.id;
      if (!couponId) {
        return res.status(400).json({ success: false, message: 'ID do cupom obrigatório.' });
      }

      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Cupom excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Erro ao excluir cupom.' });
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ success: false, message: 'Método não permitido.' });
}
