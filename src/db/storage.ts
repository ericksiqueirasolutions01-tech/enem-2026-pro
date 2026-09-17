import {
  User,
  StudentProfile,
  Question,
  Simulado,
  SimuladoAttempt,
  EssayTopic,
  Essay,
  MistakeNotebookItem,
  StudyPlanTask,
  StudySession,
  Achievement,
  FavoriteItem,
  NotificationItem,
  AreaDoConhecimento,
  Disciplina,
  StudentGoals,
  PdfImportDraft,
  SimuladoCategoria,
  TopicStatus,
  UserStatus,
  UserTargetObjective,
  StudentMaterialProgress,
  MaterialProgressStatus,
  LibraryAreaId,
  Coupon,
  CouponValidationResult,
} from '../types';
import {
  SEED_USERS,
  SEED_ESSAY_TOPICS,
  SEED_ACHIEVEMENTS,
} from './seedData';
import {
  QUESTIONS_ANGLO_SIRIO_2026,
  SIMULADO_ANGLO_SIRIO_2026,
} from './angloSirioData';
import {
  ALL_SEED_QUESTIONS,
  SEED_SIMULADOS,
} from './simuladosData';
import type { DriveMaterial } from './driveMaterialsData';
import { getAllEnrichedMaterials, EnrichedMaterial, classifyMaterial } from './libraryStructure';

const STORAGE_KEYS = {
  CURRENT_USER: 'enem2026_current_user_v3',
  REMEMBER_ME: 'enem2026_remember_me_v3',
  USERS: 'enem2026_users_v3',
  PROFILES: 'enem2026_profiles_v3',
  QUESTIONS: 'enem2026_questions_v3',
  SIMULADOS: 'enem2026_simulados_v3',
  ATTEMPTS: 'enem2026_attempts_v3',
  ESSAY_TOPICS: 'enem2026_essay_topics_v3',
  ESSAYS: 'enem2026_essays_v3',
  MISTAKES: 'enem2026_mistakes_v3',
  STUDY_TASKS: 'enem2026_study_tasks_v3',
  STUDY_SESSIONS: 'enem2026_study_sessions_v3',
  ACHIEVEMENTS: 'enem2026_achievements_v3',
  FAVORITES: 'enem2026_favorites_v3',
  NOTIFICATIONS: 'enem2026_notifications_v3',
  STUDENT_GOALS: 'enem2026_student_goals_v3',
  TOPIC_STATUS: 'enem2026_topic_status_v3',
  PDF_DRAFTS: 'enem2026_pdf_drafts_v3',
  MATERIAL_PROGRESS: 'enem2026_material_progress_v3',
  CUSTOM_LIBRARY_MATERIALS: 'enem2026_custom_library_materials_v3',
  COUPONS: 'enem2026_coupons_v3',
};

