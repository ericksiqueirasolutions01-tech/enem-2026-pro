import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../db/storage';
import { Simulado, Question, SimuladoAttempt, SimuladoAnswer, ForeignLanguage } from '../../types';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Check,
  X,
  Pause,
  Play,
  Globe,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimuladoExamProps {
  simuladoId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SimuladoExam: React.FC<SimuladoExamProps> = ({ simuladoId, onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const simulado = db.getSimuladoById(simuladoId);

  // Foreign language modal requirement for Dia 1
  const requiresLanguageSelection = simulado?.hasForeignLanguage || simulado?.day === 'DIA_1';
  const [selectedLanguage, setSelectedLanguage] = useState<ForeignLanguage | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(requiresLanguageSelection);

  // Timer states with pause option
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    const saved = localStorage.getItem(`enem2026_exam_time_${simuladoId}`);
    return saved ? Number(saved) : (simulado?.timeLimitMinutes || 240) * 60;
  });
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Questions filtering based on selected language if Dia 1
  const rawQuestions: Question[] = useMemo(() => {
    return (simulado?.questionIds || [])
      .map((qid) => db.getQuestionById(qid))
      .filter((q): q is Question => q !== null);
  }, [simulado]);

  const questions: Question[] = useMemo(() => {
    if (!requiresLanguageSelection || !selectedLanguage) return rawQuestions;
    // Exclude foreign language questions of the other language
    const otherLang = selectedLanguage === 'INGLES' ? 'Espanhol' : 'Inglês';
    return rawQuestions.filter((q) => q.discipline !== otherLang);
  }, [rawQuestions, requiresLanguageSelection, selectedLanguage]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state with auto-load from localStorage
  const [answers, setAnswers] = useState<Record<string, SimuladoAnswer>>(() => {
    const saved = localStorage.getItem(`enem2026_exam_answers_${simuladoId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`enem2026_exam_review_${simuladoId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const startTimeRef = useRef(new Date().toISOString());

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(`enem2026_exam_answers_${simuladoId}`, JSON.stringify(answers));
  }, [answers, simuladoId]);

  useEffect(() => {
    localStorage.setItem(`enem2026_exam_review_${simuladoId}`, JSON.stringify(markedForReview));
  }, [markedForReview, simuladoId]);

  useEffect(() => {
    localStorage.setItem(`enem2026_exam_time_${simuladoId}`, timeLeftSeconds.toString());
  }, [timeLeftSeconds, simuladoId]);

  // Timer effect
  useEffect(() => {
    if (isTimerPaused || showLanguageModal) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finalizarProva();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, showLanguageModal]);

  if (!simulado || rawQuestions.length === 0) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <p className="text-sm font-bold text-slate-500">Simulado não encontrado ou sem questões cadastradas.</p>
        <button
          onClick={() => onNavigate('simulados')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md shadow-brand-500/20 cursor-pointer"
        >
          Voltar para Lista de Simulados
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQuestion) return;
    const isCorrect = letter === currentQuestion.correctOption;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: letter,
        isCorrect,
        markedForReview: !!markedForReview[currentQuestion.id],
        timeSpentSeconds: 45,
      },
    }));
  };

  const toggleReview = (qid: string) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qid]: !prev[qid],
    }));
  };

  const finalizarProva = () => {
    if (!currentUser) return;

    // Clean cached exam state
    localStorage.removeItem(`enem2026_exam_answers_${simuladoId}`);
    localStorage.removeItem(`enem2026_exam_review_${simuladoId}`);
    localStorage.removeItem(`enem2026_exam_time_${simuladoId}`);

    let correctCount = 0;
    let wrongCount = 0;

    const areaScores: Record<string, { total: number; correct: number; percentage: number }> = {};
    const disciplineScores: Record<string, { total: number; correct: number; percentage: number }> = {};

    questions.forEach((q) => {
      const userAns = answers[q.id];
      const isCorrect = userAns?.selectedOption === q.correctOption;

      if (isCorrect) correctCount++;
      else if (userAns?.selectedOption) wrongCount++;

      // Area scores
      if (!areaScores[q.area]) {
        areaScores[q.area] = { total: 0, correct: 0, percentage: 0 };
      }
      areaScores[q.area].total++;
      if (isCorrect) areaScores[q.area].correct++;

      // Discipline scores
      if (!disciplineScores[q.discipline]) {
        disciplineScores[q.discipline] = { total: 0, correct: 0, percentage: 0 };
      }
      disciplineScores[q.discipline].total++;
      if (isCorrect) disciplineScores[q.discipline].correct++;
    });

    Object.keys(areaScores).forEach((area) => {
      const a = areaScores[area];
      a.percentage = Math.round((a.correct / a.total) * 100);
    });
    Object.keys(disciplineScores).forEach((disc) => {
      const d = disciplineScores[disc];
      d.percentage = Math.round((d.correct / d.total) * 100);
    });

    const scorePercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const totalTimeSpent = Math.max(1, (simulado.timeLimitMinutes * 60) - timeLeftSeconds);

    const attempt: SimuladoAttempt = {
      id: `att-${Date.now()}`,
      simulationId: simulado.id,
      simulationTitle: simulado.title,
      simulationCategory: simulado.category || 'ENEM_2026',
      userId: currentUser.id,
      foreignLanguage: selectedLanguage || undefined,
      startedAt: startTimeRef.current,
      finishedAt: new Date().toISOString(),
      timeSpentSeconds: totalTimeSpent,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercentage,
      areaScores,
      disciplineScores,
      answers,
    };

    db.saveAttempt(attempt);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });

    onNavigate('simulado_result', { attemptId: attempt.id });
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* 1. Modal de Seleção Obrigatória de Língua Estrangeira (Dia 1) */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-3 py-1 rounded-full">
                ENEM 2026 • Caderno Dia 1
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Escolha da Língua Estrangeira
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Assim como no exame oficial do ENEM, você deve selecionar qual idioma responderá (Questões 1 a 5). Sua escolha não poderá ser alterada durante a prova.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('INGLES');
                  setShowLanguageModal(false);
                }}
                className="p-4 rounded-2xl border-2 border-brand-200 dark:border-brand-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1">🇬🇧</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Inglês</div>
                <div className="text-[10px] text-slate-400 mt-0.5">5 questões</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('ESPANHOL');
                  setShowLanguageModal(false);
                }}
                className="p-4 rounded-2xl border-2 border-brand-200 dark:border-brand-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1">🇪🇸</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Espanhol</div>
                <div className="text-[10px] text-slate-400 mt-0.5">5 questões</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Floating Navigation Bar: Timer, Pause, Finalizar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 sticky top-16 z-30">
        <div>
          <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {simulado.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-0.5">
            <span>Questão {currentIndex + 1} de {questions.length}</span>
            {selectedLanguage && (
              <span className="text-brand-600 dark:text-brand-400 font-bold">• Idioma: {selectedLanguage}</span>
            )}
            <span>• {currentQuestion?.discipline}</span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTimerPaused
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title={isTimerPaused ? 'Retomar Simulado' : 'Pausar Cronômetro'}
          >
            {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTimerPaused ? 'Pausado' : 'Pausar'}</span>
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs sm:text-sm font-black border ${
              timeLeftSeconds < 600
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-md shadow-brand-500/20 cursor-pointer"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Pause Overlay if active */}
      {isTimerPaused && (
        <div className="p-8 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-bounce" />
          <h3 className="text-base font-black text-amber-900 dark:text-amber-200">
            Simulado Pausado
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 max-w-sm mx-auto">
            O cronômetro está congelado. Respire fundo, tome uma água e clique em "Retomar" quando estiver pronto para continuar.
          </p>
          <button
            onClick={() => setIsTimerPaused(false)}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
          >
            Retomar Simulado
          </button>
        </div>
      )}

      {/* Main Examination View */}
      {!isTimerPaused && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Question & Options */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono font-black text-xs">
                    QUESTÃO #{currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {currentQuestion.source || simulado.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleReview(currentQuestion.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    markedForReview[currentQuestion.id]
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {markedForReview[currentQuestion.id] ? 'Marcada para Revisão' : 'Revisar depois'}
                </button>
              </div>

              {/* Support Text */}
              {currentQuestion.supportText && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-line">
                  {currentQuestion.supportText}
                </div>
              )}

              {/* Statement */}
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion.statement}
              </div>

              {/* Alternatives (GABARITO HIDDEN DURING EXAM) */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id]?.selectedOption === opt.letter;

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => handleSelectOption(opt.letter)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-950 dark:text-brand-100 shadow-sm font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>

                <div className="text-xs font-bold text-slate-400">
                  {currentIndex + 1} de {questions.length}
                </div>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Próxima <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Question Navigator (Mapa de Questões) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-36">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  Mapa de Questões
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>Respondida</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <span>Em branco</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-amber-400" />
                  <span>Revisar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md border-2 border-brand-500 bg-brand-50 dark:bg-brand-950" />
                  <span>Atual</span>
                </div>
              </div>

              {/* Questions Map Grid */}
              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id]?.selectedOption;
                  const isMarked = !!markedForReview[q.id];
                  const isCurrent = idx === currentIndex;

                  let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200';

                  if (isAnswered) {
                    colorClass = 'bg-emerald-500 text-white font-black shadow-xs';
                  }
                  if (isMarked) {
                    colorClass = 'bg-amber-400 text-amber-950 font-black';
                  }
                  if (isCurrent) {
                    colorClass += ' ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 font-black scale-105';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${colorClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Finish Exam Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md shadow-brand-500/20 cursor-pointer"
              >
                Entregar Simulado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirmation Modal Before Submitting */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Finalizar Simulado?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Você respondeu <strong className="text-slate-900 dark:text-white">{answeredCount}</strong> de <strong className="text-slate-900 dark:text-white">{questions.length}</strong> questões.
                {unansweredCount > 0 && (
                  <span className="block text-rose-500 font-bold mt-1">
                    Ainda restam {unansweredCount} questões em branco!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Voltar à Prova
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  finalizarProva();
                }}
                className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-500/20 cursor-pointer"
              >
                Confirmar e Entregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
