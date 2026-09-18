import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const FIXED_PRODUCT_PRICE_CENTS = 3700;
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configuração ausente: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas no ambiente.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser(req: any) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const supabaseAdmin = getSupabaseAdmin();
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Não autorizado.' });
    }

    const supabase = getSupabaseAdmin();

    // 1. Validar se o usuário é ADMINISTRADOR aprovado
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'ADMINISTRADOR' || adminProfile?.status !== 'APROVADO') {
      return res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
    }

    const { orderId, order_nsu, transaction_nsu, slug } = req.body || {};

    // 2. Buscar o pedido correspondente
    let orderQuery = supabase.from('orders').select('*');
    if (orderId) {
      orderQuery = orderQuery.eq('id', orderId);
    } else if (order_nsu) {
      orderQuery = orderQuery.eq('external_reference', order_nsu);
    } else {
      return res.status(400).json({ success: false, message: 'Informe orderId ou order_nsu.' });
    }

    const { data: order, error: orderErr } = await orderQuery.single();
    if (orderErr || !order) {
      return res.status(404).json({ success: false, message: 'Pedido não localizado.' });
    }

    // 3. Obter parâmetros para consulta de status
    const effectiveTransactionNsu = transaction_nsu || order.provider_payment_id;
    const effectiveSlug = slug || order.provider_slug;
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;

    if (!effectiveTransactionNsu || !effectiveSlug) {
      return res.status(400).json({
        success: false,
        message: 'Faltam dados de transação da InfinitePay (transaction_nsu / slug) para consulta oficial.',
      });
    }

    // 4. Executar Payment Check oficial
    const checkResponse = await fetch(`${INFINITEPAY_API_URL}/payment_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        order_nsu: order.external_reference,
        transaction_nsu: effectiveTransactionNsu,
        slug: effectiveSlug,
      }),
    });

    if (!checkResponse.ok) {
      const errText = await checkResponse.text();
      return res.status(502).json({
        success: false,
        message: 'Falha na resposta da API InfinitePay.',
        details: errText,
      });
    }

    const checkData = (await checkResponse.json()) as {
      success?: boolean;
      paid?: boolean;
      amount?: number;
      capture_method?: string;
    };

    if (checkData.success && checkData.paid && (checkData.amount ?? 0) >= FIXED_PRODUCT_PRICE_CENTS) {
      // 5. Ativar atomicamente o pedido
      const { data: rpcResult } = await supabase.rpc('activate_paid_order', {
        p_external_reference: order.external_reference,
        p_provider_payment_id: effectiveTransactionNsu,
        p_provider_slug: effectiveSlug,
        p_amount_cents: checkData.amount,
        p_capture_method: checkData.capture_method || order.capture_method,
        p_receipt_url: order.receipt_url,
      });

      return res.status(200).json({
        success: true,
        message: 'Pagamento confirmado e acesso liberado com sucesso pela reconciliação.',
        status: 'PAID',
        rpcResult,
      });
    }

    return res.status(200).json({
      success: false,
      message: 'A transação ainda não consta como paga ou confirmada na InfinitePay.',
      checkData,
    });
  } catch (err: any) {
    console.error('[Reconcile] Erro inesperado:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Erro interno na reconciliação.' });
  }
}
