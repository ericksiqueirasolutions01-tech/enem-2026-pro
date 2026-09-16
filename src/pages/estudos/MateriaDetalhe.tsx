import React, { useState, useMemo } from 'react';
import { db } from '../../db/storage';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { TopicData, SubjectData, TopicStatus, Question, QuestionOption } from '../../types';
import {
  BookOpen,
  FileText,
  GitFork,
  Layers,
  HelpCircle,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  RotateCw,
  ThumbsUp,
  AlertCircle,
  Play,
  Share2,
  Globe,
  ExternalLink,
  Search,
  Video,
  BookMarked,
  FolderDown,
  Download,
  Eye,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { getDriveMaterialsBySubject, DriveMaterial } from '../../db/driveMaterialsData';

interface MateriaDetalheProps {
  subjectId?: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

type TabType =
  | 'TEORIA'
  | 'RESUMO'
  | 'MAPA_MENTAL'
  | 'FLASHCARDS'
  | 'QUESTOES'
  | 'EXERCICIOS_RESOLVIDOS'
  | 'SIMULADO'
  | 'ONLINE_RESOURCES'
  | 'APOSTILAS_DRIVE';

export const MateriaDetalhe: React.FC<MateriaDetalheProps> = ({
  subjectId = 'lingua-portuguesa',
  onNavigate,
}) => {
  const currentUser = db.getCurrentUser();
  const subject = useMemo(() => {
    return (
      ENEM_CURRICULUM.find((s) => s.id === subjectId) || ENEM_CURRICULUM[0]
    );
  }, [subjectId]);

  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('TEORIA');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Questões state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Exercícios state
  const [revealedSteps, setRevealedSteps] = useState<Record<string, boolean>>({});

  // Web search state
  const [webSearchQuery, setWebSearchQuery] = useState('');

  // Drive material preview state
  const [previewDriveMaterial, setPreviewDriveMaterial] = useState<DriveMaterial | null>(null);
  const [isFullscreenDrive, setIsFullscreenDrive] = useState(false);

  const driveMaterials = useMemo(() => {
    return getDriveMaterialsBySubject(subject.name);
  }, [subject.name]);

  const currentTopic: TopicData = subject.topics[activeTopicIndex] || subject.topics[0];

  // User topic status
  const topicStatusMap = currentUser ? db.getTopicStatusMap(currentUser.id) : {};
  const currentStatus: TopicStatus = (topicStatusMap[currentTopic.id] as TopicStatus) || currentTopic.status || 'NAO_INICIADO';

  const handleUpdateStatus = (newStatus: TopicStatus) => {
    if (!currentUser) return;
    db.setTopicStatus(currentUser.id, currentTopic.id, newStatus);
  };

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'DOMINADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dominado
          </span>
        );
      case 'REVISADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Trophy className="w-3.5 h-3.5" /> Revisado
          </span>
        );
      case 'EM_PROGRESSO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Em Andamento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Não Iniciado
          </span>
        );
    }
  };

  // Practice questions for this topic
  const topicQuestions = useMemo(() => {
    const all = db.getQuestions({ discipline: subject.name });
    if (all.length > 0) return all.slice(0, 5);
    // Fallback sample questions
    return [
      {
        id: `sample-q-${currentTopic.id}-1`,
        statement: `Considere os princípios fundamentais abordados em "${currentTopic.name}". No contexto de exames seletivos como o ENEM, essa temática é essencialmente mobilizada para:`,
        supportText: `Texto de Apoio: O domínio do tópico ${currentTopic.name} permite ao candidato analisar fenômenos complexos, articular hipóteses coerentes e interpretar variáveis interdependentes.`,
        options: [
          { letter: 'A', text: 'Aplicar modelos conceituais para resolução de situações-problema do cotidiano.' },
          { letter: 'B', text: 'Memorizar fatos isolados sem contextualização prática ou científica.' },
          { letter: 'C', text: 'Ignorar as relações interdisciplinares com outras ciências.' },
          { letter: 'D', text: 'Desconsiderar a evolução histórica das teorias e convenções.' },
          { letter: 'E', text: 'Restringir a análise a fórmulas mecânicas e desprovidas de significado.' },
        ] as QuestionOption[],
        correctOption: 'A' as const,
        explanation: `O ENEM prioriza competências e habilidades onde o estudante utiliza conceitos de ${currentTopic.name} para solucionar problemas concretos da sociedade e da natureza.`,
        area: subject.area,
        discipline: subject.name,
        topic: currentTopic.name,
        year: 2026,
        difficulty: 'MEDIO' as const,
        source: 'ENEM 2026 Pro',
        tags: [subject.name, currentTopic.name],
      } as Question,
    ];
  }, [subject, currentTopic]);

  const tabs = [
    { id: 'TEORIA', label: '1. Teoria', icon: BookOpen },
    { id: 'RESUMO', label: '2. Resumo', icon: FileText },
    { id: 'MAPA_MENTAL', label: '3. Mapa Mental', icon: GitFork },
    { id: 'FLASHCARDS', label: `4. Flashcards (${currentTopic.flashcards.length})`, icon: Layers },
    { id: 'QUESTOES', label: `5. Questões (${topicQuestions.length})`, icon: HelpCircle },
    { id: 'EXERCICIOS_RESOLVIDOS', label: `6. Exercícios Resolvidos (${currentTopic.solvedExercises.length})`, icon: Trophy },
    { id: 'SIMULADO', label: '7. Simulado da Matéria', icon: Flame },
    { id: 'ONLINE_RESOURCES', label: `8. Videoaulas & Web (${currentTopic.onlineResources?.length || 4})`, icon: Globe },
    { id: 'APOSTILAS_DRIVE', label: `9. Apostilas Drive (${driveMaterials.length})`, icon: FolderDown },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('materias')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Todas as Matérias</span>
        </button>

        {/* Quick subject selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden md:inline">Trocar Matéria:</span>
          <select
            value={subject.id}
            onChange={(e) => onNavigate('materia-detalhe', { subjectId: e.target.value })}
            className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {ENEM_CURRICULUM.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.areaLabel.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Info Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {subject.areaLabel}
              </span>
              <span className="text-xs text-slate-500">• {subject.totalTopics} Tópicos do Edital</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {subject.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {subject.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">Índice de Domínio</div>
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {subject.masteryPercentage}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-600 flex items-center justify-center font-bold text-xs">
              🎯
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Topics Sidebar + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Topics List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tópicos ({subject.topics.length})
            </span>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-1 pr-1">
            {subject.topics.map((topic, index) => {
              const isActive = index === activeTopicIndex;
              const status: TopicStatus = (topicStatusMap[topic.id] as TopicStatus) || topic.status || 'NAO_INICIADO';

              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setActiveTopicIndex(index);
                    setFlashcardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive ? 'bg-white text-brand-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="truncate">{topic.name}</span>
                  </div>

                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    status === 'DOMINADO'
                      ? 'bg-emerald-400'
                      : status === 'REVISADO'
                      ? 'bg-blue-400'
                      : status === 'EM_PROGRESSO'
                      ? 'bg-amber-400'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Topic Tabs & Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Topic Card with Status Modifier */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
                  Tópico {activeTopicIndex + 1} de {subject.topics.length}
                </span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currentTopic.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                {getStatusBadge(currentStatus)}

                {/* Status Dropdown/Toggle */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleUpdateStatus('EM_PROGRESSO')}
                    title="Marcar Em Andamento"
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold cursor-pointer"
                  >
                    ⏳
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('REVISADO')}
                    title="Marcar Revisado"
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold cursor-pointer"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('DOMINADO')}
                    title="Marcar Dominado"
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold cursor-pointer"
                  >
                    ✅
                  </button>
                </div>
              </div>
            </div>

            {/* 7 Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: TEORIA */}
          {activeTab === 'TEORIA' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Teoria Completa e Fundamentação
                </h3>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {currentTopic.theory}
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-500">Terminou de ler a teoria? Avance para o Resumo!</span>
                <button
                  onClick={() => setActiveTab('RESUMO')}
                  className="px-4 py-2 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Ver Resumo Síntese →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RESUMO */}
          {activeTab === 'RESUMO' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Pontos-Chave & Resumo Esquematizado
                </h3>
              </div>
              <div className="space-y-3">
                {currentTopic.summary.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MAPA MENTAL */}
          {activeTab === 'MAPA_MENTAL' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <GitFork className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Mapa Mental Conceitual
                </h3>
              </div>

              {/* Visual Node Representation */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 space-y-6">
                <div className="text-center">
                  <span className="inline-block px-4 py-2 rounded-2xl bg-brand-600 text-white font-black text-sm shadow-lg shadow-brand-500/20">
                    {currentTopic.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentTopic.mindMapPoints || []).map((node, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-purple-200/60 dark:border-purple-800/40 shadow-sm flex items-start gap-3 hover:scale-[1.02] transition-transform"
                    >
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                          Conceito Central {i + 1}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {node}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLASHCARDS */}
          {activeTab === 'FLASHCARDS' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Flashcards Interativos
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Card {flashcardIndex + 1} de {currentTopic.flashcards.length}
                </span>
              </div>

              {currentTopic.flashcards.length > 0 ? (
                <div className="space-y-4">
                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-700 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-md select-none group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                      {isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA / CONCEITO)'}
                    </span>

                    <p className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 max-w-xl">
                      {isFlipped
                        ? currentTopic.flashcards[flashcardIndex].back
                        : currentTopic.flashcards[flashcardIndex].front}
                    </p>

                    <span className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" /> Clique no card para girar
                    </span>
                  </div>

                  {/* Flashcard navigation */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        setFlashcardIndex(Math.max(0, flashcardIndex - 1));
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      ← Anterior
                    </button>

                    <button
                      onClick={() => {
                        handleUpdateStatus('DOMINADO');
                        alert('Parabéns! Flashcard memorizado e registrado no seu perfil.');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Dominar Tópico (+60 XP)
                    </button>

                    <button
                      disabled={flashcardIndex === currentTopic.flashcards.length - 1}
                      onClick={() => {
                        setFlashcardIndex(Math.min(currentTopic.flashcards.length - 1, flashcardIndex + 1));
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      Próximo →
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nenhum flashcard disponível para este tópico.</p>
              )}
            </div>
          )}

          {/* TAB 5: QUESTÕES */}
          {activeTab === 'QUESTOES' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Questões Práticas de Fixação
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {topicQuestions.length} questões disponíveis
                </span>
              </div>

              <div className="space-y-6">
                {topicQuestions.map((q, qIndex) => {
                  const selectedOpt = selectedAnswers[q.id];
                  const hasAnswered = !!selectedOpt;
                  const isCorrect = selectedOpt === q.correctOption;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/80 space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">Questão {qIndex + 1}</span>
                        <span className="font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-600 border border-brand-200 dark:border-brand-800">
                          {q.difficulty}
                        </span>
                      </div>

                      {q.supportText && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
                          {q.supportText}
                        </div>
                      )}

                      <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                        {q.statement}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt: QuestionOption) => {
                          const isOptionSelected = selectedOpt === opt.letter;
                          const isRightOption = opt.letter === q.correctOption;

                          let btnClasses = 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

                          if (hasAnswered) {
                            if (isRightOption) {
                              btnClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnClasses = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
                            }
                          }

                          return (
                            <button
                              key={opt.letter}
                              disabled={hasAnswered}
                              onClick={() => {
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.letter }));
                                setShowExplanation((prev) => ({ ...prev, [q.id]: true }));
                                if (currentUser && opt.letter !== q.correctOption) {
                                  db.logMistake(currentUser.id, q, opt.letter as any);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${btnClasses}`}
                            >
                              <span className="font-black px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 shrink-0">
                                {opt.letter}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {showExplanation[q.id] && (
                        <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                          isCorrect
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 text-rose-900 dark:text-rose-200'
                        }`}>
                          <div className="font-black flex items-center gap-1.5">
                            {isCorrect ? '✅ Resposta Correta!' : '❌ Incorreta — Adicionada ao Caderno de Erros'}
                          </div>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXERCÍCIOS RESOLVIDOS */}
          {activeTab === 'EXERCICIOS_RESOLVIDOS' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Exercícios Resolvidos Passo a Passo
                </h3>
              </div>

              <div className="space-y-6">
                {currentTopic.solvedExercises.map((ex, i) => {
                  const isExpanded = revealedSteps[ex.id];

                  return (
                    <div
                      key={ex.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                          Exemplo Demonstrativo {i + 1}: {ex.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                          {ex.difficulty}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {ex.statement}
                      </p>

                      <button
                        onClick={() =>
                          setRevealedSteps((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isExpanded ? 'Ocultar Resolução' : 'Ver Resolução Passo a Passo'}
                      </button>

                      {isExpanded && (
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800/60 space-y-3">
                          <div className="font-bold text-xs text-brand-700 dark:text-brand-300">
                            Etapas de Resolução:
                          </div>
                          <div className="space-y-2">
                            {ex.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 italic">
                            {ex.resolution}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: SIMULADO DA MATÉRIA */}
          {activeTab === 'SIMULADO' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <Flame className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Simulado Express da Matéria: {subject.name}
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Teste seu domínio em {subject.name} agora
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Um simulado focado com 15 questões cronometradas extraídas das edições do ENEM e dos simulados 2026. Excelente para avaliar seu rendimento antes de seguir para a próxima matéria.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>⏱️ Tempo sugerido: 45 min</span>
                  <span>📝 15 questões</span>
                  <span>🏆 Ganhe até 150 XP</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('simulados')}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" /> Iniciar Simulado da Matéria
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VIDEOAULAS & MATERIAIS ONLINE */}
          {activeTab === 'ONLINE_RESOURCES' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Materiais Didáticos & Videoaulas Recomendadas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Curadoria de conteúdos abertos da internet alinhados à Matriz do INEP para o tópico <strong>{currentTopic.name}</strong>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800">
                  {currentTopic.onlineResources?.length || 4} recursos verificados
                </span>
              </div>

              {/* Barra de Pesquisa Rápida na Web */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>Pesquisar Dúvidas ou Aprofundamentos deste Tópico na Web</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder={`Pesquise conceitos de "${currentTopic.name}"...`}
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const q = webSearchQuery.trim() || `${currentTopic.name} ${subject.name} enem`;
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const q = webSearchQuery.trim() || `${currentTopic.name} ${subject.name} enem aula`;
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </button>
                    <button
                      onClick={() => {
                        const q = webSearchQuery.trim() || `${currentTopic.name} ${subject.name} enem resumo`;
                        window.open(`https://brasilescola.uol.com.br/busca?q=${encodeURIComponent(q)}`, '_blank');
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>Brasil Escola</span>
                    </button>
                    <button
                      onClick={() => {
                        const q = webSearchQuery.trim() || `${currentTopic.name} ${subject.name} enem matriz inep`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Google</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Recursos Curados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentTopic.onlineResources || []).map((res) => {
                  let badgeColor = 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900';
                  let icon = <Video className="w-3.5 h-3.5" />;
                  let typeLabel = 'Videoaula';

                  if (res.type === 'ARTIGO') {
                    badgeColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900';
                    icon = <BookMarked className="w-3.5 h-3.5" />;
                    typeLabel = 'Artigo / Fichamento';
                  } else if (res.type === 'MAPA_MENTAL') {
                    badgeColor = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900';
                    icon = <GitFork className="w-3.5 h-3.5" />;
                    typeLabel = 'Mapa Mental';
                  } else if (res.type === 'RESUMO') {
                    badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900';
                    icon = <FileText className="w-3.5 h-3.5" />;
                    typeLabel = 'Exercícios Comentados';
                  }

                  return (
                    <div
                      key={res.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badgeColor}`}>
                            {icon}
                            {typeLabel}
                          </span>
                          {res.durationOrReadingTime && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              ⏱️ {res.durationOrReadingTime}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {res.title}
                        </h4>

                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          Canal / Fonte: {res.provider}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Acessar Conteúdo Externo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Didático de Orientação de Estudo Online */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Dica de Estudo Ativo com Conteúdo da Internet:</span>
                </div>
                <p className="leading-relaxed">
                  Evite assistir a videoaulas de forma passiva. Pause o vídeo quando o professor apresentar um exercício e tente resolver primeiro. Em seguida, confira a resolução e anote nos seus resumos ou flashcards os pontos onde teve dúvida!
                </p>
              </div>
            </div>
          )}

          {/* TAB 9: APOSTILAS DRIVE */}
          {activeTab === 'APOSTILAS_DRIVE' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <FolderDown className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Apostilas & Materiais do Google Drive — {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {driveMaterials.length} materiais didáticos completos para esta disciplina
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('biblioteca', { category: subject.name })}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Abrir na Biblioteca Geral</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {driveMaterials.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <FolderDown className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="text-xs text-slate-500">Nenhum material específico arquivado para esta disciplina.</p>
                  <button
                    onClick={() => onNavigate('biblioteca')}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Ver Biblioteca Completa
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {driveMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {mat.type}
                          </span>
                          {mat.subfolder && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                              {mat.subfolder}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {mat.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {mat.fileName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setPreviewDriveMaterial(mat)}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ler no App</span>
                        </button>

                        <a
                          href={mat.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Baixar"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={mat.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drive Material Reader Modal */}
      {previewDriveMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 md:p-6 animate-fade-in">
          <div
            className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/50 transition-all ${
              isFullscreenDrive ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
            }`}
          >
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {previewDriveMaterial.category}
                </span>
                <h3 className="font-bold text-xs md:text-sm text-white truncate max-w-md">
                  {previewDriveMaterial.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDriveMaterial.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar</span>
                </a>

                <a
                  href={previewDriveMaterial.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google Drive</span>
                </a>

                <button
                  onClick={() => setIsFullscreenDrive(!isFullscreenDrive)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title={isFullscreenDrive ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                >
                  {isFullscreenDrive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setPreviewDriveMaterial(null)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src={previewDriveMaterial.embedUrl}
                title={previewDriveMaterial.title}
                className="w-full h-full border-0"
                allow="autoplay"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
