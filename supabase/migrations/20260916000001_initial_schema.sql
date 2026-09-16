-- ============================================================================
-- ENEM 2026 PRO — SCHEMA PRINCIPAL DE PRODUÇÃO
-- Migração: 20260916000001_initial_schema.sql
-- ============================================================================

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('ALUNO', 'ADMINISTRADOR', 'PROFESSOR', 'CORRETOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_status_type AS ENUM ('PENDENTE_APROVACAO', 'APROVADO', 'REPROVADO', 'BLOQUEADO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_target_objective AS ENUM ('ENEM', 'ETEC', 'VESTIBULAR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABELA DE PERFIS DE USUÁRIO (CENTRAL)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role_type NOT NULL DEFAULT 'ALUNO',
  status user_status_type NOT NULL DEFAULT 'PENDENTE_APROVACAO',
  document TEXT,
  birth_date DATE,
  phone TEXT,
  city TEXT,
  state TEXT,
  objective user_target_objective DEFAULT 'ENEM',
  rejection_reason TEXT,
  avatar_url TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE PERFIL DE ESTUDANTE
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_course TEXT DEFAULT 'Medicina',
  target_university TEXT DEFAULT 'USP / UNICAMP',
  target_score INTEGER DEFAULT 800,
  study_hours_per_day INTEGER DEFAULT 4,
  study_days_per_week INTEGER DEFAULT 5,
  difficult_subjects JSONB DEFAULT '[]'::jsonb,
  exam_date DATE DEFAULT '2026-11-08',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE DEFAULT CURRENT_DATE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE QUESTÕES
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  external_code TEXT,
  statement TEXT NOT NULL,
  context TEXT,
  support_texts JSONB DEFAULT '[]'::jsonb,
  discipline TEXT NOT NULL,
  area TEXT NOT NULL,
  year INTEGER NOT NULL,
  institution TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('FACIL', 'MEDIO', 'DIFICIL')),
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  resolution TEXT,
  tri_parameters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE SIMULADOS
CREATE TABLE IF NOT EXISTS public.simulados (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  edition TEXT,
  year INTEGER NOT NULL,
  exam_day TEXT,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. QUESTÕES DO SIMULADO (N:N)
CREATE TABLE IF NOT EXISTS public.simulado_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id TEXT NOT NULL REFERENCES public.simulados(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(simulado_id, question_id)
);

-- 7. TENTATIVAS DE SIMULADO
CREATE TABLE IF NOT EXISTS public.simulado_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id TEXT NOT NULL REFERENCES public.simulados(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  score INTEGER,
  tri_score NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RESPOSTAS DA TENTATIVA
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.simulado_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id),
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- 9. CADERNO DE ERROS
CREATE TABLE IF NOT EXISTS public.mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  notes TEXT,
  review_status TEXT NOT NULL DEFAULT 'PRECISA_REVISAR' CHECK (review_status IN ('PRECISA_REVISAR', 'REVISADO', 'DOMINADO')),
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 10. TAREFAS DO CRONOGRAMA DE ESTUDO
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL,
  topic TEXT,
  task_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  duration_minutes INTEGER DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SESSÕES DE ESTUDO (POMODORO / REGISTROS)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. METAS DO ALUNO
CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_daily_hours NUMERIC(4,1) DEFAULT 4.0,
  target_weekly_questions INTEGER DEFAULT 100,
  target_monthly_essays INTEGER DEFAULT 4,
  target_simulado_score INTEGER DEFAULT 800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PROGRESSO POR TÓPICO DO CURRÍCULO
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  discipline TEXT NOT NULL,
  area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NAO_INICIADO',
  mastery_percentage INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 14. PROGRESSO EM MATERIAIS / APOSTILAS
CREATE TABLE IF NOT EXISTS public.material_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NAO_LIDO',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- 15. ITENS FAVORITADOS
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('QUESTAO', 'SIMULADO', 'MATERIAL', 'REDACAO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- 16. NOTIFICAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'alert')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. CONQUISTAS E GAMIFICAÇÃO
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 18. PROPOSTAS DE REDAÇÃO
CREATE TABLE IF NOT EXISTS public.essay_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT,
  motivating_texts JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. REDAÇÕES ENVIADAS
CREATE TABLE IF NOT EXISTS public.essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.essay_topics(id),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CORRIGIDA' CHECK (status IN ('RASCUNHO', 'EM_CORRECAO', 'CORRIGIDA')),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. AVALIAÇÃO DA REDAÇÃO (5 COMPETÊNCIAS ENEM)
CREATE TABLE IF NOT EXISTS public.essay_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id UUID NOT NULL UNIQUE REFERENCES public.essays(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  c1_score INTEGER NOT NULL,
  c2_score INTEGER NOT NULL,
  c3_score INTEGER NOT NULL,
  c4_score INTEGER NOT NULL,
  c5_score INTEGER NOT NULL,
  feedback TEXT,
  in_text_annotations JSONB DEFAULT '[]'::jsonb,
  proposal_elements JSONB DEFAULT '{}'::jsonb,
  is_automated BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. MATERIAIS / APOSTILAS PROTEGIDAS
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  subfolder TEXT,
  mime_type TEXT NOT NULL,
  file_size TEXT,
  storage_path TEXT,
  type TEXT NOT NULL CHECK (type IN ('PDF', 'AUDIO', 'IMAGEM', 'DOCUMENTO')),
  is_protected BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. LOG DE AUDITORIA ADMINISTRATIVA
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
