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

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    const orderId = req.query.order_id || req.query.orderId;
    const externalRef = req.query.external_reference || req.query.order_nsu;
    const transactionNsu = req.query.transaction_nsu || req.query.transactionId;
    const slug = req.query.slug || req.query.invoice_slug;

    const supabase = getOptionalSupabaseAdmin();
    let isPaid = false;
    let userStatus = 'PENDENTE_APROVACAO';
    let order: any = null;

    // 1. Se Supabase estiver disponível, consultar tabela de pedidos
    if (supabase) {
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
    }

    // 2. Se o pedido ainda não consta como PAID no banco (ou Supabase offline),
    // consultar diretamente a adquirente bancária oficial InfinitePay via payment_check
    const effectiveOrderNsu = externalRef || orderId || order?.external_reference;
    const effectiveTransactionNsu = transactionNsu || order?.provider_payment_id;
    const effectiveSlug = slug || order?.provider_slug;
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;

    if (order?.status !== 'PAID' && effectiveOrderNsu && typeof effectiveOrderNsu === 'string') {
      try {
        const ipCheckPayload: Record<string, string> = {
          handle,
          order_nsu: effectiveOrderNsu,
        };
        if (effectiveTransactionNsu) ipCheckPayload.transaction_nsu = String(effectiveTransactionNsu);
        if (effectiveSlug) ipCheckPayload.slug = String(effectiveSlug);

        const checkResponse = await fetch(`${INFINITEPAY_API_URL}/payment_check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ipCheckPayload),
        });

        if (checkResponse.ok) {
          const checkData = (await checkResponse.json()) as any;
          const isConfirmedByGateway =
            checkData?.success === true &&
            checkData?.paid !== false &&
            (checkData?.paid === true ||
              checkData?.status === 'PAID' ||
              checkData?.status === 'approved' ||
              checkData?.status === 'paid' ||
              (typeof checkData?.paid_amount === 'number' && checkData.paid_amount > 0));

          if (isConfirmedByGateway) {
            order = {
              id: order?.id || orderId || effectiveOrderNsu,
              status: 'PAID',
              external_reference: effectiveOrderNsu,
              paid_at: checkData.paid_at || new Date().toISOString(),
              receipt_url: checkData.receipt_url || null,
              capture_method: checkData.capture_method || 'infinitepay',
              amount_cents: checkData.paid_amount || checkData.amount || 3700,
            };

            // Se Supabase estiver conectado, atualizar banco via RPC atômica
            if (supabase) {
              try {
                await supabase.rpc('activate_paid_order', {
                  p_external_reference: effectiveOrderNsu,
                  p_provider_payment_id: checkData.transaction_nsu || effectiveTransactionNsu || null,
                  p_provider_slug: checkData.slug || effectiveSlug || null,
                  p_amount_cents: order.amount_cents,
                  p_capture_method: order.capture_method,
                  p_receipt_url: order.receipt_url,
                });
              } catch (updErr) {
                console.warn('[Status] Falha ao atualizar Supabase após confirmação da InfinitePay:', updErr);
              }
            }
          }
        }
      } catch (checkErr) {
        console.warn('[Status] Erro ao consultar payment_check na InfinitePay:', checkErr);
      }
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
