-- ============================================================================
-- ENEM 2026 PRO — SCHEMA DE PEDIDOS E EVENTOS DE PAGAMENTO (INFINITEPAY)
-- Migração: 20260917000001_orders_payments.sql
-- ============================================================================

-- 1. ENUM DE STATUS DO PEDIDO
DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABELA DE PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'infinitepay',
  amount_cents INTEGER NOT NULL DEFAULT 3700 CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  status order_status_type NOT NULL DEFAULT 'PENDING',
  external_reference TEXT UNIQUE NOT NULL, -- order_nsu enviado para a InfinitePay
  provider_payment_id TEXT, -- transaction_nsu retornado pela InfinitePay
  provider_slug TEXT, -- invoice_slug retornado pela InfinitePay
  checkout_url TEXT,
  receipt_url TEXT,
  capture_method TEXT, -- 'pix' ou 'credit_card'
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance e consulta rápida
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_external_ref ON public.orders(external_reference);
CREATE INDEX IF NOT EXISTS idx_orders_provider_payment_id ON public.orders(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_slug ON public.orders(provider_slug);

-- 3. TABELA DE EVENTOS DE PAGAMENTO (PAYMENT_EVENTS — AUDITORIA E DEDUPLICAÇÃO)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'infinitepay',
  provider_event_id TEXT,
  provider_payment_id TEXT,
  event_type TEXT,
  payload_hash TEXT UNIQUE NOT NULL, -- Hash SHA-256 do payload do webhook para idempotência estrita
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_payment_id ON public.payment_events(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON public.payment_events(processed);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)

-- 5.1 ORDERS
-- Aluno pode consultar apenas seus próprios pedidos
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Apenas backend (Service Role) ou Admin podem criar pedidos
CREATE POLICY "orders_insert_backend"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Atualizações diretas bloqueadas para alunos comuns (apenas Admin ou Service Role)
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5.2 PAYMENT_EVENTS
-- Apenas administradores têm permissão para ler eventos de pagamento
CREATE POLICY "payment_events_select_admin"
  ON public.payment_events FOR SELECT
  USING (public.is_admin());

-- Inserção e atualização via backend (Service Role) ou Admin
CREATE POLICY "payment_events_manage_admin"
  ON public.payment_events FOR ALL
  USING (public.is_admin());

-- 6. RPC ATÔMICA: ATIVAÇÃO DE PEDIDO PAGO E LIBERAÇÃO DE ACESSO DO ALUNO
-- Executada exclusivamente com privilégios de SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.activate_paid_order(
  p_external_reference TEXT,
  p_provider_payment_id TEXT,
  p_provider_slug TEXT,
  p_amount_cents INTEGER,
  p_capture_method TEXT DEFAULT NULL,
  p_receipt_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_user_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Localizar o pedido pendente pela external_reference (order_nsu)
  SELECT * INTO v_order
  FROM public.orders
  WHERE external_reference = p_external_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ORDER_NOT_FOUND',
      'message', 'Pedido não encontrado para a referência informada.'
    );
  END IF;

  v_user_id := v_order.user_id;

  -- 2. Se já estiver pago, retornar sucesso idempotente
  IF v_order.status = 'PAID' THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Pedido já constava como pago.',
      'order_id', v_order.id,
      'user_id', v_user_id
    );
  END IF;

  -- 3. Atualizar o pedido para PAID
  UPDATE public.orders
  SET
    status = 'PAID',
    provider_payment_id = COALESCE(p_provider_payment_id, provider_payment_id),
    provider_slug = COALESCE(p_provider_slug, provider_slug),
    amount_cents = COALESCE(p_amount_cents, amount_cents),
    capture_method = COALESCE(p_capture_method, capture_method),
    receipt_url = COALESCE(p_receipt_url, receipt_url),
    paid_at = v_now,
    updated_at = v_now
  WHERE id = v_order.id;

  -- 4. Ativar o status do perfil do usuário para APROVADO
  UPDATE public.profiles
  SET
    status = 'APROVADO',
    approved_at = v_now,
    updated_at = v_now
  WHERE id = v_user_id;

  -- 5. Registrar evento na trilha de auditoria administrativa
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_user_id,
    target_user_email,
    details
  ) VALUES (
    v_user_id,
    'APROVACAO',
    v_user_id,
    (SELECT email FROM public.profiles WHERE id = v_user_id),
    jsonb_build_object(
      'tipo', 'PAGAMENTO_INFINITEPAY_AUTOMATICO',
      'order_id', v_order.id,
      'external_reference', p_external_reference,
      'amount_cents', p_amount_cents,
      'provider_payment_id', p_provider_payment_id,
      'provider_slug', p_provider_slug,
      'capture_method', p_capture_method,
      'timestamp', v_now
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido confirmado e acesso liberado com sucesso.',
    'order_id', v_order.id,
    'user_id', v_user_id
  );
END;
$$;

