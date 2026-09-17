import { getSupabaseAdmin, getAuthenticatedUser } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Não autorizado.' });
    }

    const orderId = req.query.order_id || req.query.orderId;
    const externalRef = req.query.external_reference || req.query.order_nsu;

    const supabase = getSupabaseAdmin();

    // 1. Obter status do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    // 2. Buscar o pedido mais recente ou o especificado
    let query = supabase.from('orders').select('*').eq('user_id', user.id);

    if (orderId) {
      query = query.eq('id', orderId);
    } else if (externalRef) {
      query = query.eq('external_reference', externalRef);
    } else {
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data: order } = await query.maybeSingle();

    const isPaid = order?.status === 'PAID' || profile?.status === 'APROVADO';

    return res.status(200).json({
      success: true,
      orderId: order?.id,
      status: order?.status || 'PENDING',
      isPaid,
      userStatus: profile?.status || 'PENDENTE_APROVACAO',
      paidAt: order?.paid_at,
      receiptUrl: order?.receipt_url,
      captureMethod: order?.capture_method,
    });
  } catch (err: any) {
    console.error('[Status] Erro ao consultar status:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao consultar status.' });
  }
}

