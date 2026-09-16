-- ============================================================================
-- ENEM 2026 PRO — FUNÇÕES DE SEGURANÇA, TRIGGERS E RPC ADMINISTRATIVA
-- Migração: 20260916000002_functions_triggers_rpc.sql
-- ============================================================================

-- 1. HELPER: VERIFICAR SE O USUÁRIO ATUAL É ADMINISTRADOR AUTORIZADO
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'ADMINISTRADOR'
      AND status = 'APROVADO'
  );
$$;

-- 2. HELPER: VERIFICAR SE O USUÁRIO ATUAL ESTÁ APROVADO
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'APROVADO'
  );
$$;

-- 3. TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL AO CADASTRAR NO AUTH (SIGNUP)
-- Garante que todo novo aluno nasça como ALUNO e PENDENTE_APROVACAO
-- Impede injeção de roles ou bypass pelo client
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_objective user_target_objective;
  v_phone TEXT;
BEGIN
  -- Extrair metadados opcionais sanitizados do raw_user_meta_data
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  
  -- Normalizar objetivo
  BEGIN
    v_objective := (NEW.raw_user_meta_data->>'objective')::user_target_objective;
  EXCEPTION WHEN OTHERS THEN
    v_objective := 'ENEM'::user_target_objective;
  END;

  -- 1. Cria o registro em public.profiles
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    status,
    phone,
    city,
    state,
    objective,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_name,
    LOWER(NEW.email),
    'ALUNO'::user_role_type,
    'PENDENTE_APROVACAO'::user_status_type,
    v_phone,
    NULL, -- Cidade não informada inicia como NULL (nunca default SP)
    NULL, -- Estado não informado inicia como NULL (nunca default SP)
    v_objective,
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || encode(digest(LOWER(NEW.email), 'sha256'), 'hex'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Cria o perfil do estudante vinculado com onboarding_completed = FALSE
  INSERT INTO public.student_profiles (
    user_id,
    target_course,
    target_university,
    target_score,
    study_hours_per_day,
    study_days_per_week,
    onboarding_completed,
    streak_days,
    xp,
    level,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'Medicina',
    'USP / UNICAMP',
    800,
    4,
    5,
    FALSE, -- Sempre nasce FALSE
    0,
    0,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Cria meta padrão inicial
  INSERT INTO public.student_goals (
    user_id,
    target_daily_hours,
    target_weekly_questions,
    target_monthly_essays,
    target_simulado_score
  ) VALUES (
    NEW.id,
    4.0,
    100,
    4,
    800
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Conectar o trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. RPC ADMINISTRATIVA: admin_set_user_status
-- Permite que apenas administradores autenticados aprovem, reprovem ou bloqueiem usuários
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  p_target_user_id UUID,
  p_new_status user_status_type,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_old_status user_status_type;
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  v_admin_id := auth.uid();

  -- 1. Verificar se quem está chamando é Administrador Aprovado
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: operação permitida exclusivamente para administradores autorizados.';
  END IF;

  -- 2. Não permitir que o admin altere seu próprio status para evitar lockout
  IF v_admin_id = p_target_user_id AND p_new_status != 'APROVADO' THEN
    RAISE EXCEPTION 'Operação inválida: o administrador não pode revogar seu próprio acesso.';
  END IF;

  -- 3. Buscar status anterior
  SELECT status, name, email INTO v_old_status, v_user_name, v_user_email
  FROM public.profiles
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_target_user_id;
  END IF;

  -- 4. Se o status já for o mesmo, retornar sucesso de forma idempotente
  IF v_old_status = p_new_status THEN
    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'user_id', p_target_user_id,
      'status', p_new_status
    );
  END IF;

  -- 5. Atualizar o perfil do usuário
  UPDATE public.profiles
  SET
    status = p_new_status,
    rejection_reason = CASE WHEN p_new_status = 'REPROVADO' THEN p_reason ELSE NULL END,
    approved_at = CASE WHEN p_new_status = 'APROVADO' THEN NOW() ELSE approved_at END,
    approved_by = CASE WHEN p_new_status = 'APROVADO' THEN v_admin_id ELSE approved_by END,
    updated_at = NOW()
  WHERE id = p_target_user_id;

  -- 6. Gravar log de auditoria administrativa imutável
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    v_admin_id,
    'CHANGE_USER_STATUS',
    'USER',
    p_target_user_id::TEXT,
    jsonb_build_object(
      'target_name', v_user_name,
      'target_email', v_user_email,
      'old_status', v_old_status,
      'new_status', p_new_status,
      'reason', p_reason,
      'timestamp', NOW()
    )
  );

  -- 7. Criar notificação interna para o usuário
  IF p_new_status = 'APROVADO' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      p_target_user_id,
      'Cadastro Aprovado! 🎉',
      'Seu acesso à plataforma ENEM 2026 PRO foi liberado pela coordenação. Bons estudos!',
      'success'
    );
  ELSIF p_new_status = 'REPROVADO' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      p_target_user_id,
      'Cadastro em Análise / Recusado',
      COALESCE(p_reason, 'Seu cadastro não foi aprovado pela coordenação.'),
      'alert'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_target_user_id,
    'old_status', v_old_status,
    'new_status', p_new_status,
    'reason', p_reason
  );
END;
$$;
