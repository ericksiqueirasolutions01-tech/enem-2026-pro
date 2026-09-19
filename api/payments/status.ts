import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';

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
    const receiptUrl = req.query.receipt_url || req.query.receiptUrl;

    const supabase = getOptionalSupabaseAdmin();
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

    let isPaid = order?.status === 'PAID';

    // Se a ordem já consta como PAID no banco, retornar imediatamente (sem chamadas externas)
    if (order?.status === 'PAID') {
      return res.status(200).json({
        success: true,
        orderId: order.id,
        externalReference: order.external_reference,
        status: 'PAID',
        isPaid: true,
        userStatus: 'APROVADO',
        amountCents: order.amount_cents,
        paidAt: order.paid_at || order.updated_at,
      });
    }

    // 2. Se o pedido existe e está PENDING, E foram fornecidos identificadores de transação
    // (transactionNsu ou slug), efetuar verificação controlada via payment_check na InfinitePay
    const effectiveOrderNsu = order?.external_reference || externalRef;
    let effectiveTransactionNsu = transactionNsu || order?.provider_payment_id;
    let effectiveSlug = slug || order?.provider_slug;

    if (receiptUrl && typeof receiptUrl === 'string') {
      try {
        const parsed = new URL(receiptUrl.startsWith('http') ? receiptUrl : `https://${receiptUrl}`);
        effectiveSlug = effectiveSlug || parsed.searchParams.get('slug') || parsed.pathname.split('/').filter(Boolean).pop();
        effectiveTransactionNsu = effectiveTransactionNsu || parsed.searchParams.get('transaction_nsu') || parsed.searchParams.get('transactionId');
      } catch {
        // ignore
      }
    }

    // Somente chamar payment_check se HOUVER pedido pendente real E identificadores concretos
    if (order && order.status === 'PENDING' && (effectiveTransactionNsu || effectiveSlug)) {
      const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
      try {
        const ipCheckPayload: Record<string, string> = {
          handle,
          order_nsu: String(effectiveOrderNsu),
        };
        if (effectiveTransactionNsu) ipCheckPayload.transaction_nsu = String(effectiveTransactionNsu);
        if (effectiveSlug) ipCheckPayload.slug = String(effectiveSlug);

        const checkResponse = await fetch(`${INFINITEPAY_API_URL}/payment_check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ipCheckPayload),
        });

        if (checkResponse.ok) {
          const checkData = (await checkResponse.json()) as {
            success?: boolean;
            paid?: boolean;
            amount?: number;
          };

          if (checkData.success === true && checkData.paid === true) {
            isPaid = true;
            // Ativação atômica via RPC
            if (supabase) {
              await supabase.rpc('activate_paid_order', {
                p_external_reference: effectiveOrderNsu,
                p_provider_payment_id: effectiveTransactionNsu || null,
                p_provider_slug: effectiveSlug || null,
                p_amount_cents: checkData.amount || order.amount_cents,
                p_capture_method: 'infinitepay',
                p_receipt_url: receiptUrl || null,
              });
            }

            return res.status(200).json({
              success: true,
              orderId: order.id,
              externalReference: effectiveOrderNsu,
              status: 'PAID',
              isPaid: true,
              userStatus: 'APROVADO',
              amountCents: checkData.amount || order.amount_cents,
              paidAt: new Date().toISOString(),
            });
          }
        }
      } catch (checkErr) {
        console.warn('[PaymentsStatus] Falha ao consultar payment_check na InfinitePay:', checkErr);
      }
    }

    // 3. Resposta Fail-Closed: sem confirmação comprovada, status permanece PENDING e isPaid false
    return res.status(200).json({
      success: true,
      orderId: order?.id || orderId || null,
      externalReference: effectiveOrderNsu || null,
      status: order?.status || (isPaid ? 'PAID' : 'PENDING'),
      isPaid,
      userStatus,
      message: isPaid ? 'Pagamento confirmado com sucesso!' : 'Pagamento pendente ou aguardando confirmação bancária.',
    });
  } catch (err: any) {
    console.error('[PaymentsStatus] Erro inesperado:', err);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      isPaid: false,
      message: 'Erro interno ao consultar status do pagamento.',
    });
  }
}
