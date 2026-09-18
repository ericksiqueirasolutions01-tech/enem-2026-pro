import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db } from '../../db/storage';
import { User, StudentProfile, StudentGoals } from '../../types';

export const userRepository = {
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return db.getStudentProfile(userId);

      return {
        id: data.id,
        userId: data.user_id,
        birthDate: data.birth_date,
        state: data.state,
        city: data.city,
        school: data.school,
        targetCourse: data.target_course || '',
        targetUniversity: data.target_university || '',
        targetScore: data.target_score ?? 800,
        studyHoursPerDay: data.study_hours_per_day ?? 4,
        studyDaysPerWeek: data.study_days_per_week ?? 5,
        difficultSubjects: data.difficult_subjects || [],
        examDate: data.exam_date || '2026-11-08',
        onboardingCompleted: !!data.onboarding_completed,
        onboardingCompletedAt: data.onboarding_completed_at,
        streakDays: data.streak_days ?? 0,
        lastStudyDate: data.last_study_date,
        xp: data.xp ?? 0,
        level: data.level ?? 1,
      };
    }

    return db.getStudentProfile(userId);
  },

  async updateProfile(
    userId: string,
    updates: Partial<{
      name: string;
      phone: string;
      city: string;
      state: string;
      objective: 'ENEM' | 'ETEC' | 'VESTIBULAR';
      avatarUrl: string;
    }>
  ): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.state !== undefined) payload.state = updates.state;
      if (updates.objective !== undefined) payload.objective = updates.objective;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

      const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
      return !error;
    }

    const current = db.getCurrentUser();
    if (current && current.id === userId) {
      db.setCurrentUser({ ...current, ...updates });
      return true;
    }
    return false;
  },

  async completeOnboarding(
    userId: string,
    data: {
      targetCourse: string;
      targetUniversity?: string;
      targetScore: number;
      studyHoursPerDay: number;
      studyDaysPerWeek: number;
      difficultSubjects: string[];
      examDate: string;
    }
  ): Promise<boolean> {
    db.completeOnboarding(userId, data);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('student_profiles')
        .update({
          target_course: data.targetCourse,
          target_university: data.targetUniversity || null,
          target_score: data.targetScore,
          study_hours_per_day: data.studyHoursPerDay,
          study_days_per_week: data.studyDaysPerWeek,
          difficult_subjects: data.difficultSubjects,
          exam_date: data.examDate,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return !error;
    }

    return true;
  },
};

