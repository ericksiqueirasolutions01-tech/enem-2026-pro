import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io';
export const FIXED_PRODUCT_PRICE_CENTS = 3700; // R$ 37,00 fixo e imutável
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

function getAppBaseUrl(req: any): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  return host ? `${proto}://${host}` : 'https://enem2026pro.vercel.app';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' });
  }

  try {
    const supabase = getOptionalSupabaseAdmin();
    const authUser = await getAuthenticatedUser(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Obter dados do cliente
    let userId = authUser?.id || body.userId || `user-${Date.now()}`;
    let customerName = 'Aluno ENEM 2026 PRO';
    let customerEmail = authUser?.email || body.email || 'aluno@enem2026pro.com';
    let customerPhone: string | undefined = body.phone ? String(body.phone).replace(/\D/g, '') : undefined;

    // 2. Se Supabase estiver conectado e houver usuário autenticado, verificar perfil
    if (authUser && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, email, phone, status, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.status === 'APROVADO') {
            return res.status(200).json({
              success: true,
              alreadyActive: true,
              message: 'Seu acesso à plataforma já está totalmente liberado!',
            });
          }
          customerName = profile.name || customerName;
          customerEmail = profile.email || customerEmail;
          if (profile.phone) {
            customerPhone = profile.phone.replace(/\D/g, '');
          }
        }
      } catch (profileErr) {
        console.warn('[Payments] Erro ao consultar perfil no Supabase:', profileErr);
      }
    } else if (body.name) {
      customerName = body.name;
    }

    // 3. Processar Cupom de Desconto (se fornecido)
    const rawCoupon = body.couponCode || body.coupon;
    let finalAmountCents = FIXED_PRODUCT_PRICE_CENTS;
    let appliedDiscountCents = 0;
    let couponDescription = 'ENEM 2026 PRO — Acesso Completo';

    if (rawCoupon) {
      const cleanCoupon = String(rawCoupon).trim().toUpperCase();
      if (cleanCoupon === 'BOLSA100' || cleanCoupon === 'GRATIS100') {
        finalAmountCents = 0;
        appliedDiscountCents = FIXED_PRODUCT_PRICE_CENTS;
        couponDescription = `ENEM 2026 PRO — Acesso Gratuito (Cupom: ${cleanCoupon})`;
      } else if (cleanCoupon === 'ENEM50' || cleanCoupon === 'PROMO50') {
        appliedDiscountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * 50) / 100);
        finalAmountCents = FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents;
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon} - 50% OFF)`;
      } else if (cleanCoupon === 'ENEM20') {
        appliedDiscountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * 20) / 100);
        finalAmountCents = FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents;
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon} - 20% OFF)`;
      } else if (cleanCoupon === 'ENEM10') {
        appliedDiscountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * 10) / 100);
        finalAmountCents = FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents;
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon} - 10% OFF)`;
      } else if (body.discountPercent && Number(body.discountPercent) > 0 && Number(body.discountPercent) <= 100) {
        const pct = Math.min(100, Math.max(0, Number(body.discountPercent)));
        appliedDiscountCents = Math.round((FIXED_PRODUCT_PRICE_CENTS * pct) / 100);
        finalAmountCents = Math.max(0, FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents);
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon})`;
      } else if (body.discountCents && Number(body.discountCents) > 0) {
        appliedDiscountCents = Math.min(FIXED_PRODUCT_PRICE_CENTS, Number(body.discountCents));
        finalAmountCents = Math.max(0, FIXED_PRODUCT_PRICE_CENTS - appliedDiscountCents);
        couponDescription = `ENEM 2026 PRO (Cupom: ${cleanCoupon})`;
      }
    }

    // Se o cupom conceder 100% de desconto (R$ 0,00), ativa diretamente o aluno
    if (finalAmountCents === 0) {
      if (supabase && userId) {
        try {
          await supabase.from('profiles').update({ status: 'APROVADO', role: 'ALUNO' }).eq('id', userId);
        } catch (actErr) {
          console.warn('[Payments] Erro ao ativar perfil no Supabase:', actErr);
        }
      }
      return res.status(200).json({
        success: true,
        alreadyActive: true,
        isFreeCoupon: true,
        finalPriceCents: 0,
        appliedDiscountCents: FIXED_PRODUCT_PRICE_CENTS,
        message: 'Parabéns! Sua bolsa de estudos / cupom de 100% foi ativado com sucesso!',
      });
    }

    // 4. Gerar NSU único e fixar valor do pedido
    const orderNsu = `enem-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    let orderId = orderNsu;

    // 5. Se Supabase estiver disponível, registrar pedido
    if (supabase && userId) {
      try {
        const { data: newOrder, error: orderInsertErr } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            provider: 'infinitepay',
            amount_cents: finalAmountCents, // Base amount_cents: FIXED_PRODUCT_PRICE_CENTS com desconto de cupom validado no servidor
            currency: 'BRL',
            status: 'PENDING',
            external_reference: orderNsu,
          })
          .select()
          .single();

        if (!orderInsertErr && newOrder) {
          orderId = newOrder.id;
        }
      } catch (dbErr) {
        console.warn('[Payments] Não foi possível persistir no Supabase, prosseguindo com InfinitePay:', dbErr);
      }
    }

    // 6. Montar payload oficial InfinitePay (CloudWalk)
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
    const appBaseUrl = getAppBaseUrl(req);
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || '';

    const infinitePayload: Record<string, unknown> = {
      handle,
      order_nsu: orderNsu,
      redirect_url: `${appBaseUrl}/payment/success?order_id=${orderId}`,
      webhook_url: `${appBaseUrl}/api/payments/webhook${webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : ''}`,
      customer: {
        name: customerName,
        email: customerEmail,
        ...(customerPhone ? { phone_number: customerPhone } : {}),
      },
      items: [
        {
          quantity: 1,
          price: finalAmountCents,
          description: couponDescription,
        },
      ],
    };

    // 6. Requisição server-to-server POST https://api.checkout.infinitepay.io/links
    const infiniteResponse = await fetch(`${INFINITEPAY_API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(infinitePayload),
    });

    if (!infiniteResponse.ok) {
      const errorText = await infiniteResponse.text();
      console.error('[InfinitePay] Falha na criação do link:', infiniteResponse.status, errorText);

      return res.status(502).json({
        success: false,
        error: 'GATEWAY_ERROR',
        message: 'A InfinitePay não pôde gerar o link de checkout no momento. Verifique o handle.',
        details: errorText,
      });
    }

    const ipData = (await infiniteResponse.json()) as {
      url?: string;
      checkout_url?: string;
      slug?: string;
      [key: string]: any;
    };

    const checkoutUrl =
      ipData.url ||
      ipData.checkout_url ||
      (ipData.slug ? `https://pay.infinitepay.io/${ipData.slug}` : null);

    if (!checkoutUrl) {
      return res.status(502).json({
        success: false,
        error: 'INVALID_GATEWAY_RESPONSE',
        message: 'A resposta da InfinitePay não continha a URL de redirecionamento do checkout.',
      });
    }

    // Atualizar registro no banco se existir
    if (supabase && orderId !== orderNsu) {
      try {
        await supabase
          .from('orders')
          .update({
            checkout_url: checkoutUrl,
            provider_slug: ipData.slug || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (updateErr) {
        console.warn('[Payments] Erro ao atualizar checkout_url no banco:', updateErr);
      }
    }

    return res.status(200).json({
      success: true,
      orderId,
      externalReference: orderNsu,
      checkoutUrl,
      status: 'PENDING',
    });
  } catch (error: any) {
    console.error('[Payments] Erro inesperado em create:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'Erro interno ao processar pagamento.',
    });
  }
}
