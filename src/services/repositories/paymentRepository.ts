import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import { CreateCheckoutResponse, PaymentStatusResponse, Order, OrderStatus } from '../../types';

export const paymentRepository = {
  /**
   * Solicita a criação do link de checkout InfinitePay (R$ 37,00) para o usuário autenticado.
   * Tenta primeiro o endpoint serverless /api/payments/create e possui fallback direto para
   * a API oficial da InfinitePay (que possui suporte nativo a CORS).
   */
  async createCheckoutLink(options?: {
    couponCode?: string;
    discountCents?: number;
    finalPriceCents?: number;
  }): Promise<CreateCheckoutResponse> {
    let token: string | undefined;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      } catch (err) {
        console.warn('[paymentRepository] Erro ao obter sessão Supabase:', err);
      }
    }

    const currentUser = db.getCurrentUser();
    const customerName = currentUser?.name || 'Aluno ENEM 2026 PRO';
    const customerEmail = currentUser?.email || 'aluno@enem2026pro.com';
    const customerPhone = currentUser?.phone ? currentUser.phone.replace(/\D/g, '') : undefined;

    const couponCode = options?.couponCode ? options.couponCode.trim().toUpperCase() : undefined;
    let finalPriceCents =
      typeof options?.finalPriceCents === 'number' ? options.finalPriceCents : 3700;

    if (finalPriceCents > 0 && finalPriceCents < 100) {
      finalPriceCents = 100;
    }

    // Se o cupom zerou o valor (100% gratuito / bolsa)
    if (finalPriceCents === 0 && couponCode) {
      if (currentUser) {
        currentUser.status = 'APROVADO';
        db.setCurrentUser(currentUser, true);
      }
      db.incrementCouponUses(couponCode);

      // Tenta sincronizar com o backend
      try {
        fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id,
            name: customerName,
            email: customerEmail,
            couponCode,
            finalPriceCents: 0,
          }),
        }).catch(() => {});
      } catch {}

      return {
        success: true,
        alreadyActive: true,
        isFreeCoupon: true,
        finalPriceCents: 0,
        message: 'Parabéns! Sua bolsa de estudos / cupom de 100% foi ativado com sucesso!',
      };
    }

    // 1. Tentar gerar via Backend Serverless (/api/payments/create)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: currentUser?.id,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          couponCode,
          discountCents: options?.discountCents,
          finalPriceCents,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && (data.checkoutUrl || data.alreadyActive)) {
          if (couponCode) db.incrementCouponUses(couponCode);
          return data;
        }
      }
    } catch (serverErr) {
      console.warn('[paymentRepository] Servidor serverless indisponível, acionando gateway direto:', serverErr);
    }

    // 2. Gateway Direto Oficial (InfinitePay API Links — CORS liberado pela CloudWalk)
    try {
      const appUrl =
        ((import.meta as any).env?.VITE_APP_URL as string)?.replace(/\/$/, '') ||
        (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
          ? 'https://enem-2026-pro.vercel.app'
          : typeof window !== 'undefined'
          ? window.location.origin
          : 'https://enem-2026-pro.vercel.app');
      const orderNsu = `enem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const itemDesc = couponCode
        ? `ENEM 2026 PRO — Acesso Completo (Cupom: ${couponCode})`
        : 'ENEM 2026 PRO — Acesso Completo';

      const ipPayload = {
        handle: 'erick-siqueira-bg2',
        order_nsu: orderNsu,
        redirect_url: `${appUrl}/payment/success?order_id=${orderNsu}`,
        webhook_url: `${appUrl}/api/payments/webhook`,
        customer: {
          name: customerName,
          email: customerEmail,
          ...(customerPhone ? { phone_number: customerPhone } : {}),
        },
        items: [
          {
            quantity: 1,
            price: finalPriceCents,
            description: itemDesc,
          },
        ],
      };

      const directRes = await fetch('https://api.checkout.infinitepay.io/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ipPayload),
      });

      if (directRes.ok) {
        const ipData = (await directRes.json()) as {
          url?: string;
          checkout_url?: string;
          slug?: string;
        };

        const checkoutUrl =
          ipData.url ||
          ipData.checkout_url ||
          (ipData.slug ? `https://pay.infinitepay.io/${ipData.slug}` : null);

        if (checkoutUrl) {
          if (couponCode) db.incrementCouponUses(couponCode);
          return {
            success: true,
            checkoutUrl,
            orderId: orderNsu,
            externalReference: orderNsu,
            status: 'PENDING',
            finalPriceCents,
          };
        }
      }

      const errText = await directRes.text();
      console.error('[paymentRepository] Falha na resposta da InfinitePay:', directRes.status, errText);
      return {
        success: false,
        error: 'GATEWAY_ERROR',
        message: 'A adquirente InfinitePay não pôde gerar o link no momento. Tente novamente em instantes.',
      };
    } catch (directErr: any) {
      console.error('[paymentRepository] Erro ao conectar diretamente à InfinitePay:', directErr);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: directErr?.message || 'Falha de comunicação com o serviço de pagamento.',
      };
    }
  },

  /**
   * Consulta o status de um pedido específico ou do pedido mais recente do usuário.
   */
  async checkPaymentStatus(orderId?: string): Promise<PaymentStatusResponse> {
    let token: string | undefined;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      } catch (err) {
        console.warn('[paymentRepository] Erro ao obter sessão Supabase:', err);
      }
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = orderId ? `/api/payments/status?order_id=${encodeURIComponent(orderId)}` : '/api/payments/status';

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Ignora erro e recorre ao status local
    }

    // Fallback gracioso com dados locais
    const currentUser = db.getCurrentUser();
    return {
      success: true,
      orderId: orderId || '',
      status: (currentUser?.status === 'APROVADO' ? 'PAID' : 'PENDING') as OrderStatus,
      isPaid: currentUser?.status === 'APROVADO',
      userStatus: currentUser?.status || 'PENDENTE_APROVACAO',
    };
  },

  /**
   * Lista todos os pedidos (para administradores ou histórico do próprio aluno).
   */
  async listOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id(name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[paymentRepository] Erro ao listar pedidos:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.profiles?.email,
        userName: row.profiles?.name,
        provider: row.provider,
        amountCents: row.amount_cents,
        currency: row.currency,
        status: row.status,
        externalReference: row.external_reference,
        providerPaymentId: row.provider_payment_id,
        providerSlug: row.provider_slug,
        checkoutUrl: row.checkout_url,
        receiptUrl: row.receipt_url,
        captureMethod: row.capture_method,
        paidAt: row.paid_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Alias de conveniência para listOrders.
   */
  async getOrders(): Promise<Order[]> {
    return this.listOrders();
  },

  /**
   * Força a reconciliação direta de um pedido com a API InfinitePay (exclusivo para administradores).
   */
  async reconcileOrder(
    orderId: string,
    transactionNsu?: string,
    slug?: string
  ): Promise<{ success: boolean; message: string; status?: OrderStatus }> {
    let token: string | undefined;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      } catch (err) {
        console.warn('[paymentRepository] Erro ao obter sessão:', err);
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          transaction_nsu: transactionNsu,
          slug,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      return { success: false, message: `Resposta inesperada: HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro na comunicação.' };
    }
  },
};
