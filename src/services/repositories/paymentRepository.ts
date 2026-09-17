import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import { CreateCheckoutResponse, PaymentStatusResponse, Order, OrderStatus } from '../../types';

export const paymentRepository = {
  /**
   * Solicita a criação do link de checkout InfinitePay (R$ 37,00) para o usuário autenticado.
   * Funciona tanto com Supabase Auth quanto com sessão local/dev.
   */
  async createCheckoutLink(): Promise<CreateCheckoutResponse> {
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
    if (!token && !currentUser) {
      return {
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Faça login para gerar o link de pagamento.',
      };
    }

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
          name: currentUser?.name,
          email: currentUser?.email,
          phone: currentUser?.phone,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[paymentRepository] Erro ao criar checkout:', err);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err?.message || 'Falha de comunicação com o servidor de pagamento.',
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

      if (!res.ok) {
        throw new Error(`Erro na consulta: HTTP ${res.status}`);
      }

      return await res.json();
    } catch {
      // Fallback gracioso
      const currentUser = db.getCurrentUser();
      return {
        success: true,
        orderId: orderId || '',
        status: (currentUser?.status === 'APROVADO' ? 'PAID' : 'PENDING') as OrderStatus,
        isPaid: currentUser?.status === 'APROVADO',
        userStatus: currentUser?.status || 'PENDENTE_APROVACAO',
      };
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

      return await res.json();
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro na comunicação.' };
    }
  },
};
