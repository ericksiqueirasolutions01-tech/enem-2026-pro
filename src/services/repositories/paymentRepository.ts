import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import {
  User,
  CreateCheckoutResponse,
  PaymentStatusResponse,
  Order,
  OrderStatus,
  Coupon,
  CouponValidationResult,
  CouponDiscountType,
} from '../../types';

async function getAuthToken(): Promise<string | undefined> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData.session?.access_token;
    } catch (err) {
      console.warn('[paymentRepository] Erro ao obter sessão Supabase:', err);
    }
  }
  return undefined;
}

export const paymentRepository = {
  /**
   * Valida rigorosamente um cupom de desconto junto ao backend (/api/coupons/validate).
   */
  async validateCoupon(code: string): Promise<CouponValidationResult> {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        error: 'Informe o código do cupom.',
        originalPriceCents: 3700,
        discountCents: 0,
        finalPriceCents: 3700,
      };
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const localCoupon = db.getCoupons().find(
      (c) =>
        c.code.toUpperCase() === cleanCode ||
        c.code.replace(/[^A-Z0-9]/g, '').toUpperCase() === cleanCode.replace(/[^A-Z0-9]/g, '')
    );

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: cleanCode, coupon: localCoupon }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.coupon) {
          return {
            valid: true,
            coupon: {
              id: data.coupon.id,
              code: data.coupon.code,
              discountType: data.coupon.discountType,
              discountValue: data.coupon.discountValue,
              maxUses: data.coupon.maxUses,
              usedCount: data.coupon.usedCount || 0,
              expiresAt: data.coupon.expiresAt,
              active: data.coupon.active,
              createdAt: data.coupon.createdAt || new Date().toISOString(),
            },
            originalPriceCents: data.productPriceCents || 3700,
            discountCents: data.discountCents || 0,
            finalPriceCents: data.amountDueCents,
          };
        } else {
          return {
            valid: false,
            error: data.message || 'Cupom inválido ou expirado.',
            originalPriceCents: 3700,
            discountCents: 0,
            finalPriceCents: 3700,
          };
        }
      }
    } catch (err: any) {
      console.error('[paymentRepository] Erro ao validar cupom no backend:', err);
    }

    // Se o backend estiver offline/inacessível mas o cupom estiver no storage local
    if (localCoupon) {
      const localResult = db.validateCoupon(cleanCode);
      if (localResult.valid) {
        return localResult;
      }
    }

    return {
      valid: false,
      error: 'Não foi possível validar o cupom com o servidor. Tente novamente.',
      originalPriceCents: 3700,
      discountCents: 0,
      finalPriceCents: 3700,
    };
  },

  /**
   * Solicita a criação do link de checkout InfinitePay (R$ 37,00) para o usuário autenticado.
   * Regra absoluta: Nunca concede aprovação do lado do cliente.
   * Para cupons de 100%, o backend valida atomicamente e ativa a conta no banco de dados.
   */
  async createCheckoutLink(options?: {
    couponCode?: string;
    discountCents?: number;
    finalPriceCents?: number;
  }): Promise<CreateCheckoutResponse> {
    const token = await getAuthToken();

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

    const localCoupon = couponCode
      ? db.getCoupons().find(
          (c) =>
            c.code.toUpperCase() === couponCode ||
            c.code.replace(/[^A-Z0-9]/g, '').toUpperCase() === couponCode.replace(/[^A-Z0-9]/g, '')
        )
      : undefined;

    // Se o cupom for de 100% gratuito (bolsa de estudos)
    if (finalPriceCents === 0 && couponCode) {
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
            couponCode,
            coupon: localCoupon,
            finalPriceCents: 0,
          }),
        });

        const data = await res.json();
        if (data.success && (data.alreadyActive || data.isFreeCoupon)) {
          // Backend autorizou e ativou atomicamente o perfil no banco de dados
          return {
            success: true,
            alreadyActive: true,
            isFreeCoupon: true,
            finalPriceCents: 0,
            message: data.message || 'Parabéns! Sua bolsa/cupom de 100% foi ativado com sucesso!',
          };
        }

        return {
          success: false,
          error: data.error || 'INVALID_COUPON',
          message: data.message || 'Não foi possível validar o cupom de 100%. Verifique as regras e tente novamente.',
        };
      } catch (err: any) {
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Falha de comunicação com o servidor para validar cupom 100%.',
        };
      }
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
          coupon: localCoupon,
          discountCents: options?.discountCents,
          finalPriceCents,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && (data.checkoutUrl || data.alreadyActive)) {
          return data;
        }
        if (!data.success && data.message) {
          return {
            success: false,
            error: data.error || 'CHECKOUT_FAILED',
            message: data.message,
          };
        }
      }
    } catch (serverErr) {
      console.warn('[paymentRepository] Backend serverless indisponível:', serverErr);
    }

    // Se houve cupom com falha no backend, não ignoramos o cupom silenciosamente
    if (couponCode) {
      return {
        success: false,
        error: 'COUPON_VERIFICATION_REQUIRED',
        message: 'Não foi possível verificar o cupom com o servidor. Tente novamente em instantes.',
      };
    }

    // 2. Gateway Direto Oficial (InfinitePay API Links — Fallback estrito sem cupom)
    try {
      const OFFICIAL_URL = 'https://enem-2026-pro.vercel.app';
      const appUrl =
        ((import.meta as any).env?.VITE_APP_URL as string)?.replace(/\/$/, '') ||
        (typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? window.location.origin
          : OFFICIAL_URL);
      const orderNsu = `enem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const itemDesc = 'ENEM 2026 PRO — Acesso Completo';

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
            price: 3700,
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
          return {
            success: true,
            checkoutUrl,
            orderId: orderNsu,
            externalReference: orderNsu,
            status: 'PENDING',
            finalPriceCents: 3700,
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
      console.error('[paymentRepository] Erro ao conectar à InfinitePay:', directErr);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: directErr?.message || 'Falha de comunicação com o serviço de pagamento.',
      };
    }
  },

  /**
   * Consulta o status de um pedido junto ao endpoint oficial /api/payments/status.
   * Em caso de falha de conexão, opera estritamente em modo FAIL-CLOSED (não libera acesso).
   */
  async checkPaymentStatus(orderId?: string): Promise<PaymentStatusResponse> {
    const token = await getAuthToken();

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
    } catch (err) {
      console.warn('[paymentRepository] Erro ao consultar /api/payments/status:', err);
    }

    // Fail-Closed: Sem confirmação comprovada pelo backend, o status permanece PENDING e isPaid false
    return {
      success: false,
      orderId: orderId || '',
      status: 'PENDING' as OrderStatus,
      isPaid: false,
      userStatus: 'PENDENTE_APROVACAO',
      message: 'Não foi possível confirmar o pagamento junto ao servidor.',
    };
  },

  /**
   * GATE 1 & GATE 2: Matriz de Autorização Única (Fail-Closed).
   * canAccessPremium = authenticated AND (isAdmin OR (verified server-side PAID order))
   * FAIL-CLOSED: erro de rede = negado, status pendente = negado, sem pedido pago = negado.
   */
  async verifyAccessEntitlement(user: User | null): Promise<{ isEntitled: boolean; reason?: string }> {
    if (!user) {
      return { isEntitled: false, reason: 'NOT_AUTHENTICATED' };
    }

    const emailLower = (user.email || '').trim().toLowerCase();
    const isAdminOfficial =
      (emailLower === 'ericksiqueiraa@gmail.com' || emailLower === 'ericksiqueiraaa@gmail.com') &&
      user.role === 'ADMINISTRADOR';

    if (isAdminOfficial) {
      return { isEntitled: true };
    }

    // Para qualquer aluno: exige pedido com status PAID verificado no backend
    try {
      const statusRes = await this.checkPaymentStatus();
      if (statusRes && statusRes.isPaid && statusRes.status === 'PAID') {
        return { isEntitled: true };
      }
    } catch {
      // Fail closed
    }

    // Se Supabase estiver conectado no cliente, consulta direta na tabela orders por pedido PAID
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: paidOrders, error } = await supabase
          .from('orders')
          .select('id, status, amount_cents')
          .eq('user_id', user.id)
          .eq('status', 'PAID')
          .limit(1);

        if (!error && paidOrders && paidOrders.length > 0) {
          return { isEntitled: true };
        }
      } catch {
        // Fail closed
      }
    }

    return { isEntitled: false, reason: 'NO_CONFIRMED_PAYMENT' };
  },

  /**
   * Lista todos os cupons do banco de dados (Coordenação).
   */
  async listAdminCoupons(): Promise<Coupon[]> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/coupons/admin', {
        method: 'GET',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          return data.coupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            discountType: c.discount_type,
            discountValue: c.discount_value,
            maxUses: c.max_uses,
            usedCount: c.used_count || 0,
            expiresAt: c.expires_at,
            active: c.active,
            createdAt: c.created_at,
          }));
        }
      }
    } catch (err) {
      console.error('[paymentRepository] Erro ao buscar cupons da API:', err);
    }
    return [];
  },

  /**
   * Cria novo cupom no banco de dados Supabase (Coordenação).
   */
  async createAdminCoupon(couponData: {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
  }): Promise<{ success: boolean; coupon?: Coupon; message?: string }> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/coupons/admin', {
        method: 'POST',
        headers,
        body: JSON.stringify(couponData),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        const c = data.coupon;
        return {
          success: true,
          coupon: {
            id: c.id,
            code: c.code,
            discountType: c.discount_type,
            discountValue: c.discount_value,
            maxUses: c.max_uses,
            usedCount: c.used_count || 0,
            expiresAt: c.expires_at,
            active: c.active,
            createdAt: c.created_at,
          },
        };
      }
      return { success: false, message: data.message || 'Erro ao criar cupom.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro de conexão.' };
    }
  },

  /**
   * Atualiza status ativo/inativo de um cupom no banco de dados (Coordenação).
   */
  async updateAdminCoupon(
    id: string,
    updates: { active?: boolean; maxUses?: number; expiresAt?: string }
  ): Promise<{ success: boolean; coupon?: Coupon; message?: string }> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/coupons/admin', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        const c = data.coupon;
        return {
          success: true,
          coupon: {
            id: c.id,
            code: c.code,
            discountType: c.discount_type,
            discountValue: c.discount_value,
            maxUses: c.max_uses,
            usedCount: c.used_count || 0,
            expiresAt: c.expires_at,
            active: c.active,
            createdAt: c.created_at,
          },
        };
      }
      return { success: false, message: data.message || 'Erro ao atualizar cupom.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro de conexão.' };
    }
  },

  /**
   * Exclui um cupom no banco de dados (Coordenação).
   */
  async deleteAdminCoupon(id: string): Promise<{ success: boolean; message?: string }> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/coupons/admin?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      return { success: Boolean(data.success), message: data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro de conexão.' };
    }
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
        .select('*, profiles:user_id(name, email, phone)')
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
        userPhone: row.profiles?.phone || row.user_phone,
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
        couponId: row.coupon_id,
        couponCodeSnapshot: row.coupon_code_snapshot,
        originalPriceCents: row.original_price_cents || 3700,
        discountCents: row.discount_cents || 0,
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
    const token = await getAuthToken();

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
