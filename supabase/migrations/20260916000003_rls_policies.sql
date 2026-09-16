-- ============================================================================
-- ENEM 2026 PRO — POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- Migração: 20260916000003_rls_policies.sql
-- ============================================================================

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
-- Aluno lê seu próprio perfil; Admin lê todos os perfis
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

-- Aluno pode atualizar apenas seus dados cadastrais permitidos
-- (A integridade de role, status, approved_at e approved_by é protegida por trigger ou restrição de coluna)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );

-- Admin tem permissão total de update em profiles
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. STUDENT_PROFILES
-- ----------------------------------------------------------------------------
CREATE POLICY "student_profiles_select"
  ON public.student_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "student_profiles_update_own"
  ON public.student_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "student_profiles_insert_own"
  ON public.student_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. QUESTÕES (CONTEÚDO PROTEGIDO — EXIGE USUÁRIO APROVADO OU ADMIN)
-- ----------------------------------------------------------------------------
CREATE POLICY "questions_select_approved"
  ON public.questions FOR SELECT
  USING (public.is_approved() OR public.is_admin());

CREATE POLICY "questions_manage_admin"
  ON public.questions FOR ALL
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. SIMULADOS & SIMULADO_QUESTIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "simulados_select_approved"
  ON public.simulados FOR SELECT
  USING ((published = TRUE AND public.is_approved()) OR public.is_admin());

CREATE POLICY "simulados_manage_admin"
  ON public.simulados FOR ALL
  USING (public.is_admin());

CREATE POLICY "simulado_questions_select_approved"
  ON public.simulado_questions FOR SELECT
  USING (public.is_approved() OR public.is_admin());

CREATE POLICY "simulado_questions_manage_admin"
  ON public.simulado_questions FOR ALL
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. TENTATIVAS DE SIMULADO E RESPOSTAS
-- ----------------------------------------------------------------------------
CREATE POLICY "attempts_user_access"
  ON public.simulado_attempts FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "attempt_answers_user_access"
  ON public.attempt_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.simulado_attempts a
      WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.simulado_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. CADERNO DE ERROS (MISTAKES)
-- ----------------------------------------------------------------------------
CREATE POLICY "mistakes_user_access"
  ON public.mistakes FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 7. TAREFAS, SESSÕES E METAS DO ESTUDANTE
-- ----------------------------------------------------------------------------
CREATE POLICY "study_tasks_user_access"
  ON public.study_tasks FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "study_sessions_user_access"
  ON public.study_sessions FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "student_goals_user_access"
  ON public.student_goals FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. PROGRESSO DE TÓPICOS E MATERIAIS
-- ----------------------------------------------------------------------------
CREATE POLICY "topic_progress_user_access"
  ON public.topic_progress FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "material_progress_user_access"
  ON public.material_progress FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 9. FAVORITOS E NOTIFICAÇÕES
-- ----------------------------------------------------------------------------
CREATE POLICY "favorites_user_access"
  ON public.favorites FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_user_access"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 10. CONQUISTAS (ACHIEVEMENTS)
-- ----------------------------------------------------------------------------
CREATE POLICY "achievements_read_all"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "user_achievements_user_access"
  ON public.user_achievements FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 11. TEMAS DE REDAÇÃO, REDAÇÕES E CORREÇÕES
-- ----------------------------------------------------------------------------
CREATE POLICY "essay_topics_select"
  ON public.essay_topics FOR SELECT
  USING ((active = TRUE AND public.is_approved()) OR public.is_admin());

CREATE POLICY "essay_topics_manage_admin"
  ON public.essay_topics FOR ALL
  USING (public.is_admin());

CREATE POLICY "essays_user_access"
  ON public.essays FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "essay_evaluations_access"
  ON public.essay_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.essays e
      WHERE e.id = essay_id AND (e.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- 12. MATERIAIS PROTEGIDOS
-- ----------------------------------------------------------------------------
CREATE POLICY "materials_select_approved"
  ON public.materials FOR SELECT
  USING (public.is_approved() OR public.is_admin());

CREATE POLICY "materials_manage_admin"
  ON public.materials FOR ALL
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. AUDITORIA ADMINISTRATIVA
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_audit_log_admin_only"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin());

