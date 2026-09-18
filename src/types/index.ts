export type UserRole = 'ALUNO' | 'ADMINISTRADOR' | 'PROFESSOR' | 'CORRETOR';

export type UserStatus = 'PENDENTE_APROVACAO' | 'APROVADO' | 'REPROVADO' | 'BLOQUEADO';

export type UserTargetObjective = 'ENEM' | 'ETEC' | 'VESTIBULAR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  document?: string; // CPF ou documento (opcional)
  birthDate?: string;
  phone?: string;
  city?: string;
  state?: string;
  objective?: UserTargetObjective;
  rejectionReason?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  birthDate?: string;
  state?: string;
  city?: string;
  school?: string;
  targetCourse?: string;
  targetUniversity?: string;
  targetScore: number;
  studyHoursPerDay: number;
  studyDaysPerWeek: number;
  difficultSubjects: string[];
  examDate: string; // Ex: 2026-11-08
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  streakDays: number;
  lastStudyDate: string;
  xp: number;
  level: number;
}

export type AreaDoConhecimento =
  | 'LINGUAGENS'
  | 'CIENCIAS_HUMANAS'
  | 'CIENCIAS_DA_NATUREZA'
  | 'MATEMATICA'
  | 'REDACAO';

export type Disciplina =
  | 'Língua Portuguesa'
  | 'Português'
  | 'Literatura'
  | 'Inglês'
  | 'Espanhol'
  | 'Artes'
  | 'Educação Física'
  | 'Tecnologias da Informação e Comunicação'
  | 'História'
  | 'Geografia'
  | 'Filosofia'
  | 'Sociologia'
  | 'Biologia'
  | 'Química'
  | 'Física'
  | 'Matemática'
  | 'Redação';

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  topic?: string;
  difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL';
  mastered?: boolean;
}

export interface ExerciseItem {
  id: string;
  title: string;
  statement: string;
  resolution: string;
  steps: string[];
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL';
}

export type TopicStatus = 'NAO_INICIADO' | 'EM_PROGRESSO' | 'EM_ANDAMENTO' | 'REVISADO' | 'DOMINADO' | 'CONCLUIDO';

export interface OnlineStudyResource {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTIGO' | 'MAPA_MENTAL' | 'SIMULADOR' | 'RESUMO';
  provider: string; // ex: 'Professor Ferretto', 'Brasil Escola', 'Toda Matéria', 'Khan Academy', 'Canal Educação MEC'
  url: string;
  description: string;
  durationOrReadingTime?: string;
}

export interface TopicData {
  id: string;
  name: string;
  discipline: Disciplina;
  area: AreaDoConhecimento;
  status: TopicStatus;
  masteryPercentage: number;
  theory: string;
  summary: string[];
  mindMapUrl?: string;
  mindMapPoints?: string[];
  flashcards: FlashcardItem[];
  solvedExercises: ExerciseItem[];
  onlineResources?: OnlineStudyResource[];
  questionCount: number;
}

export interface SubjectData {
  id: string;
  name: Disciplina;
  area: AreaDoConhecimento;
  areaLabel: string;
  icon: string;
  color: string;
  description: string;
  topics: TopicData[];
  totalTopics: number;
  completedTopics: number;
  masteryPercentage: number;
}

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  selectionPercentage?: number;
}

export interface Question {
  id: string;
  statement: string;
  supportText?: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  area: AreaDoConhecimento;
  discipline: Disciplina;
  topic: string;
  subtopic?: string;
  year: number;
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL';
  source: string;
  institution?: string;
  examName?: string;
  questionNumber?: number;
  tags: string[];
  isDiscursive?: boolean;
  expectedAnswer?: string;
  totalAnswers?: number;
  correctAnswersCount?: number;
}

export type SimuladoTipo =
  | 'ENEM_COMPLETO'
  | 'POR_AREA'
  | 'POR_MATERIA'
  | 'SIMULADO_RAPIDO'
  | 'PERSONALIZADO';

export type ExamDay = 'DIA_1' | 'DIA_2' | 'UNICO';
export type ForeignLanguage = 'INGLES' | 'ESPANHOL';
export type SimuladoCategoria = 'ENEM_2026' | 'OUTROS_VESTIBULARES' | 'MATERIA';

