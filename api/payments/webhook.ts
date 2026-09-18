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

    const supabase = getOptionalSupabaseAdmin();
    const payloadHash = computePayloadHash(payload);

    let expectedAmountCents = FIXED_PRODUCT_PRICE_CENTS;

    // 3. Se Supabase estiver conectado, verificar idempotência e pedido registrado
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
            external_reference: order_nsu,
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
        .eq('external_reference', order_nsu)
        .maybeSingle();

      if (orderRecord?.amount_cents) {
        expectedAmountCents = orderRecord.amount_cents;
      }
    }

    const effectiveAmount = paid_amount || amount || expectedAmountCents;

    if (effectiveAmount < expectedAmountCents && effectiveAmount < 100) {
      console.warn(`[Webhook] Valor recebido (${effectiveAmount}) menor que esperado (${expectedAmountCents}).`);
      return res.status(400).json({
        success: false,
        message: 'Valor pago divergente do pedido oficial.',
      });
    }

    // 5. Verificação server-to-server opcional via payment_check na API InfinitePay
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

    // 6. Executar ativação atômica no banco de dados via RPC com SECURITY DEFINER se Supabase estiver ativo
    if (supabase) {
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

      if (eventId) {
        await supabase
          .from('payment_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
          })
          .eq('id', eventId);
      }
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
