import {
  getSupabaseAdmin,
  INFINITEPAY_API_URL,
  DEFAULT_HANDLE,
  computePayloadHash,
} from './_shared';

export default async function handler(req: any, res: any) {
  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    // 2. Validação do segredo do webhook (se configurado)
    const expectedSecret = process.env.INFINITEPAY_WEBHOOK_SECRET;
    if (expectedSecret) {
      const providedSecret = req.query?.secret || req.headers['x-webhook-secret'];
      if (!providedSecret || providedSecret !== expectedSecret) {
        console.warn('[Webhook] Tentativa de acesso com token inválido ou ausente.');
        return res.status(401).json({ success: false, message: 'Autenticação de webhook inválida.' });
      }
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Payload inválido ou corpo vazio.' });
    }

    const {
      order_nsu,
      transaction_nsu,
      invoice_slug,
      amount,
      paid_amount,
      capture_method,
      receipt_url,
    } = payload;

    if (!order_nsu) {
      return res.status(400).json({ success: false, message: 'Campo order_nsu ausente.' });
    }

    const supabase = getSupabaseAdmin();
    const payloadHash = computePayloadHash(payload);

    // 3. Verificar Idempotência: Se já processamos esse exato evento, responder imediatamente com sucesso (GATE 7)
    const { data: existingEvent } = await supabase
      .from('payment_events')
      .select('id, processed')
      .eq('payload_hash', payloadHash)
      .maybeSingle();

    if (existingEvent && existingEvent.processed) {
      return res.status(200).json({ success: true, duplicate: true, message: 'Evento já processado anteriormente.' });
    }

    // Registrar o evento como pendente de processamento se ainda não existir
    let eventId = existingEvent?.id;
    if (!eventId) {
      const { data: newEvent } = await supabase
        .from('payment_events')
        .insert({
          provider: 'infinitepay',
          provider_payment_id: transaction_nsu || null,
          event_type: 'PAYMENT_APPROVED',
          payload_hash: payloadHash,
          payload,
          processed: false,
        })
        .select('id')
        .single();
      eventId = newEvent?.id;
    }

    // 4. Buscar o pedido no banco para verificar valor esperado (GATE 6, 8, 18, 23)
    const { data: targetOrder, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('external_reference', order_nsu)
      .maybeSingle();

    if (orderErr || !targetOrder) {
      return res.status(400).json({
        success: false,
        message: 'Pedido não encontrado para a referência externa informada.',
      });
    }

    // Se já estiver pago, responder com idempotência
    if (targetOrder.status === 'PAID') {
      if (eventId) {
        await supabase.from('payment_events').update({ processed: true, processed_at: new Date().toISOString() }).eq('id', eventId);
      }
      return res.status(200).json({ success: true, message: 'Pedido já constava como pago.' });
    }

    const expectedAmountCents = targetOrder.amount_cents;
    const effectiveAmount = paid_amount || amount;

    // Conferir se o valor pago é suficiente para liquidar o pedido contratado
    if (typeof effectiveAmount !== 'number' || effectiveAmount < expectedAmountCents) {
      return res.status(400).json({
        success: false,
        message: `Valor pago (${effectiveAmount}) inferior ao valor contratado no pedido (${expectedAmountCents}).`,
      });
    }

    // 5. Conferência Server-Side Oficial com a API InfinitePay (Payment Check)
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;

    if (transaction_nsu && invoice_slug) {
      try {
        const checkResponse = await fetch(`${INFINITEPAY_API_URL}/payment_check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle,
            order_nsu,
            transaction_nsu,
            slug: invoice_slug,
          }),
        });

        if (checkResponse.ok) {
          const checkData = (await checkResponse.json()) as {
            success?: boolean;
            paid?: boolean;
            amount?: number;
          };
          if (
            checkData.success === true &&
            checkData.paid === true &&
            (checkData.amount ?? 0) < expectedAmountCents
          ) {
            return res.status(400).json({
              success: false,
              message: 'Conferência InfinitePay indicou valor pago menor que o esperado.',
            });
          }
        }
      } catch (checkErr) {
        console.warn('[Webhook] Falha ao consultar payment_check na InfinitePay:', checkErr);
      }
    }

    // 6. Executar ativação atômica no banco de dados via RPC com SECURITY DEFINER
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('activate_paid_order', {
      p_external_reference: order_nsu,
      p_provider_payment_id: transaction_nsu || null,
      p_provider_slug: invoice_slug || null,
      p_amount_cents: effectiveAmount,
      p_capture_method: capture_method || null,
      p_receipt_url: receipt_url || null,
    });

    if (rpcErr || !rpcResult?.success) {
      console.error('[Webhook] Erro ao ativar pedido via RPC:', rpcErr || rpcResult);
      return res.status(400).json({
        success: false,
        message: rpcResult?.message || 'Falha ao conciliar e ativar pedido.',
      });
    }

    // 7. Marcar evento como processado
    if (eventId) {
      await supabase
        .from('payment_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', eventId);
    }

    // 8. Responder 200 OK com o formato oficial esperado pela InfinitePay
    return res.status(200).json({
      success: true,
      message: null,
    });
  } catch (err: any) {
    console.error('[Webhook] Erro interno no processamento:', err);
    return res.status(400).json({
      success: false,
      message: err?.message || 'Erro no processamento do webhook.',
    });
  }
}
