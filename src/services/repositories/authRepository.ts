import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import { User, StudentProfile } from '../../types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  status?: string;
  requiresEmailConfirmation?: boolean;
}

export const authRepository = {
  async signUp(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    state?: string;
    objective?: 'ENEM' | 'ETEC' | 'VESTIBULAR';
  }): Promise<AuthResponse> {
    const cleanEmail = data.email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            phone: data.phone?.trim() || null,
            city: data.city?.trim() || null,
            state: data.state?.trim() || null,
            objective: data.objective || 'ENEM',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user && !authData.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
          status: 'PENDENTE_APROVACAO',
        };
      }

      // Buscar perfil recém criado pelo trigger
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .maybeSingle();

      const user: User = profile
        ? {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            status: profile.status,
            phone: profile.phone,
            city: profile.city,
            state: profile.state,
            objective: profile.objective,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
          }
        : {
            id: authData.user!.id,
            name: data.name,
            email: cleanEmail,
            role: 'ALUNO',
            status: 'PENDENTE_APROVACAO',
            createdAt: new Date().toISOString(),
          };

      return {
        success: true,
        user,
        status: user.status,
      };
    }

    // Fallback local seguro (dev offline)
    const localRes = db.registerStudent({
      name: data.name,
      email: cleanEmail,
      password: data.password,
      phone: data.phone,
      city: data.city,
      state: data.state,
      objective: data.objective,
    });

    return {
      success: localRes.success,
      user: localRes.user,
      error: localRes.error,
      status: localRes.user?.status,
    };
  },

  async signIn(email: string, pass: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Usuário não encontrado.' };
      }

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (pError || !profile) {
        return { success: false, error: 'Perfil do usuário não encontrado.' };
      }

      const user: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        objective: profile.objective,
        rejectionReason: profile.rejection_reason,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
      };

      if (user.status === 'PENDENTE_APROVACAO') {
        return {
          success: false,
          user,
          status: 'PENDENTE_APROVACAO',
          error: 'Seu cadastro foi recebido com sucesso e está aguardando aprovação da coordenação.',
        };
      }

      if (user.status === 'REPROVADO') {
        return {
          success: false,
          user,
          status: 'REPROVADO',
          error: user.rejectionReason || 'Seu cadastro não foi aprovado pela coordenação.',
        };
      }

      if (user.status === 'BLOQUEADO') {
        return {
          success: false,
          user,
          status: 'BLOQUEADO',
          error: 'Seu acesso está temporariamente bloqueado pela coordenação.',
        };
      }

      return { success: true, user, status: user.status };
    }

    // Fallback local seguro (dev offline sem bypass)
    const localRes = db.login(cleanEmail, pass);
    return {
      success: localRes.success,
      user: localRes.user,
      error: localRes.error,
      status: localRes.status,
    };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    db.setCurrentUser(null);
  },

  async getCurrentSessionUser(): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (!profile) return null;

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        objective: profile.objective,
        rejectionReason: profile.rejection_reason,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
      };
    }

    return db.getCurrentUser();
  },

  async resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    return { success: true };
  },

  async resetPassword(email: string, newPass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (newPass || '').trim();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      } catch (err) {
        console.warn('[authRepository] Erro ao redefinir no Supabase:', err);
      }
    }

    return db.resetPassword(cleanEmail, cleanPass);
  },
};

