import React, { useState } from 'react';
import { db } from '../../db/storage';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { User } from '../../types';
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
  FolderDown,
  Bot,
  Zap,
  CheckCircle,
  BarChart3,
  Award,
} from 'lucide-react';
import { DRIVE_MATERIALS } from '../../db/driveMaterialsData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
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
  const tasks = db.getStudyPlanTasks();
  const mistakes = db.getMistakes(currentUser.id);
  const simulados = db.getSimulados();
  const topicStatusMap = db.getTopicStatusMap(currentUser.id);

  // Cálculo de conteúdos concluídos
  const totalTopics = ENEM_CURRICULUM.reduce((acc, s) => acc + s.topics.length, 0);
  const masteredTopics = Object.values(topicStatusMap).filter(
    (st) => st === 'DOMINADO' || st === 'REVISADO'
  ).length;
  // Se novo usuário sem marcação ainda, mostramos percentual demonstrativo calibrado
  const percentCompleted = totalTopics > 0 
    ? Math.max(masteredTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 65, 1)
    : 65;

  // Saudação de acordo com o horário
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // Dados para o gráfico de evolução no tempo
  const evolutionData = [
    { semana: 'Sem 1', nota: 620, acerto: 62, questoes: 120 },
    { semana: 'Sem 2', nota: 680, acerto: 68, questoes: 240 },
    { semana: 'Sem 3', nota: 720, acerto: 72, questoes: 380 },
    { semana: 'Sem 4', nota: 755, acerto: 76, questoes: 510 },
  ];

  // Dados de desempenho por disciplina / área
  const areaData = [
    { name: 'Matemática', sigla: 'MAT', rate: 82, color: '#3b82f6' },
    { name: 'Humanas', sigla: 'HUM', rate: 78, color: '#f59e0b' },
    { name: 'Linguagens', sigla: 'LIN', rate: 74, color: '#ec4899' },
    { name: 'Natureza', sigla: 'NAT', rate: 58, color: '#10b981' },
    { name: 'Redação', sigla: 'RED', rate: 86, color: '#8b5cf6' },
  ];

  // Próximos simulados recomendados
  const proximosSimulados = [
    {
      id: 'sim-sas-2026-d1',
      title: '1º Simulado SAS ENEM 2026 — Dia 1',
      date: 'Neste Sábado, 13:00',
      tag: 'ENEM 2026',
      questions: 90,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'sim-poliedro-2026-d2',
      title: '1º Simulado Poliedro 2026 — Dia 2 (Exatas & Natureza)',
      date: 'Próximo Sábado, 13:00',
      tag: 'ENEM 2026',
      questions: 90,
      badgeColor: 'bg-brand-600',
    },
    {
      id: 'sim-etec-2026',
      title: 'Simulado Oficial Vestibulinho ETEC 2026',
      date: 'Disponível Agora',
      tag: 'ETEC',
      questions: 40,
      badgeColor: 'bg-emerald-600',
      isEtec: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. TOPO: SAUDAÇÃO COM FOTO/AVATAR, META E STATUS */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Aluno Avatar & Identificação */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-400 bg-slate-800 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]" title="Online">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold shrink-0 whitespace-nowrap shadow-xs">
                  <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Faltam <strong className="font-black text-white">{stats.daysUntilExam} dias</strong> para o ENEM 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase">
                  Aluno Aprovado
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {saudacao}, <span className="text-brand-400">{currentUser.name.split(' ')[0]}</span>! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-300">
                Objetivo principal: <strong>{currentUser.objective || 'ENEM 2026'}</strong> • Curso Almejado:{' '}
                <strong>{profile?.targetCourse || 'Medicina'}</strong> na{' '}
                <strong>{profile?.targetUniversity || 'USP'}</strong>
              </p>
            </div>
          </div>

          {/* Botões de Ação Rápida no Topo */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('materias')}
              className="flex-1 md:flex-initial bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase px-5 py-3.5 rounded-2xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Continuar Estudando</span>
            </button>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => onNavigate('simulados')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-brand-300" />
                <span>Fazer Simulado</span>
              </button>

              <button
                onClick={() => onNavigate('redacao')}
                className="flex-1 bg-purple-600/60 hover:bg-purple-600 text-white border border-purple-400/30 font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Redação</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OS 5 INDICADORES PRINCIPAIS (CONFORME REQUISITADO NO ITEM 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: % de Conteúdos Concluídos */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
            <span>Conteúdos Concluídos</span>
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {percentCompleted}%
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
            15 disciplinas em andamento
          </span>
        </div>

        {/* KPI 2: Questões Resolvidas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
            <span>Questões Resolvidas</span>
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalQuestionsAnswered > 0 ? stats.totalQuestionsAnswered : 1250}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              ({stats.accuracyRate > 0 ? stats.accuracyRate : 76}% acertos)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${stats.accuracyRate > 0 ? stats.accuracyRate : 76}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
            ↑ +45 questões nesta semana
          </span>
        </div>

        {/* KPI 3: Média em Simulados */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
            <span>Média em Simulados</span>
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              742
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              / 820 meta
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${Math.round((742 / 820) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
            TRI estimada consistente
          </span>
        </div>

        {/* KPI 4: Sequência de Estudos (Dias Seguidos) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
            <span>Sequência de Estudos</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-orange-500 font-mono">
              {stats.streakDays > 0 ? stats.streakDays : 15}
            </span>
            <span className="text-xs font-bold text-orange-500">
              dias seguidos 🔥
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
            Ofensiva diária mantida
          </span>
        </div>

        {/* KPI 5: Horas Estudadas */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
            <span>Horas Estudadas</span>
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalHoursStudied > 0 ? stats.totalHoursStudied : 48}h
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              focadas
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '75%' }} />
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
            Meta: {profile?.studyHoursPerDay || 4}h diárias
          </span>
        </div>
      </div>

      {/* 2.5 BANNER CENTRAL ETEC + ASSISTENTE DE IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner ETEC */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white border border-emerald-500/30 flex items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/30">
              Área Exclusiva ETEC
            </span>
            <h4 className="text-base font-black text-white">
              Vestibulinho ETEC 2026
            </h4>
            <p className="text-xs text-slate-300">
              Apostilas, 6 matérias dedicadas e Simulado oficial com 40 questões e cronômetro.
            </p>
          </div>

          <button
            onClick={() => onNavigate('etec')}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            <span>Acessar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Banner Assistente IA */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white border border-purple-500/30 flex items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">
              Inteligência Artificial
            </span>
            <h4 className="text-base font-black text-white">
              Assistente Pedagógico IA
            </h4>
            <p className="text-xs text-slate-300">
              Explicar questões, criar resumos, gerar planos e sugerir revisões em 1 clique.
            </p>
          </div>

          <button
            onClick={() => setAiModalOpen(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Abrir IA</span>
          </button>
        </div>
      </div>

      {/* 3. SEÇÃO: MATÉRIAS COM MAIOR DIFICULDADE & PONTOS FORTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Matéria com Maior Dificuldade */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
              Matéria que Precisa de Atenção
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Ciências da Natureza • Física & Química (58% acertos)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tópicos com maior incidência de erros: <strong>Circuitos Elétricos</strong> e <strong>Termoquímica</strong>. Recomendamos reforçar teoria e resolver 15 questões guiadas com a IA.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigate('erros')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase cursor-pointer transition-colors"
              >
                Caderno de Erros ({stats.mistakesCount || 8})
              </button>
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700 hover:bg-amber-50 cursor-pointer"
              >
                Pedir Ajuda à IA
              </button>
            </div>
          </div>
        </div>

        {/* Ponto Forte do Aluno */}
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Seu Maior Ponto Forte
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Matemática & Suas Tecnologias (82% acertos)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Excelente consistência em <strong>Funções</strong>, <strong>Geometria</strong> e <strong>Estatística</strong>. Mantenha 10 questões diárias para consolidar nota 800+ na TRI.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigate('questoes')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase cursor-pointer transition-colors"
              >
                Treinar Questões Avançadas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. GRÁFICOS: EVOLUÇÃO DE NOTAS & DESEMPENHO POR DISCIPLINA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução de Notas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Evolução de Notas & Desempenho
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Progresso semanal estimado na TRI e acertos gerais
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              +135 pts no mês
            </span>
          </div>

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
                <YAxis domain={[500, 900]} stroke="#94a3b8" fontSize={11} />
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
        </div>

        {/* Desempenho por Disciplina / Área */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Desempenho por Disciplina
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Média de acertos nas provas e Redação
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="sigla" type="category" stroke="#94a3b8" fontSize={11} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={18}>
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. PRÓXIMOS SIMULADOS AGENDADOS & METAS DA SEMANA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Simulados Agendados */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-600" />
                Próximos Simulados Agendados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Treine com cronômetro real e correção automática por TRI
              </p>
            </div>
            <button
              onClick={() => onNavigate('simulados')}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {proximosSimulados.map((sim) => (
              <div key={sim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${sim.badgeColor}`}>
                      {sim.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">⏱️ {sim.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {sim.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {sim.questions} questões • Gabarito oficial e resoluções comentadas
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (sim.isEtec) {
                      onNavigate('etec');
                    } else {
                      onNavigate('simulado_run', { simuladoId: sim.id });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  Iniciar Simulado
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Metas da Semana */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Metas da Semana
            </h3>
            <button
              onClick={() => onNavigate('metas')}
              className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
            >
              Configurar
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Meta 1: Questões */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Questões Resolvidas</span>
                <span className="font-mono text-brand-600">145 / 200</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Meta 2: Horas */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Horas de Estudo</span>
                <span className="font-mono text-purple-600">18 / 25h</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Meta 3: Redação Semanal */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Redação Semanal</span>
                <span className="font-mono text-emerald-600">1 / 1 Concluída ✓</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Meta 4: Simulado Quinzenal */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Simulado Quinzenal</span>
                <span className="font-mono text-indigo-600">1 / 2 Feito</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('plano')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 text-slate-700 dark:text-slate-200 hover:text-brand-600 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ver Cronograma Adaptativo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. PASTAS DE MATÉRIAS DO ENEM 2026 (CARD PRINCIPAL REESTRUTURADO) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Pastas de Matérias do ENEM 2026
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/10">
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
                <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">{DRIVE_MATERIALS.length}</span>
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

      {/* Modal do Assistente de IA */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
