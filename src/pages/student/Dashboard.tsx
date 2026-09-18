import React, { useState } from 'react';
import { db } from '../../db/storage';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { User, SimuladoAttempt, Essay, MistakeNotebookItem } from '../../types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  FileCheck2,
  HelpCircle,
  PenTool,
  Clock,
  Flame,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  BookOpen,
  ChevronRight,
  Play,
  RotateCcw,
  GraduationCap,
  Bot,
  Zap,
  CheckCircle,
  BarChart3,
  Award,
  CircleDot,
  Check,
  Compass,
  Atom,
  Calculator,
} from 'lucide-react';
import { TOTAL_DRIVE_MATERIALS_COUNT } from '../../db/driveConstants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  if (!currentUser) return null;

  const stats = db.getStudentDashboardStats(currentUser.id);
  const profile = stats.profile;
  const attempts: SimuladoAttempt[] = db.getAttempts(currentUser.id).filter((a: SimuladoAttempt) => !!a.finishedAt);
  const essays: Essay[] = db.getEssays(currentUser.id);
  const topicMap = db.getTopicStatusMap(currentUser.id);
  const completedTopicsCount = Object.values(topicMap).filter((s) => s === 'DOMINADO' || s === 'REVISADO').length;
  const mistakes: MistakeNotebookItem[] = db.getMistakes(currentUser.id).filter((m: MistakeNotebookItem) => !m.isMastered);

  // Saudação de acordo com o horário
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Aluno';

  // Dias até o ENEM 2026
  const examDate = new Date('2026-11-08T08:00:00');
  const now = new Date();
  const daysUntilExam = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Cálculos dinâmicos oficiais dos 5 Indicadores Pedagógicos
  const totalCurriculumTopics = 80;
  const conteudosRate = Math.min(100, Math.round((completedTopicsCount / totalCurriculumTopics) * 100));
  const questionsCount = stats.totalQuestionsAnswered;
  const accuracyRate = stats.accuracyRate;
  const simuladosCount = attempts.length;
  const triAverage = simuladosCount > 0
    ? Math.round(attempts.reduce((acc: number, a: SimuladoAttempt) => acc + Math.round(500 + (a.scorePercentage * 4.5)), 0) / simuladosCount)
    : null;
  const streakDays = stats.streakDays;
  const hoursStudied = stats.totalHoursStudied;

  // Minha Jornada - Fases dinâmicas
  const fase1Percent = Math.min(100, Math.round((completedTopicsCount / 20) * 100));
  const fase2Percent = fase1Percent < 100 ? 0 : Math.min(100, Math.round((questionsCount / 300) * 100));
  const fase3Percent = fase2Percent < 100 ? 0 : Math.min(100, Math.round((simuladosCount / 5) * 100));

  // Redação mais recente
  const lastEssay = essays.length > 0 ? essays[essays.length - 1] : null;

  // Gráfico TRI real (quando houver tentativas suficientes)
  const evolutionData = attempts.map((att: SimuladoAttempt, idx: number) => ({
    semana: `Sim ${idx + 1}`,
    nota: Math.round(500 + (att.scorePercentage * 4.5)),
    acerto: Math.round((att.correctCount / (att.totalQuestions || 1)) * 100),
  }));

  const triGrowth = attempts.length >= 2
    ? Math.round(500 + (attempts[attempts.length - 1].scorePercentage * 4.5)) - Math.round(500 + (attempts[0].scorePercentage * 4.5))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in pb-16 w-full">
      {/* ========================================================================= */}
      {/* 6. TOPO DO ALUNO: JORNADA DE APROVAÇÃO & AÇÕES DIRETAS                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Tech glowing spheres */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identificação do Aluno */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-400 bg-slate-800 shadow-xl"
              />
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-950 font-black"
                title="Online"
              >
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-[10px] font-black uppercase tracking-wider">
                  Sua jornada para o ENEM 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase">
                  Aluno Aprovado
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {saudacao}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">{firstName}</span>! 👋
              </h1>

              <div className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                <span>
                  Objetivo: <strong className="text-white font-bold">{profile?.targetCourse || 'Não definido'}</strong>
                  {profile?.targetUniversity ? (
                    <> na <strong className="text-brand-300 font-bold">{profile.targetUniversity}</strong></>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('perfil')}
                  className="text-[11px] text-brand-400 hover:text-white underline font-bold cursor-pointer"
                >
                  Alterar meta
                </button>
              </div>
            </div>
          </div>

          {/* CONTADOR DO ENEM EM DESTAQUE */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 text-amber-300 shadow-sm shrink-0 whitespace-nowrap">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 text-lg">
                📅
              </div>
              <div className="leading-tight">
                <span className="block text-base sm:text-lg font-black text-white font-mono">
                  {daysUntilExam} dias
                </span>
                <span className="text-[11px] font-bold text-amber-300 tracking-tight">
                  para o ENEM 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('plano')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Plano Semanal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-brand-500/25 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Mentor IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOCO: MINHA JORNADA (FASES DINÂMICAS)                                    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">
              Evolução Pedagógica
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-600" />
              MINHA JORNADA
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Passo a passo rumo à aprovação
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* FASE 1: Fundamentos */}
          <div className={`p-5 rounded-2xl border-2 space-y-2.5 relative transition-all ${
            fase1Percent >= 100
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40'
              : fase1Percent > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                fase1Percent >= 100 ? 'bg-emerald-600 text-white' : fase1Percent > 0 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                FASE 1
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black">
                {fase1Percent >= 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✅ Concluído</span>
                ) : fase1Percent > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">🟡 {fase1Percent}% Em andamento</span>
                ) : (
                  <span className="text-slate-400">⚪ 0% Não iniciado</span>
                )}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Fundamentos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Conceitos de base em todas as áreas, cronograma semanal e diagnóstico pedagógico inicial.
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fase1Percent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${fase1Percent}%` }}
              />
            </div>
          </div>

          {/* FASE 2: Aprimoramento */}
          <div className={`p-5 rounded-2xl border-2 space-y-2.5 relative transition-all ${
            fase2Percent >= 100
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40'
              : fase2Percent > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                fase2Percent >= 100 ? 'bg-emerald-600 text-white' : fase2Percent > 0 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                FASE 2
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black">
                {fase2Percent >= 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✅ Concluído</span>
                ) : fase2Percent > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">🟡 {fase2Percent}% Em andamento</span>
                ) : (
                  <span className="text-slate-400">⚪ {fase1Percent < 100 ? 'Bloqueado' : '0%'}</span>
                )}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Aprimoramento
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resolução de questões médias e difíceis, consolidação de TRI e treino sistemático de Redação.
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fase2Percent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${fase2Percent}%` }}
              />
            </div>
          </div>

          {/* FASE 3: Simulados Finais */}
          <div className={`p-5 rounded-2xl border-2 space-y-2.5 relative transition-all ${
            fase3Percent >= 100
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40'
              : fase3Percent > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                fase3Percent >= 100 ? 'bg-emerald-600 text-white' : fase3Percent > 0 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                FASE 3
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                {fase3Percent >= 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">✅ Concluído</span>
                ) : fase3Percent > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-black">🟡 {fase3Percent}% Em andamento</span>
                ) : (
                  <span>⚪ Próximo</span>
                )}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Simulados Finais
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Maratona de provas na íntegra com cronômetro real de 5h e revisão intensiva dos temas de maior peso.
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fase3Percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${fase3Percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. MEU DESEMPENHO (OS 5 INDICADORES PEDAGÓGICOS OFICIAIS — GATES 5 & 6)   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Indicadores Chave</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              MEU DESEMPENHO
            </h2>
          </div>
          <button
            onClick={() => onNavigate('desempenho')}
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver Análise Completa <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Indicador 1: Conteúdos Concluídos */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
              <span>Conteúdos</span>
              <BookOpen className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {conteudosRate}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div className="bg-brand-600 h-full rounded-full transition-all duration-500" style={{ width: `${conteudosRate}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block leading-tight">
              {completedTopicsCount === 0
                ? 'Conclua seu 1º conteúdo para acompanhar'
                : `${completedTopicsCount} tópicos concluídos`}
            </span>
          </div>

          {/* Indicador 2: Questões Resolvidas */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
              <span>Questões</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {questionsCount.toLocaleString('pt-BR')}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${accuracyRate}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block leading-tight">
              {questionsCount === 0 ? '0% taxa de acertos' : `${accuracyRate}% taxa de acertos`}
            </span>
          </div>

          {/* Indicador 3: Média nos Simulados */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
              <span>Simulados</span>
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {triAverage !== null ? triAverage : '--'}
                </span>
                <span className="text-xs font-bold text-indigo-500">TRI</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${triAverage !== null ? Math.min(100, Math.round((triAverage / 1000) * 100)) : 0}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold block leading-tight">
              {simuladosCount === 0
                ? 'Nenhum simulado realizado ainda'
                : `${simuladosCount} simulado${simuladosCount > 1 ? 's' : ''} concluído${simuladosCount > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Indicador 4: Sequência de Estudos */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
              <span>Sequência</span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-orange-500 font-mono">
                  {streakDays}
                </span>
                <span className="text-xs font-bold text-orange-500">
                  {streakDays === 0 ? 'dias' : 'dias 🔥'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, streakDays * 10)}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block leading-tight">
              {streakDays === 0 ? 'Comece hoje sua sequência' : 'Ofensiva diária mantida'}
            </span>
          </div>

          {/* Indicador 5: Horas Estudadas */}
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
              <span>Horas de Estudo</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {hoursStudied}h
                </span>
                <span className="text-xs font-bold text-slate-400">focadas</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((hoursStudied / ((profile?.studyHoursPerDay || 4) * 7)) * 100))}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-purple-600 font-bold block leading-tight">
              {hoursStudied === 0
                ? 'Seu tempo aparecerá aqui'
                : `Meta: ${profile?.studyHoursPerDay || 4}h diárias`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. RECOMENDAÇÃO INTELIGENTE ADAPTATIVA (GATE 6)                            */}
      {/* ========================================================================= */}
      {questionsCount === 0 && simuladosCount === 0 ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-brand-500/15 via-indigo-500/10 to-emerald-500/10 border-2 border-brand-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-800 dark:text-brand-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-brand-400/30">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                BEM-VINDO À SUA JORNADA
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Passo Inicial Recomendado
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sua preparação para o ENEM 2026 começa hoje!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Para calibrarmos seu algoritmo adaptativo de TRI e suas recomendações personalizadas, faça o seu <strong>Simulado Diagnóstico</strong> ou explore as matérias de base na Biblioteca.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('simulados')}
              className="px-5 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Fazer Simulado Diagnóstico</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('materias')}
              className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span>Explorar Matérias</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/10 border-2 border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-amber-400/30">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                RECOMENDAÇÃO DE ESTUDO
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Análise baseada nos seus resultados reais
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {mistakes.length > 0
                ? `Você precisa revisar: ${mistakes[0].question.discipline}`
                : `Foque em: ${stats.weakArea?.name || 'suas matérias de maior peso'}`}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {mistakes.length > 0
                ? `Motivo: Identificamos erros recentes em "${mistakes[0].question.topic}". Recomendamos revisar a teoria e refazer questões similares.`
                : `Continue praticando questões e simulados para consolidar sua proficiência TRI no ENEM 2026.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('questoes')}
              className="px-5 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-600/25 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Começar Revisão</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAiModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4 text-purple-500" />
              <span>Pedir Ajuda à IA</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTAQUES: PRÓXIMO SIMULADO & MINHA REDAÇÃO                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ÁREA DE SIMULADOS */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                Próximo Simulado Recomendado
              </span>
              <span className="text-xs font-bold text-slate-400">⏱️ Prova Completa</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              SIMULADO ENEM 2026 — DIA 1
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              90 questões no padrão oficial do edital, cobrindo Linguagens, Ciências Humanas e Redação. Inclui cronômetro oficial de 5 horas e calibração por Teoria de Resposta ao Item (TRI).
            </p>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
              <span className="flex items-center gap-1">📝 <strong>90 questões</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">⏱ <strong>5h de prova</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">📊 <strong>TRI Calibrada</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulado_run', { simuladoId: 'sim-sas-2026-d1' })}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Iniciar Simulado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ÁREA DE REDAÇÃO (ESTADO ZERO ELEGANTE QUANDO NÃO HOUVER REDAÇÃO) */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                MINHA REDAÇÃO
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {lastEssay ? 'Última redação enviada' : 'Nenhuma redação ainda'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Nota Estimada:
              </h3>
              <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {lastEssay?.correction?.totalScore ? `${lastEssay.correction.totalScore} pts` : '-- pts'}
              </span>
            </div>

            {/* Grid das 5 Competências */}
            <div className="grid grid-cols-5 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-[10px] font-black text-slate-400 uppercase">C1</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {lastEssay?.correction?.competencies?.find((c) => c.number === 1)?.score ?? '--'}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">Norma</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-[10px] font-black text-emerald-500 uppercase">C2</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {lastEssay?.correction?.competencies?.find((c) => c.number === 2)?.score ?? '--'}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">Tema</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-[10px] font-black text-slate-400 uppercase">C3</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {lastEssay?.correction?.competencies?.find((c) => c.number === 3)?.score ?? '--'}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">Argum.</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-[10px] font-black text-emerald-500 uppercase">C4</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {lastEssay?.correction?.competencies?.find((c) => c.number === 4)?.score ?? '--'}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">Coesão</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-[10px] font-black text-amber-500 uppercase">C5</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                  {lastEssay?.correction?.competencies?.find((c) => c.number === 5)?.score ?? '--'}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">Interv.</span>
              </div>
            </div>

            {!lastEssay && (
              <p className="text-[11px] text-slate-400 font-medium">
                Você ainda não enviou nenhuma redação. Envie seu primeiro texto para receber a correção nota 1000 com análise detalhada da IA.
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigate('redacao')}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <span>{lastEssay ? 'Nova Redação' : 'Enviar Primeira Redação'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. ÁREA DE MATÉRIAS (ORGANIZAÇÃO POR PASTAS)                              */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Pastas de Matérias do ENEM 2026
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/10">
                Acervo Completo & Leitor Integrado
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Acesse o Acervo Estruturado por Disciplinas
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore as 6 grandes áreas do conhecimento, abra as pastas de cada disciplina e estude com apostilas teóricas completas, resumos esquemáticos, mapas mentais e questões comentadas.
            </p>

            {/* Régua de Métricas Educacionais */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <span className="block text-xl sm:text-2xl font-black text-brand-400 font-mono">15</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Disciplinas</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">{TOTAL_DRIVE_MATERIALS_COUNT}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Arquivos didáticos</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <span className="block text-xl sm:text-2xl font-black text-indigo-400 font-mono">45+</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Tópicos curriculares</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('materias')}
              className="px-6 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Abrir Pastas de Matérias</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('etec')}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Ver Pasta ETEC 2026</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRÁFICO DE EVOLUÇÃO TRI (REAL OU ESTADO ZERO ELEGANTE — GATES 5 & 6)      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Evolução da Nota TRI nos Simulados
            </h3>
            <p className="text-xs text-slate-500">
              Progresso calibrado com base na proficiência real do estudante
            </p>
          </div>
          {attempts.length >= 2 && (
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {triGrowth >= 0 ? `+${triGrowth}` : `${triGrowth}`} pts neste ciclo
            </span>
          )}
        </div>

        {attempts.length >= 2 ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d77f8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d77f8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="semana" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[500, 950]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="nota"
                  name="Nota Média TRI"
                  stroke="#0d77f8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNota)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/70 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-xl">
              📈
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                Curva de Evolução TRI em Calibração
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {attempts.length === 1
                  ? 'Você concluiu seu 1º simulado! Faça mais um simulado para começar a comparar sua curva de evolução.'
                  : 'Nenhum simulado realizado ainda. Faça seu primeiro simulado quando estiver pronto para ver o gráfico de proficiência TRI.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('simulados')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Ver Simulados Disponíveis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal do Assistente de IA */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
