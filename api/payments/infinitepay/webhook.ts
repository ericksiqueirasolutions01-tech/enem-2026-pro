import * as crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const DEFAULT_HANDLE = 'erick-siqueira-bg2';
export const FIXED_PRODUCT_PRICE_CENTS = 3700;

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

export function computePayloadHash(payload: unknown): string {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
}

export default async function handler(req: any, res: any) {
  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    // 2. Validação do segredo do webhook (se configurado nas envs)
    const expectedSecret = process.env.INFINITEPAY_WEBHOOK_SECRET;
    if (expectedSecret) {
      const providedSecret = req.query?.secret || req.headers['x-webhook-secret'];
      if (!providedSecret || providedSecret !== expectedSecret) {
        console.warn('[Webhook InfinitePay] Tentativa de acesso não autorizada.');
        return res.status(401).json({ success: false, message: 'Autenticação de webhook inválida.' });
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Payload inválido ou corpo vazio.' });
    }

    const {
      order_nsu,
      transaction_nsu,
      invoice_slug,
      slug,
      amount,
      paid_amount,
      capture_method,
      receipt_url,
    } = payload;

    const effectiveOrderNsu = order_nsu || payload.external_reference;
    const effectiveSlug = invoice_slug || slug;
    const effectiveTransactionNsu = transaction_nsu || payload.transaction_id;

    if (!effectiveOrderNsu) {
      return res.status(400).json({ success: false, message: 'Campo order_nsu ausente.' });
    }

    console.log('[Webhook InfinitePay] payment_webhook_received:', {
      order_nsu: effectiveOrderNsu,
      transaction_nsu: effectiveTransactionNsu,
      slug: effectiveSlug,
    });

    const supabase = getOptionalSupabaseAdmin();
    const payloadHash = computePayloadHash(payload);

    let expectedAmountCents = FIXED_PRODUCT_PRICE_CENTS;

    // 3. Verificar idempotência via payment_events
    let eventId: string | undefined;
    if (supabase) {
      const { data: existingEvent } = await supabase
        .from('payment_events')
        .select('id, processed')
        .eq('payload_hash', payloadHash)
        .maybeSingle();

      if (existingEvent && existingEvent.processed) {
        return res.status(200).json({ success: true, duplicate: true, message: 'Evento já processado anteriormente.' });
      }

      if (!existingEvent) {
        const { data: insertedEvent, error: insertErr } = await supabase
          .from('payment_events')
          .insert({
            event_type: 'infinitepay.payment_confirmed',
            external_reference: effectiveOrderNsu,
            payload_hash: payloadHash,
            raw_payload: payload,
            processed: false,
          })
          .select('id')
          .single();

        if (!insertErr && insertedEvent) {
          eventId = insertedEvent.id;
        }
      }

      const { data: orderRecord } = await supabase
        .from('orders')
        .select('amount_cents, status')
        .eq('external_reference', effectiveOrderNsu)
        .maybeSingle();

      if (orderRecord?.amount_cents) {
        expectedAmountCents = orderRecord.amount_cents;
      }
    }

    const effectiveAmount = paid_amount || amount || expectedAmountCents;

    // 4. Verificação server-to-server via payment_check na API oficial InfinitePay (GATE 7 / GATE 8)
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
    console.log('[Webhook InfinitePay] payment_verification_started:', { order_nsu: effectiveOrderNsu });

    let verifiedByGateway = false;
    try {
      const checkPayload: Record<string, string> = {
        handle,
        order_nsu: effectiveOrderNsu,
      };
      if (effectiveTransactionNsu) checkPayload.transaction_nsu = effectiveTransactionNsu;
      if (effectiveSlug) checkPayload.slug = effectiveSlug;

      const checkResponse = await fetch(`${INFINITEPAY_API_URL}/payment_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkPayload),
      });

      if (checkResponse.ok) {
        const checkData = (await checkResponse.json()) as {
          success?: boolean;
          paid?: boolean;
          amount?: number;
        };

        if (checkData.success === true && checkData.paid === true) {
          verifiedByGateway = true;
          console.log('[Webhook InfinitePay] payment_verified_paid:', { order_nsu: effectiveOrderNsu });
        } else {
          console.log('[Webhook InfinitePay] payment_verified_unpaid:', { order_nsu: effectiveOrderNsu, checkData });
        }
      }
    } catch (checkErr) {
      console.warn('[Webhook InfinitePay] Falha ao consultar payment_check na InfinitePay:', checkErr);
    }

    // Se o webhook veio com segredo autenticado ou payment_check confirmou
    const isAuthorizedConfirmation = verifiedByGateway || (!process.env.INFINITEPAY_WEBHOOK_SECRET && (payload.status === 'paid' || payload.event === 'payment_confirmed'));

    if (!isAuthorizedConfirmation && !verifiedByGateway) {
      return res.status(400).json({
        success: false,
        message: 'Transação não confirmada pela verificação oficial do gateway.',
      });
    }

    // 5. Executar ativação atômica no banco de dados via RPC activate_paid_order (GATE 7)
    if (supabase) {
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('activate_paid_order', {
        p_external_reference: effectiveOrderNsu,
        p_provider_payment_id: effectiveTransactionNsu || null,
        p_provider_slug: effectiveSlug || null,
        p_amount_cents: effectiveAmount,
        p_capture_method: capture_method || 'infinitepay',
        p_receipt_url: receipt_url || null,
      });

      if (rpcErr || !rpcResult?.success) {
        console.error('[Webhook InfinitePay] Erro ao ativar pedido via RPC:', rpcErr || rpcResult);
        return res.status(400).json({
          success: false,
          message: rpcResult?.message || 'Falha ao conciliar e ativar pedido.',
        });
      }

      if (eventId) {
        await supabase
          .from('payment_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
          })
          .eq('id', eventId);
      }

      console.log('[Webhook InfinitePay] access_activated:', { order_nsu: effectiveOrderNsu, rpcResult });
    }

    // 6. Responder 200 OK no formato esperado pela InfinitePay
    return res.status(200).json({
      success: true,
      message: null,
    });
  } catch (err: any) {
    console.error('[Webhook InfinitePay] Erro interno:', err);
    return res.status(400).json({
      success: false,
      message: err?.message || 'Erro no processamento do webhook.',
    });
  }
}