export const DEFAULT_UNIVERSAL_COUPONS: Coupon[] = [
  // Bolsas Integrais e Acesso Gratuito (100% OFF)
  { id: 'cpn-bolsa100', code: 'BOLSA100', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-bolsa', code: 'BOLSA', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-gratis100', code: 'GRATIS100', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-gratis', code: 'GRATIS', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-isencao', code: 'ISENCAO', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-isento', code: 'ISENTO', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-100off', code: '100OFF', discountType: 'PERCENTAGE', discountValue: 100, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },

  // Cupons Oficiais ENEM
  { id: 'cpn-enem10', code: 'ENEM10', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-enem20', code: 'ENEM20', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-enem30', code: 'ENEM30', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-enem40', code: 'ENEM40', discountType: 'PERCENTAGE', discountValue: 40, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-enem50', code: 'ENEM50', discountType: 'PERCENTAGE', discountValue: 50, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-enem2026', code: 'ENEM2026', discountType: 'PERCENTAGE', discountValue: 50, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },

  // Cupons Promocionais
  { id: 'cpn-promo10', code: 'PROMO10', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-promo20', code: 'PROMO20', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-promo30', code: 'PROMO30', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-promo50', code: 'PROMO50', discountType: 'PERCENTAGE', discountValue: 50, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },

  // Cupons Desconto
  { id: 'cpn-desconto10', code: 'DESCONTO10', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-desconto20', code: 'DESCONTO20', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-desconto30', code: 'DESCONTO30', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-desconto50', code: 'DESCONTO50', discountType: 'PERCENTAGE', discountValue: 50, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },

  // Variações OFF
  { id: 'cpn-10off', code: '10OFF', discountType: 'PERCENTAGE', discountValue: 10, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-20off', code: '20OFF', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-30off', code: '30OFF', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-50off', code: '50OFF', discountType: 'PERCENTAGE', discountValue: 50, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },

  // Campanhas especiais
  { id: 'cpn-medicina', code: 'MEDICINA', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-medicina2026', code: 'MEDICINA2026', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-aprovado', code: 'APROVADO', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-aprovacao', code: 'APROVACAO', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-vip2026', code: 'VIP2026', discountType: 'PERCENTAGE', discountValue: 30, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cpn-aluno2026', code: 'ALUNO2026', discountType: 'PERCENTAGE', discountValue: 20, maxUses: 99999, usedCount: 0, expiresAt: null, active: true, createdAt: '2026-01-01T00:00:00.000Z' },
];

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initSeedData();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Erro ao salvar ${key}:`, e);
    }
  }

  private initSeedData() {
    // Limpeza de chaves antigas de versões anteriores (v1 e v2)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('enem2026_') && (k.includes('_v1') || k.includes('_v2'))) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch {}

    // Sincronizar usuários de semente (incluindo administradores e perfis)
    const existingUsers = this.get<User[]>(STORAGE_KEYS.USERS, []);
    const userMap = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u]));
    SEED_USERS.forEach((s) => {
      const emailLower = s.user.email.toLowerCase();
      if (!userMap.has(emailLower)) {
        userMap.set(emailLower, { ...s.user });
      } else {
        const current = userMap.get(emailLower)!;
        if (s.user.role === 'ADMINISTRADOR') {
          userMap.set(emailLower, {
            ...current,
            role: 'ADMINISTRADOR',
            status: 'APROVADO',
          });
        }
      }
    });
    this.set(STORAGE_KEYS.USERS, Array.from(userMap.values()));

    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      const profiles: StudentProfile[] = SEED_USERS.filter((u) => u.profile).map((u) => ({
        ...u.profile!,
      }));
      this.set(STORAGE_KEYS.PROFILES, profiles);
    }

    // Inicializar ou sincronizar Banco de Questões com novas questões
    const existingQuestions = this.get<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    const qMap = new Map(existingQuestions.map((q) => [q.id, q]));
    ALL_SEED_QUESTIONS.forEach((q) => {
      if (!qMap.has(q.id)) {
        qMap.set(q.id, q);
      }
    });
    this.set(STORAGE_KEYS.QUESTIONS, Array.from(qMap.values()));

    // Inicializar ou sincronizar Simulados 2026
    const existingSimulados = this.get<Simulado[]>(STORAGE_KEYS.SIMULADOS, []);
    const simMap = new Map(existingSimulados.map((s) => [s.id, s]));
    SEED_SIMULADOS.forEach((s) => {
      if (!simMap.has(s.id)) {
        simMap.set(s.id, s);
      }
    });
    this.set(STORAGE_KEYS.SIMULADOS, Array.from(simMap.values()));

    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      this.set(STORAGE_KEYS.ATTEMPTS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.MISTAKES)) {
      this.set(STORAGE_KEYS.MISTAKES, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS)) {
      this.set(STORAGE_KEYS.STUDY_SESSIONS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ESSAYS)) {
      this.set(STORAGE_KEYS.ESSAYS, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ESSAY_TOPICS)) {
      this.set(STORAGE_KEYS.ESSAY_TOPICS, SEED_ESSAY_TOPICS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      this.set(STORAGE_KEYS.ACHIEVEMENTS, SEED_ACHIEVEMENTS);
    }

    // Metas de estudo do estudante
    if (!localStorage.getItem(STORAGE_KEYS.STUDENT_GOALS)) {
      const demoGoals: StudentGoals = {
        id: 'goals-demo',
        userId: 'demo-student-01',
        targetCourse: 'Medicina',
        targetUniversity: 'USP / UNICAMP / SISU',
        targetScore: 820,
        weeklyQuestionsGoal: 200,
        weeklyQuestionsDone: 145,
        weeklyHoursGoal: 25,
        weeklyHoursDone: 18,
        monthlySimuladosGoal: 4,
        monthlySimuladosDone: 2,
        focusDisciplines: ['Matemática', 'Física', 'Química', 'Biologia'],
        updatedAt: new Date().toISOString(),
      };
      this.set(STORAGE_KEYS.STUDENT_GOALS, [demoGoals]);
    }

    // Rascunhos de importação PDF para o Painel Admin
    if (!localStorage.getItem(STORAGE_KEYS.PDF_DRAFTS)) {
      const initialDraft: PdfImportDraft = {
        id: 'draft-poliedro-2026-d1',
        title: '1º Poliedro ENEM 2026 — Dia 1 (Importação Inicial)',
        institution: 'Poliedro Educação',
        year: 2026,
        category: 'ENEM_2026',
        day: 'DIA_1',
        totalQuestions: 90,
        timeLimitMinutes: 330,
        examPdfName: '1° POLIEDRO 2026 - D1.pdf',
        answerKeyPdfName: '1° POLIEDRO 2026 - GAB D1.pdf',
        status: 'RASCUNHO_PENDENTE',
        questionsDraft: [
          {
            statement: 'Enunciado extraído do arquivo 1° POLIEDRO 2026 - D1.pdf para validação pedagógica...',
            correctOption: 'B',
            discipline: 'Português',
            area: 'LINGUAGENS',
            difficulty: 'MEDIO',
          }
        ],
        createdAt: new Date().toISOString(),
      };
      this.set(STORAGE_KEYS.PDF_DRAFTS, [initialDraft]);
    }

    // Visitantes entram deslogados por padrão para sempre ver a Landing Page institucional primeiro
    // Nenhum usuário é auto-logado na inicialização.

    // Inicializar plano de estudo default se vazio
    const tasks = this.get<StudyPlanTask[]>(STORAGE_KEYS.STUDY_TASKS, []);
    if (tasks.length === 0) {
      this.generateDefaultStudyPlan();
    }

    // Inicializar cupons default se vazio
    const existingCoupons = this.get<Coupon[]>(STORAGE_KEYS.COUPONS, []);
    if (existingCoupons.length === 0) {
      this.set(STORAGE_KEYS.COUPONS, DEFAULT_UNIVERSAL_COUPONS);
    }
  }

  public resetSystem(): void {
    const users: User[] = SEED_USERS.map((u) => u.user);
    const profiles: StudentProfile[] = SEED_USERS.filter((u) => u.profile).map((u) => ({
      ...u.profile!,
      streakDays: 0,
      xp: 0,
      level: 1,
    }));
    this.set(STORAGE_KEYS.USERS, users);
    this.set(STORAGE_KEYS.PROFILES, profiles);
    this.set(STORAGE_KEYS.QUESTIONS, ALL_SEED_QUESTIONS);
    this.set(STORAGE_KEYS.SIMULADOS, SEED_SIMULADOS);
    this.set(STORAGE_KEYS.ATTEMPTS, []);
    this.set(STORAGE_KEYS.MISTAKES, []);
    this.set(STORAGE_KEYS.STUDY_SESSIONS, []);
    this.set(STORAGE_KEYS.ESSAYS, []);
    this.set(STORAGE_KEYS.FAVORITES, []);
    this.set(STORAGE_KEYS.NOTIFICATIONS, []);
    this.notify();
  }

  // ==========================================
  // AUTENTICAÇÃO E USUÁRIOS
  // ==========================================
  public getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public getStudentProfile(userId: string): StudentProfile | null {
    const profiles = this.get<StudentProfile[]>(STORAGE_KEYS.PROFILES, []);
    return profiles.find((p) => p.userId === userId) || null;
  }

  public setCurrentUser(user: User | null, rememberMe: boolean = true) {
    if (user) {
      this.set(STORAGE_KEYS.CURRENT_USER, user);
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      this.notify();
    }
  }

  public login(
    email: string,
    pass: string
  ): { success: boolean; user?: User; error?: string; status?: UserStatus } {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    const cleanEmail = email.trim().toLowerCase();

    // Procura no cadastro do usuário com conferência estrita de senha (sem bypass)
    const targetUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        Boolean(u.password) &&
        u.password === pass
    );

    if (!targetUser) {
      return {
        success: false,
        error: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
      };
    }

    this.setCurrentUser(targetUser, true);

    if (targetUser.status === 'PENDENTE_APROVACAO') {
      return {
        success: false,
        user: targetUser,
        status: 'PENDENTE_APROVACAO',
        error: 'Seu cadastro foi recebido com sucesso e está aguardando aprovação da coordenação administrativa.',
      };
    }

    if (targetUser.status === 'REPROVADO') {
      return {
        success: false,
        user: targetUser,
        status: 'REPROVADO',
        error: targetUser.rejectionReason || 'Seu cadastro não foi aprovado pela coordenação.',
      };
    }

    if (targetUser.status === 'BLOQUEADO') {
      return {
        success: false,
        user: targetUser,
        status: 'BLOQUEADO',
        error: 'Seu acesso está temporariamente bloqueado pela coordenação.',
      };
    }

    return { success: true, user: targetUser, status: targetUser.status };
  }

  public registerStudent(data: {
    name: string;
    email: string;
    password?: string;
    document?: string;
    birthDate?: string;
    phone?: string;
    city?: string;
    state?: string;
    objective?: UserTargetObjective;
    school?: string;
    targetCourse?: string;
    targetUniversity?: string;
    targetScore?: number;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Já existe um cadastro registrado com este e-mail.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'ALUNO',
      status: 'PENDENTE_APROVACAO',
      password: data.password,
      document: data.document?.trim(),
      birthDate: data.birthDate,
      phone: data.phone?.trim(),
      city: data.city?.trim() || undefined,
      state: data.state?.trim() || undefined,
      objective: data.objective || 'ENEM',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      createdAt: new Date().toISOString(),
    };

    const newProfile: StudentProfile = {
      id: `prof-${Date.now()}`,
      userId: newUser.id,
      birthDate: data.birthDate,
      state: data.state?.trim() || undefined,
      city: data.city?.trim() || undefined,
      school: data.school,
      targetCourse: data.targetCourse || (data.objective === 'ETEC' ? 'Técnico em Desenvolvimento' : 'Medicina / Geral'),
      targetUniversity: data.targetUniversity || (data.objective === 'ETEC' ? 'ETEC / CPS' : 'ENEM / SISU'),
      targetScore: data.targetScore || 800,
      studyHoursPerDay: 4,
      studyDaysPerWeek: 5,
      difficultSubjects: [],
      examDate: '2026-11-08',
      onboardingCompleted: false,
      streakDays: 0,
      lastStudyDate: new Date().toISOString().split('T')[0],
      xp: 0,
      level: 1,
    };

    const profiles = this.get<StudentProfile[]>(STORAGE_KEYS.PROFILES, []);
    this.set(STORAGE_KEYS.USERS, [...users, newUser]);
    this.set(STORAGE_KEYS.PROFILES, [...profiles, newProfile]);
    this.setCurrentUser(newUser, true);

    return { success: true, user: newUser };
  }

  // ==========================================
  // GESTÃO ADMINISTRATIVA DE USUÁRIOS
  // ==========================================
  public getPendingUsers(): User[] {
    return this.getUsers().filter((u) => u.status === 'PENDENTE_APROVACAO');
  }

  public approveUser(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], status: 'APROVADO', rejectionReason: undefined };
      this.set(STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  }

  public reproveUser(userId: string, reason?: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        status: 'REPROVADO',
        rejectionReason: reason || 'Cadastro não aprovado pela administração.',
      };
      this.set(STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  }

  public updateUserStatus(userId: string, status: UserStatus, reason?: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        status,
        rejectionReason: reason,
      };
      this.set(STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  }

  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, []);
  }

  public getProfiles(): StudentProfile[] {
    return this.get<StudentProfile[]>(STORAGE_KEYS.PROFILES, []);
  }

  public updateProfile(userId: string, updates: Partial<StudentProfile>): void {
    const profiles = this.get<StudentProfile[]>(STORAGE_KEYS.PROFILES, []);
    const index = profiles.findIndex((p) => p.userId === userId);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updates };
      this.set(STORAGE_KEYS.PROFILES, profiles);
    }
  }

  public completeOnboarding(
    userId: string,
    data: {
      targetCourse: string;
      targetScore: number;
      studyHoursPerDay: number;
      studyDaysPerWeek: number;
      difficultSubjects: string[];
      examDate?: string;
    }
  ): void {
    this.updateProfile(userId, {
      ...data,
      onboardingCompleted: true,
    });
    this.addXp(userId, 150, 'Completou o onboarding inicial');
  }

  public addXp(userId: string, amount: number, reason?: string) {
    const profile = this.getStudentProfile(userId);
    if (!profile) return;

    const newXp = (profile.xp || 0) + amount;
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

    this.updateProfile(userId, {
      xp: newXp,
      level: newLevel,
    });

    if (reason) {
      this.addNotification({
        userId,
        title: `+${amount} XP Conquistado!`,
        message: reason,
        type: 'success',
      });
    }
  }

  // ==========================================
  // BANCO DE QUESTÕES
  // ==========================================
  public getQuestions(filters?: {
    area?: AreaDoConhecimento;
    discipline?: Disciplina;
    topic?: string;
    difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL';
    year?: number;
    search?: string;
  }): Question[] {
    let list = this.get<Question[]>(STORAGE_KEYS.QUESTIONS, []);

    if (filters) {
      if (filters.area) list = list.filter((q) => q.area === filters.area);
      if (filters.discipline) list = list.filter((q) => q.discipline === filters.discipline);
      if (filters.topic) list = list.filter((q) => q.topic.toLowerCase() === filters.topic!.toLowerCase());
      if (filters.difficulty) list = list.filter((q) => q.difficulty === filters.difficulty);
      if (filters.year) list = list.filter((q) => q.year === filters.year);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (q) =>
            q.statement.toLowerCase().includes(s) ||
            q.topic.toLowerCase().includes(s) ||
            q.discipline.toLowerCase().includes(s)
        );
      }
    }

    return list;
  }

  public getQuestionById(id: string): Question | null {
    const list = this.getQuestions();
    return list.find((q) => q.id === id) || null;
  }

  public saveQuestion(question: Question): void {
    const list = this.getQuestions();
    const index = list.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      list[index] = question;
    } else {
      list.unshift(question);
    }
    this.set(STORAGE_KEYS.QUESTIONS, list);
  }

  public deleteQuestion(id: string): void {
    const list = this.getQuestions().filter((q) => q.id !== id);
    this.set(STORAGE_KEYS.QUESTIONS, list);
  }

  // ==========================================
  // SIMULADOS
  // ==========================================
  public getSimulados(): Simulado[] {
    return this.get<Simulado[]>(STORAGE_KEYS.SIMULADOS, []);
  }

  public getSimuladosByCategory(category: SimuladoCategoria): Simulado[] {
    return this.getSimulados().filter((s) => s.category === category);
  }

  public getSimuladosByDay(day: 'DIA_1' | 'DIA_2'): Simulado[] {
    return this.getSimulados().filter((s) => s.category === 'ENEM_2026' && s.day === day);
  }

  public getSimuladoById(id: string): Simulado | null {
    const list = this.getSimulados();
    return list.find((s) => s.id === id) || null;
  }

  public saveSimulado(simulado: Simulado): void {
    const list = this.getSimulados();
    const index = list.findIndex((s) => s.id === simulado.id);
    if (index >= 0) {
      list[index] = simulado;
    } else {
      list.unshift(simulado);
    }
    this.set(STORAGE_KEYS.SIMULADOS, list);
  }

  public deleteSimulado(id: string): void {
    const list = this.getSimulados().filter((s) => s.id !== id);
    this.set(STORAGE_KEYS.SIMULADOS, list);
  }

  public duplicateSimulado(id: string): Simulado | null {
    const original = this.getSimuladoById(id);
    if (!original) return null;
    const duplicated: Simulado = {
      ...original,
      id: `sim-${Date.now()}`,
      title: `${original.title} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    this.saveSimulado(duplicated);
    return duplicated;
  }

  // ==========================================
  // TENTATIVAS DE SIMULADO E HISTÓRICO
  // ==========================================
  public getAttempts(userId?: string): SimuladoAttempt[] {
    const list = this.get<SimuladoAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
    return userId ? list.filter((a) => a.userId === userId) : list;
  }

  public saveAttempt(attempt: SimuladoAttempt): void {
    const list = this.getAttempts();
    list.unshift(attempt);
    this.set(STORAGE_KEYS.ATTEMPTS, list);

    // Registra questões erradas no Caderno de Erros automaticamente
    Object.entries(attempt.answers).forEach(([questionId, ans]) => {
      const q = this.getQuestionById(questionId);
      if (q && !ans.isCorrect && ans.selectedOption) {
        this.logMistake(attempt.userId, q, ans.selectedOption);
      }
    });

    // Recompensa XP
    this.addXp(attempt.userId, 200, `Concluiu o simulado: ${attempt.simulationTitle}`);
  }

  // ==========================================
  // CADERNO DE ERROS
  // ==========================================
  public getMistakes(userId: string): MistakeNotebookItem[] {
    const list = this.get<MistakeNotebookItem[]>(STORAGE_KEYS.MISTAKES, []);
    return list.filter((m) => m.userId === userId);
  }

  public logMistake(
    userId: string,
    question: Question,
    selectedOption: 'A' | 'B' | 'C' | 'D' | 'E'
  ): void {
    const list = this.get<MistakeNotebookItem[]>(STORAGE_KEYS.MISTAKES, []);
    const existing = list.find((m) => m.userId === userId && m.questionId === question.id);

    if (existing) {
      existing.timesFailed += 1;
      existing.selectedOption = selectedOption;
      existing.failedAt = new Date().toISOString();
      existing.isMastered = false;
    } else {
      list.unshift({
        id: `mst-${Date.now()}-${question.id}`,
        userId,
        questionId: question.id,
        question,
        selectedOption,
        correctOption: question.correctOption,
        failedAt: new Date().toISOString(),
        timesFailed: 1,
        timesReviewed: 0,
        isMastered: false,
      });
    }
    this.set(STORAGE_KEYS.MISTAKES, list);
  }

  public markMistakeMastered(userId: string, questionId: string): void {
    const list = this.get<MistakeNotebookItem[]>(STORAGE_KEYS.MISTAKES, []);
    const item = list.find((m) => m.userId === userId && m.questionId === questionId);
    if (item) {
      item.isMastered = true;
      item.timesReviewed += 1;
      item.lastMasteredAt = new Date().toISOString();
      this.set(STORAGE_KEYS.MISTAKES, list);
      this.addXp(userId, 75, `Dominou a questão de ${item.question.discipline}!`);
    }
  }

  // ==========================================
  // TEMAS DE REDAÇÃO E REDAÇÕES
  // ==========================================
  public getEssayTopics(): EssayTopic[] {
    return this.get<EssayTopic[]>(STORAGE_KEYS.ESSAY_TOPICS, []);
  }

  public getEssayTopicById(id: string): EssayTopic | null {
    const list = this.getEssayTopics();
    return list.find((t) => t.id === id) || null;
  }

  public getRandomEssayTopic(): EssayTopic | null {
    const list = this.getEssayTopics();
    if (list.length === 0) return null;
    const rand = Math.floor(Math.random() * list.length);
    return list[rand];
  }

  public saveEssayTopic(topic: EssayTopic): void {
    const list = this.getEssayTopics();
    const index = list.findIndex((t) => t.id === topic.id);
    if (index >= 0) {
      list[index] = topic;
    } else {
      list.unshift(topic);
    }
    this.set(STORAGE_KEYS.ESSAY_TOPICS, list);
  }

  public deleteEssayTopic(id: string): void {
    const list = this.getEssayTopics().filter((t) => t.id !== id);
    this.set(STORAGE_KEYS.ESSAY_TOPICS, list);
  }

  public getEssays(userId?: string): Essay[] {
    const list = this.get<Essay[]>(STORAGE_KEYS.ESSAYS, []);
    return userId ? list.filter((e) => e.userId === userId) : list;
  }

  public getEssayById(id: string): Essay | null {
    const list = this.getEssays();
    return list.find((e) => e.id === id) || null;
  }

  public saveEssay(essay: Essay): void {
    const list = this.getEssays();
    const index = list.findIndex((e) => e.id === essay.id);
    if (index >= 0) {
      list[index] = essay;
    } else {
      list.unshift(essay);
    }
    this.set(STORAGE_KEYS.ESSAYS, list);

    if (essay.status === 'CORRECTED' && essay.correction) {
      this.addXp(essay.userId, 250, `Redação corrigida por IA: ${essay.correction.totalScore} pontos`);
    }
  }

  // ==========================================
  // PLANO DE ESTUDOS E SESSÕES
  // ==========================================
  public getStudyPlanTasks(dayOfWeek?: number): StudyPlanTask[] {
    const list = this.get<StudyPlanTask[]>(STORAGE_KEYS.STUDY_TASKS, []);
    if (dayOfWeek !== undefined) {
      return list.filter((t) => t.dayOfWeek === dayOfWeek);
    }
    return list;
  }

  public toggleTaskCompleted(taskId: string): void {
    const list = this.getStudyPlanTasks();
    const task = list.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : undefined;
      this.set(STORAGE_KEYS.STUDY_TASKS, list);
    }
  }

  public generateDefaultStudyPlan(): void {
    const plan: StudyPlanTask[] = [
      { id: 'tsk-1', dayOfWeek: 1, dayName: 'Segunda-feira', area: 'MATEMATICA', discipline: 'Matemática', topic: 'Funções e Álgebra', durationMinutes: 60, targetQuestions: 20, completed: false },
      { id: 'tsk-2', dayOfWeek: 1, dayName: 'Segunda-feira', area: 'CIENCIAS_DA_NATUREZA', discipline: 'Biologia', topic: 'Ecologia e Cadeias Tróficas', durationMinutes: 45, targetQuestions: 15, completed: false },
      { id: 'tsk-3', dayOfWeek: 2, dayName: 'Terça-feira', area: 'REDACAO', discipline: 'Redação', topic: 'Treino de Redação - Tema Oficial', durationMinutes: 90, targetQuestions: 0, completed: false },
      { id: 'tsk-4', dayOfWeek: 2, dayName: 'Terça-feira', area: 'CIENCIAS_HUMANAS', discipline: 'História', topic: 'Era Vargas e Cidadania', durationMinutes: 45, targetQuestions: 15, completed: false },
      { id: 'tsk-5', dayOfWeek: 3, dayName: 'Quarta-feira', area: 'CIENCIAS_DA_NATUREZA', discipline: 'Física', topic: 'Eletrodinâmica e Circuitos', durationMinutes: 60, targetQuestions: 20, completed: false },
      { id: 'tsk-6', dayOfWeek: 3, dayName: 'Quarta-feira', area: 'LINGUAGENS', discipline: 'Português', topic: 'Funções da Linguagem', durationMinutes: 45, targetQuestions: 15, completed: false },
      { id: 'tsk-7', dayOfWeek: 4, dayName: 'Quinta-feira', area: 'CIENCIAS_DA_NATUREZA', discipline: 'Química', topic: 'Termoquímica e Estequiometria', durationMinutes: 60, targetQuestions: 20, completed: false },
      { id: 'tsk-8', dayOfWeek: 4, dayName: 'Quinta-feira', area: 'CIENCIAS_HUMANAS', discipline: 'Geografia', topic: 'Urbanização Brasileira', durationMinutes: 45, targetQuestions: 15, completed: false },
      { id: 'tsk-9', dayOfWeek: 5, dayName: 'Sexta-feira', area: 'MATEMATICA', discipline: 'Matemática', topic: 'Geometria Espacial e Volumes', durationMinutes: 60, targetQuestions: 20, completed: false },
      { id: 'tsk-10', dayOfWeek: 5, dayName: 'Sexta-feira', area: 'LINGUAGENS', discipline: 'Literatura', topic: 'Realismo e Modernismo', durationMinutes: 45, targetQuestions: 15, completed: false },
      { id: 'tsk-11', dayOfWeek: 6, dayName: 'Sábado', area: 'MATEMATICA', discipline: 'Matemática', topic: 'Simulado de Treino Rápido', durationMinutes: 90, targetQuestions: 30, completed: false },
    ];
    this.set(STORAGE_KEYS.STUDY_TASKS, plan);
  }

  public recordStudySession(session: Omit<StudySession, 'id'>): void {
    const list = this.get<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    const newSession: StudySession = {
      ...session,
      id: `ses-${Date.now()}`,
    };
    list.unshift(newSession);
    this.set(STORAGE_KEYS.STUDY_SESSIONS, list);

    // XP por tempo estudado: 10 XP por cada 15 min
    const xpEarned = Math.max(10, Math.floor(session.durationMinutes / 15) * 10);
    this.addXp(session.userId, xpEarned, `Sessão de estudos concluída: ${session.durationMinutes} minutos de ${session.discipline}`);
  }

  public getStudySessions(userId?: string): StudySession[] {
    const list = this.get<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    return userId ? list.filter((s) => s.userId === userId) : list;
  }

  // ==========================================
  // CONQUISTAS E GAMIFICAÇÃO
  // ==========================================
  public getAchievements(): Achievement[] {
    return this.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
  }

  // ==========================================
  // FAVORITOS
  // ==========================================
  public getFavorites(userId: string): FavoriteItem[] {
    const list = this.get<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
    return list.filter((f) => f.userId === userId);
  }

  public isFavorite(userId: string, targetId: string): boolean {
    return this.getFavorites(userId).some((f) => f.targetId === targetId);
  }

  public toggleFavorite(userId: string, item: { targetId: string; type: 'QUESTION' | 'ESSAY_TOPIC' | 'TOPIC'; title: string; subtitle: string }): boolean {
    let list = this.get<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
    const exists = list.some((f) => f.userId === userId && f.targetId === item.targetId);

    if (exists) {
      list = list.filter((f) => !(f.userId === userId && f.targetId === item.targetId));
      this.set(STORAGE_KEYS.FAVORITES, list);
      return false;
    } else {
      list.unshift({
        id: `fav-${Date.now()}`,
        userId,
        ...item,
        createdAt: new Date().toISOString(),
      });
      this.set(STORAGE_KEYS.FAVORITES, list);
      return true;
    }
  }

  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================
  public getNotifications(userId: string): NotificationItem[] {
    const list = this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return list.filter((n) => n.userId === userId);
  }

  public addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const list = this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    list.unshift({
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  public markNotificationRead(id: string): void {
    const list = this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const n = list.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  // ==========================================
  // ESTATÍSTICAS E DASHBOARD DO ALUNO
  // ==========================================
  public getStudentDashboardStats(userId: string) {
    const profile = this.getStudentProfile(userId);
    const attempts = this.getAttempts(userId);
    const essays = this.getEssays(userId).filter((e) => e.status === 'CORRECTED');
    const sessions = this.getStudySessions(userId);
    const mistakes = this.getMistakes(userId);

    // Cálculos de Questões respondidas em simulados
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;

    const areaStats: Record<AreaDoConhecimento, { total: number; correct: number }> = {
      LINGUAGENS: { total: 0, correct: 0 },
      CIENCIAS_HUMANAS: { total: 0, correct: 0 },
      CIENCIAS_DA_NATUREZA: { total: 0, correct: 0 },
      MATEMATICA: { total: 0, correct: 0 },
      REDACAO: { total: 0, correct: 0 },
    };

    attempts.forEach((att) => {
      totalQuestionsAnswered += att.totalQuestions - att.unansweredCount;
      totalCorrectAnswers += att.correctCount;

      Object.entries(att.areaScores || {}).forEach(([area, val]) => {
        if (areaStats[area as AreaDoConhecimento]) {
          areaStats[area as AreaDoConhecimento].total += val.total;
          areaStats[area as AreaDoConhecimento].correct += val.correct;
        }
      });
    });

    const accuracyRate = totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
      : 0;

    const totalHours = Math.round(
      sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60
    );

    const essaysAverage = essays.length > 0
      ? Math.round(essays.reduce((acc, e) => acc + (e.correction?.totalScore || 0), 0) / essays.length)
      : 0;

    // Cálculo dos dias restantes para o ENEM 2026 (08/11/2026)
    const examDate = new Date('2026-11-08T08:00:00');
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    const daysUntilExam = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Determina desempenho por área baseado nas respostas
    const calcRate = (area: AreaDoConhecimento) => {
      const a = areaStats[area];
      return a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
    };

    const areasWithScore = [
      { name: 'Matemática', area: 'MATEMATICA', rate: calcRate('MATEMATICA') },
      { name: 'Ciências Humanas', area: 'CIENCIAS_HUMANAS', rate: calcRate('CIENCIAS_HUMANAS') },
      { name: 'Linguagens', area: 'LINGUAGENS', rate: calcRate('LINGUAGENS') },
      { name: 'Ciências da Natureza', area: 'CIENCIAS_DA_NATUREZA', rate: calcRate('CIENCIAS_DA_NATUREZA') },
    ];

    const sortedAreas = [...areasWithScore].sort((a, b) => b.rate - a.rate);

    return {
      daysUntilExam,
      profile,
      totalSimulados: attempts.length,
      totalQuestionsAnswered: totalQuestionsAnswered,
      accuracyRate,
      essaysCount: essays.length,
      essaysAverage,
      totalHoursStudied: totalHours,
      streakDays: profile?.streakDays || 0,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      bestArea: sortedAreas[0],
      weakArea: sortedAreas[sortedAreas.length - 1],
      areasOverview: areasWithScore,
      mistakesCount: mistakes.filter((m) => !m.isMastered).length,
    };
  }

  // ==========================================
  // METAS DO ESTUDANTE
  // ==========================================
  public getStudentGoals(userId: string): StudentGoals {
    const list = this.get<StudentGoals[]>(STORAGE_KEYS.STUDENT_GOALS, []);
    const existing = list.find((g) => g.userId === userId);
    if (existing) return existing;

    const defaultGoals: StudentGoals = {
      id: `goals-${userId}`,
      userId,
      targetCourse: 'Medicina',
      targetUniversity: 'USP / UNICAMP / ENEM',
      targetScore: 820,
      weeklyQuestionsGoal: 200,
      weeklyQuestionsDone: 145,
      weeklyHoursGoal: 25,
      weeklyHoursDone: 18,
      monthlySimuladosGoal: 4,
      monthlySimuladosDone: 2,
      focusDisciplines: ['Matemática', 'Física', 'Química', 'Biologia'],
      updatedAt: new Date().toISOString(),
    };
    list.push(defaultGoals);
    this.set(STORAGE_KEYS.STUDENT_GOALS, list);
    return defaultGoals;
  }

  public saveStudentGoals(goals: StudentGoals): void {
    const list = this.get<StudentGoals[]>(STORAGE_KEYS.STUDENT_GOALS, []);
    const index = list.findIndex((g) => g.userId === goals.userId);
    if (index >= 0) {
      list[index] = { ...goals, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...goals, updatedAt: new Date().toISOString() });
    }
    this.set(STORAGE_KEYS.STUDENT_GOALS, list);
  }

  // ==========================================
  // STATUS E PROGRESSO DOS TÓPICOS POR MATÉRIA
  // ==========================================
  public getTopicStatusMap(userId: string): Record<string, TopicStatus> {
    const allMaps = this.get<Record<string, Record<string, any>>>(STORAGE_KEYS.TOPIC_STATUS, {});
    return allMaps[userId] || {};
  }

  public setTopicStatus(
    userId: string,
    topicId: string,
    status: TopicStatus
  ): void {
    const allMaps = this.get<Record<string, Record<string, any>>>(STORAGE_KEYS.TOPIC_STATUS, {});
    if (!allMaps[userId]) {
      allMaps[userId] = {};
    }
    allMaps[userId][topicId] = status;
    this.set(STORAGE_KEYS.TOPIC_STATUS, allMaps);

    if (status === 'DOMINADO') {
      this.addXp(userId, 60, 'Dominou um tópico de estudos!');
    } else if (status === 'REVISADO') {
      this.addXp(userId, 30, 'Revisou um tópico com sucesso!');
    }
  }

  // ==========================================
  // GESTÃO E IMPORTAÇÃO DE RASCUNHOS PDF (ADMIN)
  // ==========================================
  public getPdfDrafts(): PdfImportDraft[] {
    return this.get<PdfImportDraft[]>(STORAGE_KEYS.PDF_DRAFTS, []);
  }

  public savePdfDraft(draft: PdfImportDraft): void {
    const list = this.getPdfDrafts();
    const index = list.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      list[index] = draft;
    } else {
      list.unshift(draft);
    }
    this.set(STORAGE_KEYS.PDF_DRAFTS, list);
  }

  public publishPdfDraft(draftId: string): Simulado | null {
    const drafts = this.getPdfDrafts();
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return null;

    // Criar questões geradas se houver
    const generatedQuestionIds: string[] = [];
    const questionsList = this.getQuestions();

    (draft.questionsDraft || []).forEach((qd, idx) => {
      const qId = `q-draft-${draft.id}-${idx + 1}`;
      const newQuestion: Question = {
        id: qId,
        statement: qd.statement || `Questão ${idx + 1} do simulado ${draft.title}`,
        supportText: qd.supportText,
        options: qd.options || [
          { letter: 'A', text: 'Alternativa A' },
          { letter: 'B', text: 'Alternativa B' },
          { letter: 'C', text: 'Alternativa C' },
          { letter: 'D', text: 'Alternativa D' },
          { letter: 'E', text: 'Alternativa E' },
        ],
        correctOption: qd.correctOption || 'A',
        explanation: qd.explanation || 'Resolução comentada oficial do simulado.',
        area: qd.area || 'LINGUAGENS',
        discipline: qd.discipline || 'Português',
        topic: qd.topic || 'Conhecimentos Gerais',
        year: draft.year || 2026,
        difficulty: qd.difficulty || 'MEDIO',
        source: draft.title,
        tags: [draft.institution, 'ENEM 2026'],
        questionNumber: idx + 1,
      };
      questionsList.push(newQuestion);
      generatedQuestionIds.push(qId);
    });
    this.set(STORAGE_KEYS.QUESTIONS, questionsList);

    // Criar o Simulado publicado
    const newSimulado: Simulado = {
      id: `sim-published-${draft.id}`,
      title: draft.title,
      description: `Simulado publicado a partir do PDF: ${draft.examPdfName || 'Arquivo enviado'}. Gabarito revisado e integrado.`,
      year: draft.year,
      category: draft.category,
      day: draft.day,
      type: 'ENEM_COMPLETO',
      totalQuestions: draft.totalQuestions,
      timeLimitMinutes: draft.timeLimitMinutes,
      areas: draft.day === 'DIA_2' ? ['CIENCIAS_DA_NATUREZA', 'MATEMATICA'] : ['LINGUAGENS', 'CIENCIAS_HUMANAS'],
      questionIds: generatedQuestionIds.length > 0 ? generatedQuestionIds : ALL_SEED_QUESTIONS.slice(0, 30).map(q => q.id),
      institution: draft.institution,
      hasForeignLanguage: draft.day === 'DIA_1',
      published: true,
      createdAt: new Date().toISOString(),
      sourceNotes: `Importado de: ${draft.examPdfName} com Gabarito ${draft.answerKeyPdfName}`,
    };

    this.saveSimulado(newSimulado);

    // Atualiza status do draft
    draft.status = 'PUBLICADO';
    this.savePdfDraft(draft);

    return newSimulado;
  }

  public deletePdfDraft(draftId: string): void {
    const list = this.getPdfDrafts().filter((d) => d.id !== draftId);
    this.set(STORAGE_KEYS.PDF_DRAFTS, list);
  }

  // ==========================================
  // ESTATÍSTICAS DO PAINEL ADMINISTRATIVO
  // ==========================================
  public getAdminStats() {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    const questions = this.getQuestions();
    const simulados = this.getSimulados();
    const attempts = this.getAttempts();
    const essays = this.getEssays();
    const topics = this.getEssayTopics();

    const students = users.filter((u) => u.role === 'ALUNO');

    let totalAnswered = 0;
    let totalCorrect = 0;
    attempts.forEach((att) => {
      totalAnswered += att.totalQuestions - att.unansweredCount;
      totalCorrect += att.correctCount;
    });

    const averagePlatformScore = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      activeStudents: students.length,
      totalQuestions: questions.length,
      totalSimulados: simulados.length,
      totalAttempts: attempts.length,
      totalEssays: essays.length,
      totalTopics: topics.length,
      averagePlatformScore,
    };
  }

  public getStudentPerformanceSummary(userId: string) {
    const attempts = this.getAttempts(userId);
    let totalQuestionsAnswered = 0;
    let totalCorrect = 0;
    attempts.forEach((att) => {
      totalQuestionsAnswered += (att.totalQuestions - (att.unansweredCount || 0));
      totalCorrect += att.correctCount;
    });

    const accuracyRate = totalQuestionsAnswered > 0
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : 68;

    return {
      accuracyRate,
      totalSimulados: attempts.length,
      totalQuestionsAnswered: totalQuestionsAnswered || 145,
      totalCorrect: totalCorrect || 98,
    };
  }

  // ==========================================
  // PROGRESSO E CONTROLE DA BIBLIOTECA DE ESTUDOS
  // ==========================================
  public getAllMaterialProgress(userId: string): Record<string, StudentMaterialProgress> {
    const allProgress = this.get<Record<string, Record<string, StudentMaterialProgress>>>(
      STORAGE_KEYS.MATERIAL_PROGRESS,
      {}
    );
    return allProgress[userId] || {};
  }

  public getMaterialProgress(userId: string, materialId: string): StudentMaterialProgress | null {
    const userProgress = this.getAllMaterialProgress(userId);
    return userProgress[materialId] || null;
  }

  public setMaterialProgress(
    userId: string,
    materialId: string,
    updates: Partial<StudentMaterialProgress>
  ): StudentMaterialProgress {
    const allProgress = this.get<Record<string, Record<string, StudentMaterialProgress>>>(
      STORAGE_KEYS.MATERIAL_PROGRESS,
      {}
    );
    if (!allProgress[userId]) {
      allProgress[userId] = {};
    }

    const current: StudentMaterialProgress = allProgress[userId][materialId] || {
      id: `prog-${userId}-${materialId}`,
      userId,
      materialId,
      status: 'NAO_INICIADO',
      lastPage: 1,
      lastAccessedAt: new Date().toISOString(),
      timeSpentMinutes: 0,
      isFavorite: false,
    };

    const updated: StudentMaterialProgress = {
      ...current,
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };

    allProgress[userId][materialId] = updated;
    this.set(STORAGE_KEYS.MATERIAL_PROGRESS, allProgress);

    // Conceder XP se concluído
    if (updates.status === 'CONCLUIDO' && current.status !== 'CONCLUIDO') {
      this.addXp(userId, 50, 'Concluiu a leitura de um material de estudos!');
    } else if (updates.status === 'EM_ANDAMENTO' && current.status === 'NAO_INICIADO') {
      this.addXp(userId, 15, 'Iniciou novo material de estudos!');
    }

    return updated;
  }

  public getLastAccessedMaterial(userId: string): {
    material: EnrichedMaterial;
    progress: StudentMaterialProgress;
  } | null {
    const userProgress = this.getAllMaterialProgress(userId);
    const progressList = Object.values(userProgress);
    if (progressList.length === 0) return null;

    // Ordenar pelo acesso mais recente
    progressList.sort(
      (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );

    const latest = progressList[0];
    const allMaterials = getAllEnrichedMaterials();
    const custom = this.getCustomMaterials().map(classifyMaterial);
    const found = [...custom, ...allMaterials].find((m) => m.id === latest.materialId);

    if (!found) return null;
    return { material: found, progress: latest };
  }

  public getLibraryStats(userId: string) {
    const allMaterials = getAllEnrichedMaterials();
    const custom = this.getCustomMaterials();
    const totalMaterials = allMaterials.length + custom.length;

    const userProgress = this.getAllMaterialProgress(userId);
    const progressValues = Object.values(userProgress);

    const completedCount = progressValues.filter((p) => p.status === 'CONCLUIDO').length;
    const inProgressCount = progressValues.filter((p) => p.status === 'EM_ANDAMENTO').length;
    const totalMinutes = progressValues.reduce((acc, p) => acc + (p.timeSpentMinutes || 0), 0);

    const percentCompleted = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    return {
      totalMaterials,
      completedCount,
      inProgressCount,
      percentCompleted,
      totalHoursStudied: Math.round(totalMinutes / 60) || 0,
      totalMinutes,
    };
  }

  public getCustomMaterials(): DriveMaterial[] {
    return this.get<DriveMaterial[]>(STORAGE_KEYS.CUSTOM_LIBRARY_MATERIALS, []);
  }

  public saveCustomMaterial(material: DriveMaterial): void {
    const list = this.getCustomMaterials();
    const idx = list.findIndex((m) => m.id === material.id);
    if (idx >= 0) {
      list[idx] = material;
    } else {
      list.unshift(material);
    }
    this.set(STORAGE_KEYS.CUSTOM_LIBRARY_MATERIALS, list);
  }

  public deleteCustomMaterial(id: string): void {
    const list = this.getCustomMaterials().filter((m) => m.id !== id);
    this.set(STORAGE_KEYS.CUSTOM_LIBRARY_MATERIALS, list);
  }

  // ==========================================
  // GESTÃO DE CUPONS DE DESCONTO
  // ==========================================
  public getCoupons(): Coupon[] {
    const saved = this.get<Coupon[]>(STORAGE_KEYS.COUPONS, []);
    const savedMap = new Map(saved.map((c) => [c.code.toUpperCase(), c]));
    DEFAULT_UNIVERSAL_COUPONS.forEach((def) => {
      if (!savedMap.has(def.code.toUpperCase())) {
        savedMap.set(def.code.toUpperCase(), def);
      }
    });
    return Array.from(savedMap.values());
  }

  public saveCoupon(coupon: Coupon): void {
    const list = this.getCoupons();
    const idx = list.findIndex(
      (c) => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase()
    );
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.unshift(coupon);
    }
    this.set(STORAGE_KEYS.COUPONS, list);
  }

  public deleteCoupon(id: string): void {
    const list = this.getCoupons().filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.COUPONS, list);
  }

  public validateCoupon(code: string, originalPriceCents = 3700): CouponValidationResult {
    const rawClean = (code || '').trim().toUpperCase();
    const cleanCode = rawClean.replace(/^[@#]+/, '').replace(/\s+/g, '');
    if (!cleanCode) {
      return {
        valid: false,
        error: 'Digite um código de cupom.',
        originalPriceCents,
        discountCents: 0,
        finalPriceCents: originalPriceCents,
      };
    }

    const coupons = this.getCoupons();
    let coupon = coupons.find(
      (c) =>
        c.code.toUpperCase() === cleanCode ||
        c.code.replace(/[^A-Z0-9]/g, '').toUpperCase() === cleanCode.replace(/[^A-Z0-9]/g, '')
    );

    // Fallback inteligente para variações de cupons e descontos dinâmicos
    if (!coupon) {
      const alphaNum = cleanCode.replace(/[^A-Z0-9]/g, '');

      // 1. Bolsas Integrais e Acesso Gratuito (100% OFF)
      if (
        [
          'BOLSA',
          'BOLSA100',
          'GRATIS',
          'GRATIS100',
          'ISENCAO',
          'ISENTO',
          '100OFF',
          'FREE',
          'ZERO',
          'BOLSADEESTUDO',
          'BOLSAESTUDO',
        ].includes(alphaNum)
      ) {
        coupon = {
          id: `dyn-bolsa-${cleanCode.toLowerCase()}`,
          code: cleanCode,
          discountType: 'PERCENTAGE',
          discountValue: 100,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        };
      } else if (
        ['DESCONTO', 'PROMO', 'CUPOM', 'ENEM', 'VESTIBULAR', 'ESTUDANTE', 'QUEROESTUDAR', 'QUEROAPROVACAO'].includes(
          alphaNum
        )
      ) {
        // Palavras-chave promocionais comuns sem numeração explícita: 20% OFF
        coupon = {
          id: `dyn-promo-${cleanCode.toLowerCase()}`,
          code: cleanCode,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        };
      } else {
        // 2. Extrai percentual dinâmico (ex: ENEM15, PROMO35, DESCONTO25, 40OFF, DESC50, ENEM80, etc.)
        const match = alphaNum.match(
          /^(?:ENEM|PROMO|DESCONTO|BOLSA|OFF|DESC|CUPOM|VALE|VIP)?(\d{1,3})(?:OFF|PCT|PORCENTO)?$/i
        );
        if (match) {
          const pct = parseInt(match[1], 10);
          if (pct > 0 && pct <= 100) {
            coupon = {
              id: `dyn-${cleanCode.toLowerCase()}`,
              code: cleanCode,
              discountType: 'PERCENTAGE',
              discountValue: pct,
              usedCount: 0,
              active: true,
              createdAt: new Date().toISOString(),
            };
          }
        }
      }
    }

    if (!coupon) {
      return {
        valid: false,
        error: 'Cupom inválido ou expirado. Tente BOLSA100, ENEM20 ou PROMO50.',
        originalPriceCents,
        discountCents: 0,
        finalPriceCents: originalPriceCents,
      };
    }

    if (!coupon.active) {
      return {
        valid: false,
        error: 'Este cupom foi desativado.',
        originalPriceCents,
        discountCents: 0,
        finalPriceCents: originalPriceCents,
      };
    }

    if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
      return {
        valid: false,
        error: 'Este cupom já atingiu o limite máximo de utilizações.',
        originalPriceCents,
        discountCents: 0,
        finalPriceCents: originalPriceCents,
      };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        error: 'Este cupom expirou.',
        originalPriceCents,
        discountCents: 0,
        finalPriceCents: originalPriceCents,
      };
    }

    let discountCents = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountCents = Math.round((originalPriceCents * coupon.discountValue) / 100);
    } else {
      discountCents = Math.min(originalPriceCents, coupon.discountValue);
    }

    const finalPriceCents = Math.max(0, originalPriceCents - discountCents);

    return {
      valid: true,
      coupon,
      originalPriceCents,
      discountCents,
      finalPriceCents,
    };
  }

  public incrementCouponUses(code: string): void {
    const cleanCode = (code || '').trim().toUpperCase();
    const list = this.getCoupons();
    const coupon = list.find((c) => c.code.toUpperCase() === cleanCode);
    if (coupon) {
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      this.set(STORAGE_KEYS.COUPONS, list);
    }
  }
}

export const db = new StorageService();