export interface Simulado {
  id: string;
  title: string;
  description: string;
  year: number;
  category?: SimuladoCategoria;
  day?: ExamDay;
  type: SimuladoTipo;
  totalQuestions: number;
  timeLimitMinutes: number;
  areas: AreaDoConhecimento[];
  questionIds: string[];
  institution?: string; // ex: 'SAS', 'Bernoulli', 'Poliedro', 'Apeiron', 'Somos', 'HPlus', 'Sírio-Libanês', 'Unicamp'
  systemOrigin?: 'ANGLO' | 'SAS' | 'SOMOS' | 'BERNOULLI' | 'POLIEDRO' | 'APEIRON' | 'HPLUS' | 'ENEM' | 'UNICAMP' | 'SIRIO_LIBANES' | 'OUTRO';
  hasForeignLanguage?: boolean;
  isDiscursive?: boolean;
  published: boolean;
  createdAt: string;
  sourceNotes?: string;
  licenseNotes?: string;
}

export interface SimuladoAnswer {
  selectedOption?: 'A' | 'B' | 'C' | 'D' | 'E';
  discursiveResponse?: string;
  isCorrect: boolean;
  markedForReview: boolean;
  timeSpentSeconds: number;
}

export interface SimuladoAttempt {
  id: string;
  simulationId: string;
  simulationTitle: string;
  simulationCategory: SimuladoCategoria;
  userId: string;
  foreignLanguage?: ForeignLanguage;
  startedAt: string;
  finishedAt: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercentage: number;
  areaScores: Record<string, { total: number; correct: number; percentage: number }>;
  disciplineScores: Record<string, { total: number; correct: number; percentage: number }>;
  answers: Record<string, SimuladoAnswer>;
}

export interface MotivatingText {
  id: number;
  title: string;
  content: string;
  source: string;
  imageUrl?: string;
}

export interface EssayTopic {
  id: string;
  title: string;
  theme: string;
  motivatingTexts: MotivatingText[];
  instructions: string;
  year?: number;
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL';
  createdAt: string;
}

export type CompetencyScore = 0 | 40 | 80 | 120 | 160 | 200;

export interface CompetencyEvaluation {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  score: CompetencyScore;
  feedback: string;
  positives: string[];
  improvements: string[];
  examplesFound: string[];
  suggestions: string[];
}

export interface ProposalElementsEvaluation {
  agente: { detected: boolean; text?: string; feedback: string };
  acao: { detected: boolean; text?: string; feedback: string };
  modo: { detected: boolean; text?: string; feedback: string };
  finalidade: { detected: boolean; text?: string; feedback: string };
  detalhamento: { detected: boolean; text?: string; feedback: string };
}

export interface TextAnnotation {
  id: string;
  paragraphIndex: number;
  snippet: string;
  type: 'grammar' | 'cohesion' | 'argument' | 'suggestion' | 'praise';
  explanation: string;
  betterAlternative?: string;
}

export interface EssayCorrection {
  totalScore: number;
  isZeroScore: boolean;
  zeroScoreReason?: string;
  competencies: CompetencyEvaluation[];
  proposalElements: ProposalElementsEvaluation;
  inTextAnnotations: TextAnnotation[];
  pedagogicalSummary: string;
  evaluatedAt: string;
  aiDisclaimer: string; // "Nota estimada para fins de estudo. Não corresponde à correção oficial do ENEM."
}

export interface Essay {
  id: string;
  userId: string;
  topicId: string;
  topicTheme: string;
  text: string;
  submissionType: 'TYPED' | 'PHOTO' | 'PDF';
  fileUrl?: string;
  fileName?: string;
  lineCount: number;
  timeSpentMinutes: number;
  status: 'DRAFT' | 'CORRECTED';
  correction?: EssayCorrection;
  createdAt: string;
  updatedAt: string;
}

export interface MistakeNotebookItem {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E';
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  failedAt: string;
  timesFailed: number;
  timesReviewed: number;
  isMastered: boolean;
  lastMasteredAt?: string;
}

