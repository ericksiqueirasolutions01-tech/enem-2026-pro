import { getOptionalSupabaseAdmin, getAuthenticatedUser } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    const orderId = req.query.order_id || req.query.orderId;
    const externalRef = req.query.external_reference || req.query.order_nsu;

    const supabase = getOptionalSupabaseAdmin();
    if (!supabase) {
      return res.status(200).json({
        success: true,
        orderId: orderId || '',
        status: 'PENDING',
        isPaid: false,
        userStatus: 'PENDENTE_APROVACAO',
      });
    }

    let isPaid = false;
    let userStatus = 'PENDENTE_APROVACAO';
    let order: any = null;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userStatus = profile.status;
      }

      let query = supabase.from('orders').select('*').eq('user_id', user.id);
      if (orderId) {
        query = query.eq('id', orderId);
      } else if (externalRef) {
        query = query.eq('external_reference', externalRef);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data } = await query.maybeSingle();
      order = data;
    } else if (orderId || externalRef) {
      let query = supabase.from('orders').select('*');
      if (orderId) {
        query = query.eq('id', orderId);
      } else {
        query = query.eq('external_reference', externalRef);
      }
      const { data } = await query.maybeSingle();
      order = data;
    }

    const isAdmin = user && (user.email === 'ericksiqueiraa@gmail.com' || user.email === 'ericksiqueiraaa@gmail.com');
    isPaid = order?.status === 'PAID' || (Boolean(isAdmin) && userStatus === 'APROVADO');

    return res.status(200).json({
      success: true,
      orderId: order?.id || orderId,
      status: order?.status || (isPaid ? 'PAID' : 'PENDING'),
      isPaid,
      userStatus: isPaid ? (isAdmin ? 'APROVADO' : 'APROVADO') : 'PENDENTE_APROVACAO',
      paidAt: order?.paid_at,
      receiptUrl: order?.receipt_url,
      captureMethod: order?.capture_method,
    });
  } catch (err: any) {
    console.error('[Status] Erro ao consultar status:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao consultar status.' });
  }
}
