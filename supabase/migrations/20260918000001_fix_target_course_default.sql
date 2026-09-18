-- =========================================================================
-- MIGRAÇÃO: REMOÇÃO DO VALOR DEFAULT 'Medicina' E AJUSTE JORNADA ZERO
-- Data: 2026-09-18
-- Objetivo: Garantir que novos alunos não herdem 'Medicina' como padrão e 
--           que o onboarding seja estritamente individual.
-- Impacto: Não-destrutivo. Preserva todos os dados existentes.
-- =========================================================================

-- 1. Remove o valor DEFAULT 'Medicina' da coluna target_course
ALTER TABLE public.student_profiles 
  ALTER COLUMN target_course DROP DEFAULT;

-- 2. Garante que onboarding_completed tenha DEFAULT false para novos alunos
ALTER TABLE public.student_profiles 
  ALTER COLUMN onboarding_completed SET DEFAULT false;

-- 3. Adiciona campo de auditoria de conclusão do onboarding caso não exista
ALTER TABLE public.student_profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- =========================================================================
-- ROLLBACK (se necessário no futuro):
-- ALTER TABLE public.student_profiles ALTER COLUMN target_course SET DEFAULT 'Medicina';
-- =========================================================================

