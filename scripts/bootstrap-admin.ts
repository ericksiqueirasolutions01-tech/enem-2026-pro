/**
 * ============================================================================
 * ENEM 2026 PRO — BOOTSTRAP DE CONTA ADMINISTRADORA (ONE-SHOT SERVER-SIDE)
 * ============================================================================
 * Este script deve ser executado exclusivamente em ambiente seguro/CI.
 * NUNCA utilize no frontend ou com chave anônima pública.
 * 
 * Requisitos de ambiente:
 * - VITE_SUPABASE_URL (ou SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ADMIN_INITIAL_PASSWORD (fornecida de forma segura pelo operador)
 * - ADMIN_EMAIL (opcional, padrão: ericksiqueiraa@gmail.com)
 */

import { createClient } from '@supabase/supabase-js';

async function bootstrapAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = (process.env.ADMIN_EMAIL || 'ericksiqueiraa@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para o bootstrap.');
    process.exit(1);
  }

  if (!adminPassword || adminPassword.length < 6) {
    console.error('❌ Erro: ADMIN_INITIAL_PASSWORD deve ser fornecido via variável de ambiente (mínimo 6 caracteres).');
    process.exit(1);
  }

  console.log(`🔒 Iniciando bootstrap seguro para administrador: ${adminEmail}...`);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verificar se o usuário já existe no Supabase Auth
  const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Falha ao consultar usuários existentes no Auth:', listError.message);
    process.exit(1);
  }

  const existingUser = usersList.users.find((u) => u.email?.toLowerCase() === adminEmail);
  let userId = existingUser?.id;

  if (existingUser) {
    console.log('ℹ️ Usuário já cadastrado em auth.users. Atualizando credenciais...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: 'Erick Siqueira' },
    });
    if (updateError) {
      console.error('❌ Falha ao atualizar credenciais do administrador:', updateError.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️ Criando novo usuário em auth.users...');
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: 'Erick Siqueira' },
    });
    if (createError || !created.user) {
      console.error('❌ Falha ao criar usuário administrador no Auth:', createError?.message);
      process.exit(1);
    }
    userId = created.user.id;
  }

  // 2. Garantir o perfil com role ADMINISTRADOR e status APROVADO
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      name: 'Erick Siqueira',
      email: adminEmail,
      role: 'ADMINISTRADOR',
      status: 'APROVADO',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('❌ Falha ao atualizar perfil administrativo na tabela profiles:', profileError.message);
    process.exit(1);
  }

  // 3. Registrar no log de auditoria
  await supabaseAdmin
    .from('admin_audit_log')
    .insert({
      admin_id: userId,
      action: 'BOOTSTRAP_ADMIN_USER',
      target_type: 'USER',
      target_id: userId,
      details: {
        email: adminEmail,
        timestamp: new Date().toISOString(),
      },
    });

  console.log('✅ Bootstrap concluído com sucesso!');
  console.log(`✅ Administrador [${adminEmail}] configurado como ADMINISTRADOR e APROVADO.`);
}

bootstrapAdmin().catch((err) => {
  console.error('❌ Erro inesperado no bootstrap:', err);
  process.exit(1);
});