export interface StudyPlanTask {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 1=Seg...
  dayName: string;
  area: AreaDoConhecimento;
  discipline: Disciplina;
  topic: string;
  durationMinutes: number;
  targetQuestions: number;
  completed: boolean;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  discipline: Disciplina;
  topic: string;
  durationMinutes: number;
  sessionType: 'POMODORO' | 'LIVRE' | 'SIMULADO' | 'QUESTOES' | 'REDACAO';
  date: string; // YYYY-MM-DD
}

export interface StudentGoals {
  id: string;
  userId: string;
  targetCourse: string;
  targetUniversity: string;
  targetScore: number;
  weeklyQuestionsGoal: number;
  weeklyQuestionsDone: number;
  weeklyHoursGoal: number;
  weeklyHoursDone: number;
  monthlySimuladosGoal: number;
  monthlySimuladosDone: number;
  focusDisciplines: Disciplina[];
  updatedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'QUESTOES' | 'SIMULADOS' | 'REDACAO' | 'OFENSIVA' | 'ESPECIAL';
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  targetId: string;
  type: 'QUESTION' | 'ESSAY_TOPIC' | 'TOPIC';
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'reminder';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PdfImportDraft {
  id: string;
  title: string;
  institution: string;
  year: number;
  category: SimuladoCategoria;
  day?: ExamDay;
  totalQuestions: number;
  timeLimitMinutes: number;
  examPdfName?: string;
  answerKeyPdfName?: string;
  resolutionPdfName?: string;
  status: 'RASCUNHO_PENDENTE' | 'REVISADO' | 'PUBLICADO';
  questionsDraft: Partial<Question>[];
  createdAt: string;
}

// ==========================================
// BIBLIOTECA DE ESTUDOS ENEM & ETEC
// ==========================================
export type LibraryAreaId =
  | 'LINGUAGENS'
  | 'CIENCIAS_HUMANAS'
  | 'CIENCIAS_DA_NATUREZA'
  | 'MATEMATICA'
  | 'REDACAO'
  | 'ETEC';

export type MaterialContentType =
  | 'APOSTILA'
  | 'AUDIO'
  | 'MAPA_MENTAL'
  | 'EXERCICIO'
  | 'SIMULADO'
  | 'RESUMO';

export type MaterialProgressStatus = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface StudentMaterialProgress {
  id: string;
  userId: string;
  materialId: string;
  status: MaterialProgressStatus;
  lastPage: number;
  lastAccessedAt: string;
  timeSpentMinutes: number;
  isFavorite: boolean;
}

export interface LibraryFolder {
  id: string;
  areaId: LibraryAreaId;
  name: string;
  icon?: string;
  description?: string;
  order: number;
}

// ============================================================================
// TIPOS DE PAGAMENTO E CHECKOUT (INFINITEPAY / CLOUDWALK)
// ============================================================================

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  provider: 'infinitepay';
  amountCents: number;
  currency: string;
  status: OrderStatus;
  externalReference: string; // order_nsu
  providerPaymentId?: string | null; // transaction_nsu
  providerSlug?: string | null; // invoice_slug
  checkoutUrl?: string | null;
  receiptUrl?: string | null;
  captureMethod?: 'pix' | 'credit_card' | string | null;
  paidAt?: string | null;
  couponId?: string | null;
  couponCodeSnapshot?: string | null;
  originalPriceCents?: number;
  discountCents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  providerEventId?: string | null;
  providerPaymentId?: string | null;
  eventType?: string | null;
  payloadHash: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processedAt?: string | null;
  createdAt: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  orderId?: string;
  externalReference?: string;
  status?: OrderStatus;
  alreadyActive?: boolean;
  isFreeCoupon?: boolean;
  appliedDiscountCents?: number;
  finalPriceCents?: number;
  error?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  orderId: string;
  status: OrderStatus;
  isPaid: boolean;
  userStatus: UserStatus;
  paidAt?: string | null;
  receiptUrl?: string | null;
  captureMethod?: string | null;
  message?: string;
}

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number; // Porcentagem (ex: 20 para 20%) ou valor em centavos (ex: 1000 para R$ 10,00)
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  originalPriceCents: number;
  discountCents: number;
  finalPriceCents: number;
}

