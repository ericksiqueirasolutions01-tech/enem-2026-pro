-- ============================================================================
-- ENEM 2026 PRO — REFORMA TOTAL: TABELA DE PRODUTOS E INTEGRIDADE DE PREÇO
-- Migração: 20260919000001_reforma_products_and_verification.sql
-- ============================================================================

-- 1. TABELA DE PRODUTOS (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir produto oficial da plataforma se não existir
INSERT INTO public.products (code, name, price_cents, active)
VALUES ('ENEM2026_PRO', 'ENEM 2026 PRO — Acesso Completo', 3700, TRUE)
ON CONFLICT (code) DO UPDATE
SET price_cents = 3700, active = TRUE;

-- Habilitar RLS em products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "products_manage_admin" ON public.products;
CREATE POLICY "products_manage_admin"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. VINCULAR PRODUTO ÀS ORDENS E CUPONS (SE COLUNAS NÃO EXISTIREM)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_uses_per_user INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_product_id ON public.coupons(product_id);

