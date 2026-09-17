import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import {
  getSupabaseAdmin,
  getAuthenticatedUser,
  INFINITEPAY_API_URL,
  FIXED_PRODUCT_PRICE_CENTS,
  DEFAULT_HANDLE,
  getAppBaseUrl,
} from './_shared';

export default async function handler(req: any, res: any) {
  // 1. Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' });
  }

  try {
    // 2. Validar autenticação do usuário
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Você precisa estar autenticado para gerar o checkout de pagamento.',
      });
    }

    const supabase = getSupabaseAdmin();

    // 3. Buscar perfil atual do usuário
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, name, email, phone, status, role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'Perfil do usuário não encontrado.',
      });
    }

    // Se já estiver APROVADO, não cria nova cobrança desnecessária
    if (profile.status === 'APROVADO') {
      return res.status(200).json({
        success: true,
        alreadyActive: true,
        message: 'Seu acesso à plataforma já está totalmente liberado!',
      });
    }

    // 4. Verificar se existe um pedido pendente reutilizável gerado nos últimos 30 minutos
    const trintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'PENDING')
      .gt('created_at', trintaMinutosAtras)
      .not('checkout_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOrder && existingOrder.checkout_url) {
      return res.status(200).json({
        success: true,
        orderId: existingOrder.id,
        externalReference: existingOrder.external_reference,
        checkoutUrl: existingOrder.checkout_url,
        status: existingOrder.status,
        reused: true,
      });
    }

    // 5. Gerar novo pedido no banco de dados com valor e preço fixados no backend
    const orderNsu = `enem-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const { data: newOrder, error: orderInsertErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        provider: 'infinitepay',
        amount_cents: FIXED_PRODUCT_PRICE_CENTS,
        currency: 'BRL',
        status: 'PENDING',
        external_reference: orderNsu,
      })
      .select()
      .single();

    if (orderInsertErr || !newOrder) {
      console.error('[Payments] Erro ao criar pedido no banco:', orderInsertErr);
      return res.status(500).json({
        success: false,
        error: 'ORDER_CREATION_FAILED',
        message: 'Falha ao registrar pedido no sistema.',
      });
    }

    // 6. Montar payload oficial da API InfinitePay
    const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE;
    const appBaseUrl = getAppBaseUrl(req);
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || '';

    const infinitePayload: Record<string, unknown> = {
      handle,
      order_nsu: orderNsu,
      redirect_url: `${appBaseUrl}/payment/success?order_id=${newOrder.id}`,
      webhook_url: `${appBaseUrl}/api/payments/webhook${webhookSecret ? `?secret=${encodeURIComponent(webhookSecret)}` : ''}`,
      customer: {
        name: profile.name || user.email?.split('@')[0] || 'Aluno ENEM',
        email: profile.email || user.email,
        phone_number: profile.phone ? profile.phone.replace(/\D/g, '') : undefined,
      },
      items: [
        {
          quantity: 1,
          price: FIXED_PRODUCT_PRICE_CENTS, // 3700 centavos = R$ 37,00
          description: 'ENEM 2026 PRO — Acesso Completo',
        },
      ],
    };

    // 7. Fazer requisição oficial POST https://api.checkout.infinitepay.io/links
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

      // Em ambiente local/desenvolvimento ou caso a tag retorne erro, fallback amigável
      return res.status(502).json({
        success: false,
        error: 'GATEWAY_ERROR',
        message: 'Não foi possível gerar o link na InfinitePay no momento.',
        details: errorText,
      });
    }

    const infiniteData = (await infiniteResponse.json()) as { url?: string };
    if (!infiniteData.url) {
      throw new Error('A API da InfinitePay não retornou uma URL válida de checkout.');
    }

    // 8. Atualizar pedido com a checkout_url gerada
    await supabase
      .from('orders')
      .update({
        checkout_url: infiniteData.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newOrder.id);

    return res.status(200).json({
      success: true,
      orderId: newOrder.id,
      externalReference: orderNsu,
      checkoutUrl: infiniteData.url,
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

