import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import { User, UserStatus } from '../../types';

export interface SetStatusResult {
  success: boolean;
  error?: string;
  idempotent?: boolean;
}

export const adminRepository = {
  async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Falha ao buscar usuários no Supabase:', error);
        return db.getUsers();
      }

      return data.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        status: p.status,
        phone: p.phone,
        city: p.city,
        state: p.state,
        objective: p.objective,
        rejectionReason: p.rejection_reason,
        avatarUrl: p.avatar_url,
        createdAt: p.created_at,
      }));
    }

    return db.getUsers();
  },

  async getPendingUsers(): Promise<User[]> {
    const all = await this.getUsers();
    return all.filter((u) => u.status === 'PENDENTE_APROVACAO');
  },

  async setUserStatus(
    targetUserId: string,
    newStatus: UserStatus,
    reason?: string
  ): Promise<SetStatusResult> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('admin_set_user_status', {
        p_target_user_id: targetUserId,
        p_new_status: newStatus,
        p_reason: reason || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, idempotent: data?.idempotent };
    }

    // Fallback local seguro (dev offline)
    const ok = db.updateUserStatus(targetUserId, newStatus, reason);
    return { success: ok };
  },
};
