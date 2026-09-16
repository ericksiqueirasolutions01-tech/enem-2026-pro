import React, { useState } from 'react';
import { db } from '../../db/storage';
import { MistakeNotebookItem } from '../../types';
import {
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CadernoErrosProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const CadernoErros: React.FC<CadernoErrosProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const mistakes = currentUser ? db.getMistakes(currentUser.id) : [];

  // Estado para refazer questão
  const [activeRetryId, setActiveRetryId] = useState<string | null>(null);
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const pendingMistakes = mistakes.filter((m) => !m.isMastered);
  const masteredMistakes = mistakes.filter((m) => m.isMastered);

  const handleStartRetry = (item: MistakeNotebookItem) => {
    setActiveRetryId(item.id);
    setRetryAnswer(null);
    setRetryResult(null);
  };

  const handleConfirmRetry = (item: MistakeNotebookItem) => {
    if (!retryAnswer || !currentUser) return;

    const isCorrect = retryAnswer === item.correctOption;
    if (isCorrect) {
      db.markMistakeMastered(currentUser.id, item.questionId);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setRetryResult({
        isCorrect: true,
        message: 'Parabéns! Você dominou esta questão.',
      });
    } else {
      setRetryResult({
        isCorrect: false,
        message: 'Ainda não foi dessa vez. Revise a explicação do professor com calma.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
            Meu Caderno de Erros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aprenda com cada erro em simulados e treinos. Refaça até dominar 100% dos conceitos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {pendingMistakes.length} pendentes
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            {masteredMistakes.length} dominadas
          </span>
        </div>
      </div>

      {/* Lista de Questões no Caderno de Erros */}
      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Seu Caderno de Erros está limpo!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Quando você errar alguma questão nos simulados ou banco de questões, ela será guardada automaticamente aqui para você treinar.
          </p>
          <button
            onClick={() => onNavigate('questoes')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase cursor-pointer"
          >
            Treinar Questões Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((item) => {
            const isRetrying = activeRetryId === item.id;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
                  item.isMastered
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Meta info da questão errada */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.question.discipline}
                    </span>
                    <span className="text-xs text-slate-400">• {item.question.topic}</span>
                    <span className="text-[10px] text-slate-400">
                      (Errou em {new Date(item.failedAt).toLocaleDateString('pt-BR')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      Errou {item.timesFailed}x • Revisou {item.timesReviewed}x
                    </span>
                    {item.isMastered ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-black text-[10px] uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Dominada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-black text-[10px] uppercase">
                        Precisa Praticar
                      </span>
                    )}
                  </div>
                </div>

                {/* Enunciado */}
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.question.statement}
                </p>

                {/* Histórico do erro */}
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between">
                  <span className="text-rose-900 dark:text-rose-300">
                    Você marcou anteriormente a alternativa <strong className="font-mono">({item.selectedOption})</strong>.
                  </span>
                  <span className="text-slate-500 font-bold">
                    Gabarito Oficial: <strong className="font-mono text-emerald-600">({item.correctOption})</strong>
                  </span>
                </div>

                {/* Seção para Refazer a Questão */}
                {!isRetrying ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleStartRetry(item)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refazer Esta Questão
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-black uppercase text-brand-600 tracking-wider">
                      Escolha a resposta correta agora:
                    </h5>

                    <div className="space-y-2">
                      {item.question.options.map((opt) => (
                        <button
                          key={opt.letter}
                          type="button"
                          onClick={() => setRetryAnswer(opt.letter)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                            retryAnswer === opt.letter
                              ? 'bg-brand-50 dark:bg-brand-950 border-brand-600 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="font-mono font-black text-xs w-5">{opt.letter})</span>
                          <span className="text-xs pt-0.5">{opt.text}</span>
                        </button>
                      ))}
                    </div>

                    {/* Resultado da tentativa */}
                    {retryResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                          retryResult.isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-400'
                        }`}
                      >
                        {retryResult.isCorrect ? (
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{retryResult.message}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setActiveRetryId(null)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Fechar
                      </button>
                      <button
                        disabled={!retryAnswer}
                        onClick={() => handleConfirmRetry(item)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase cursor-pointer"
                      >
                        Confirmar Resposta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

