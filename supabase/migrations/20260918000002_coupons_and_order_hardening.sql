-- ============================================================================
-- ENEM 2026 PRO — SCHEMA DE CUPONS, AUDITORIA E BLINDAGEM DE PEDIDOS
-- Migração: 20260918000002_coupons_and_order_hardening.sql
-- ============================================================================

-- 1. TABELA DE CUPONS (COUPONS)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0), -- Percentual (ex: 50 = 50%) ou centavos (ex: 1000 = R$ 10,00)
  max_uses INTEGER DEFAULT NULL CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir que todo código seja gravado em maiúsculas sem espaços
CREATE OR REPLACE FUNCTION public.normalize_coupon_code_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code := UPPER(TRIM(NEW.code));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_coupon_code ON public.coupons;
CREATE TRIGGER trg_normalize_coupon_code
  BEFORE INSERT OR UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_coupon_code_trigger();

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active);

-- 2. TABELA DE RESGATES DE CUPOM (COUPON_REDEMPTIONS)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  discount_cents INTEGER NOT NULL CHECK (discount_cents >= 0),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_coupon_redemption_per_user UNIQUE (coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);

-- 3. AJUSTES E BLINDAGEM NA TABELA DE PEDIDOS (ORDERS)
-- 3.1 Permitir amount_cents = 0 para cupons de 100% de desconto
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_amount_cents_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_cents_check CHECK (amount_cents >= 0);

-- 3.2 Adicionar colunas de rastreamento e snapshot de cupom
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code_snapshot TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS original_price_cents INTEGER NOT NULL DEFAULT 3700;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 4.1 POLÍTICAS RLS PARA CUPONS
-- Aluno não pode listar todos os cupons secretos do sistema; validações ocorrem via RPC ou API
DROP POLICY IF EXISTS "coupons_select_admin" ON public.coupons;
CREATE POLICY "coupons_select_admin"
  ON public.coupons FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "coupons_manage_admin" ON public.coupons;
CREATE POLICY "coupons_manage_admin"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.2 POLÍTICAS RLS PARA RESGATES DE CUPONS
DROP POLICY IF EXISTS "coupon_redemptions_select_own_or_admin" ON public.coupon_redemptions;
CREATE POLICY "coupon_redemptions_select_own_or_admin"
  ON public.coupon_redemptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "coupon_redemptions_manage_admin" ON public.coupon_redemptions;
CREATE POLICY "coupon_redemptions_manage_admin"
  ON public.coupon_redemptions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. RPC ATÔMICA ATUALIZADA: ATIVAÇÃO DE PEDIDO PAGO COM CONTROLE DE CUPONS
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
  -- 1. Localizar o pedido pendente pela external_reference (order_nsu) com bloqueio pessimista
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

  -- 4. Se o pedido utilizou cupom, computar uso definitivo e registrar resgate
  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = used_count + 1, updated_at = v_now
    WHERE id = v_order.coupon_id;

    INSERT INTO public.coupon_redemptions (
      coupon_id,
      user_id,
      order_id,
      discount_cents,
      redeemed_at
    ) VALUES (
      v_order.coupon_id,
      v_user_id,
      v_order.id,
      v_order.discount_cents,
      v_now
    ) ON CONFLICT (coupon_id, user_id) DO NOTHING;
  END IF;

  -- 5. Ativar o status do perfil do usuário para APROVADO
  UPDATE public.profiles
  SET
    status = 'APROVADO',
    approved_at = v_now,
    updated_at = v_now
  WHERE id = v_user_id;

  -- 6. Registrar evento na trilha de auditoria administrativa
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
      'coupon_code', v_order.coupon_code_snapshot,
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

-- 6. RPC ATÔMICA PARA APLICAÇÃO DE CUPOM DE 100% (GRATUITO)
CREATE OR REPLACE FUNCTION public.activate_free_coupon_order(
  p_user_id UUID,
  p_coupon_code TEXT,
  p_external_reference TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_clean_code TEXT := UPPER(TRIM(p_coupon_code));
  v_now TIMESTAMPTZ := NOW();
  v_order_id UUID;
  v_already_redeemed BOOLEAN;
BEGIN
  -- 1. Validar existência e regras do cupom com lock
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = v_clean_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_NOT_FOUND', 'message', 'Cupom não encontrado.');
  END IF;

  IF NOT v_coupon.active THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_INACTIVE', 'message', 'Este cupom foi desativado.');
  END IF;

  IF v_coupon.starts_at > v_now THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_NOT_STARTED', 'message', 'Este cupom ainda não é válido.');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < v_now THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_EXPIRED', 'message', 'Este cupom expirou.');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_LIMIT_REACHED', 'message', 'Este cupom atingiu o limite máximo de usos.');
  END IF;

  -- Validar se é realmente 100% gratuito (Percentual 100% ou fixo >= 3700)
  IF NOT (
    (v_coupon.discount_type = 'PERCENTAGE' AND v_coupon.discount_value >= 100) OR
    (v_coupon.discount_type = 'FIXED' AND v_coupon.discount_value >= 3700)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_NOT_FREE', 'message', 'Este cupom não concede gratuidade total.');
  END IF;

  -- 2. Verificar se o usuário já resgatou este cupom
  SELECT EXISTS (
    SELECT 1 FROM public.coupon_redemptions
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) INTO v_already_redeemed;

  IF v_already_redeemed THEN
    RETURN jsonb_build_object('success', false, 'error', 'COUPON_ALREADY_USED', 'message', 'Você já utilizou este cupom.');
  END IF;

  -- 3. Criar pedido com valor zero e status PAID
  INSERT INTO public.orders (
    user_id,
    provider,
    amount_cents,
    currency,
    status,
    external_reference,
    capture_method,
    paid_at,
    coupon_id,
    coupon_code_snapshot,
    original_price_cents,
    discount_cents,
    metadata
  ) VALUES (
    p_user_id,
    'free_coupon',
    0,
    'BRL',
    'PAID',
    p_external_reference,
    'coupon_100',
    v_now,
    v_coupon.id,
    v_coupon.code,
    3700,
    3700,
    jsonb_build_object('activated_via', 'activate_free_coupon_order', 'coupon_id', v_coupon.id)
  ) RETURNING id INTO v_order_id;

  -- 4. Registrar redenção
  INSERT INTO public.coupon_redemptions (
    coupon_id,
    user_id,
    order_id,
    discount_cents,
    redeemed_at
  ) VALUES (
    v_coupon.id,
    p_user_id,
    v_order_id,
    3700,
    v_now
  );

  -- 5. Incrementar contagem de usos do cupom
  UPDATE public.coupons
  SET used_count = used_count + 1, updated_at = v_now
  WHERE id = v_coupon.id;

  -- 6. Ativar perfil do aluno
  UPDATE public.profiles
  SET
    status = 'APROVADO',
    role = 'ALUNO',
    approved_at = v_now,
    updated_at = v_now
  WHERE id = p_user_id;

  -- 7. Trilha de auditoria
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_user_id,
    target_user_email,
    details
  ) VALUES (
    p_user_id,
    'APROVACAO',
    p_user_id,
    (SELECT email FROM public.profiles WHERE id = p_user_id),
    jsonb_build_object(
      'tipo', 'CUPOM_100_GRATUITO',
      'order_id', v_order_id,
      'coupon_code', v_coupon.code,
      'coupon_id', v_coupon.id,
      'timestamp', v_now
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cupom de 100% aplicado e acesso liberado com sucesso!',
    'order_id', v_order_id,
    'user_id', p_user_id
  );
END;
$$;

