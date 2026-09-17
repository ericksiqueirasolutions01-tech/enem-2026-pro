import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { CreateCheckoutResponse, PaymentStatusResponse, Order, OrderStatus } from '../../types';

export const paymentRepository = {
  /**
   * Solicita a criação do link de checkout InfinitePay (R$ 37,00) para o usuário autenticado.
   */
  async createCheckoutLink(): Promise<CreateCheckoutResponse> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
        message: 'Serviço de autenticação não configurado.',
      };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return {
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Faça login para gerar o link de pagamento.',
      };
    }

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[paymentRepository] Erro ao criar checkout:', err);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err?.message || 'Falha de comunicação com o servidor.',
      };
    }
  },

  /**
   * Consulta o status de um pedido específico ou do pedido mais recente do usuário.
   */
  async checkPaymentStatus(orderId?: string): Promise<PaymentStatusResponse> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      throw new Error('Usuário não autenticado.');
    }

    const url = orderId ? `/api/payments/status?order_id=${encodeURIComponent(orderId)}` : '/api/payments/status';

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Erro na consulta: HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Lista todos os pedidos (para administradores ou histórico do próprio aluno).
   */
  async listOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

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
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase não configurado.' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return { success: false, message: 'Autenticação necessária.' };
    }

    try {
      const res = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          transaction_nsu: transactionNsu,
          slug,
        }),
      });

      return await res.json();
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro na comunicação.' };
    }
  },
};

