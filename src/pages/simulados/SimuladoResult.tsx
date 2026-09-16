import React, { useState } from 'react';
import { db } from '../../db/storage';
import { SimuladoAttempt, Question } from '../../types';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Bookmark,
  Share2,
  Printer,
  Download,
  Building2,
  FileText,
} from 'lucide-react';

interface SimuladoResultProps {
  attemptId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SimuladoResult: React.FC<SimuladoResultProps> = ({ attemptId, onNavigate }) => {
  const [filterMode, setFilterMode] = useState<'TODAS' | 'ERRADAS' | 'ACERTOS'>('TODAS');
  const attempts = db.getAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);
  const simulado = attempt ? db.getSimuladoById(attempt.simulationId) : null;
  const currentUser = db.getCurrentUser();

  if (!attempt) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-slate-500">Resultado do simulado não encontrado.</p>
        <button
          onClick={() => onNavigate('simulados')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          Voltar aos Simulados
        </button>
      </div>
    );
  }

  const questions: Question[] = (simulado?.questionIds || [])
    .map((qid) => db.getQuestionById(qid))
    .filter((q): q is Question => q !== null);

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredQuestions = questions.filter((q) => {
    const isCorrect = attempt.answers[q.id]?.isCorrect;
    if (filterMode === 'ACERTOS') return isCorrect;
    if (filterMode === 'ERRADAS') return !isCorrect;
    return true;
  });

  const handlePrintOrDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-16">
      {/* Botões Topo: Voltar e Baixar/Imprimir */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => onNavigate('simulados')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos Simulados
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintOrDownload}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center gap-2 shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Baixar Simulado / Imprimir Espelho (PDF)</span>
          </button>
        </div>
      </div>

      {/* Espelho Cabeçalho para Impressão */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black uppercase text-slate-900">
              {simulado?.title || attempt.simulationTitle}
            </h1>
            <p className="text-xs text-slate-600 font-bold">
              Instituição: {simulado?.institution || 'Anglo Vestibulares'} • Ano: {simulado?.year || 2026}
            </p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Candidato(a):</strong> {currentUser?.name || 'Estudante'}</p>
            <p><strong>Data:</strong> {new Date(attempt.finishedAt).toLocaleDateString('pt-BR')} às {new Date(attempt.finishedAt).toLocaleTimeString('pt-BR')}</p>
            <p><strong>Tempo:</strong> {formatMinutes(attempt.timeSpentSeconds)}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs border border-slate-300 p-2 rounded-lg bg-slate-50">
          <div>Total Questões: <strong>{attempt.totalQuestions}</strong></div>
          <div>Acertos: <strong>{attempt.correctCount}</strong></div>
          <div>Erros: <strong>{attempt.wrongCount}</strong></div>
          <div>Nota: <strong>{attempt.scorePercentage}%</strong></div>
        </div>
      </div>

      {/* Hero Header do Resultado (Visão de Tela) */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-400/30">
                {simulado?.institution || 'Anglo Vestibulares'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Diagnóstico Oficial
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {attempt.simulationTitle}
            </h2>
            <p className="text-xs text-slate-300">
              Realizado em {new Date(attempt.finishedAt).toLocaleString('pt-BR')} • Tempo gasto: {formatMinutes(attempt.timeSpentSeconds)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Aproveitamento</span>
              <span className="text-3xl sm:text-4xl font-black text-brand-400 font-mono">
                {attempt.scorePercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Cards de Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Questões</span>
            <span className="text-xl font-black font-mono">{attempt.totalQuestions}</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Acertos</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{attempt.correctCount}</span>
          </div>
          <div className="bg-rose-950/40 p-3 rounded-2xl border border-rose-500/30">
            <span className="text-[10px] text-rose-300 uppercase font-bold block">Erros</span>
            <span className="text-xl font-black text-rose-400 font-mono">{attempt.wrongCount}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Em Branco</span>
            <span className="text-xl font-black font-mono">{attempt.unansweredCount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400 italic">
            * As questões erradas já foram registradas automaticamente no seu Caderno de Erros para você treinar e dominá-las!
          </p>

          <button
            onClick={handlePrintOrDownload}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Espelho da Prova</span>
          </button>
        </div>
      </div>

      {/* Cartão Resumo Respostas (Espelho Rápido de 1 a 40) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          <span>Espelho do Cartão-Resposta (Questões 1 a {questions.length})</span>
        </h3>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const ans = attempt.answers[q.id];
            const isCorrect = ans?.isCorrect;
            const chosen = ans?.selectedOption;

            return (
              <div
                key={q.id}
                className={`p-2 rounded-xl border text-center text-xs flex flex-col items-center justify-center ${
                  isCorrect
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : chosen
                    ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400">Q{idx + 1}</span>
                <span className="font-mono font-black text-sm my-0.5">
                  {chosen || '—'}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">
                  Gab: {q.correctOption}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desempenho por Área do Conhecimento */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-600" /> Desempenho por Área
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(attempt.areaScores || {}).map(([area, val]) => (
            <div
              key={area}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <span className="text-[10px] font-black uppercase text-slate-500 block truncate">
                {area.replace(/_/g, ' ')}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {val.percentage}%
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {val.correct}/{val.total} acertos
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full"
                  style={{ width: `${val.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GABARITO COMENTADO QUESTÃO A QUESTÃO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Gabarito Comentado Oficial Anglo
            </h3>
            <p className="text-xs text-slate-500">
              Revise a explicação detalhada de cada questão para fixar o conteúdo
            </p>
          </div>

          {/* Filtro do Gabarito */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterMode('TODAS')}
              className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                filterMode === 'TODAS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('ERRADAS')}
              className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                filterMode === 'ERRADAS'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Erros ({attempt.wrongCount})
            </button>
            <button
              onClick={() => setFilterMode('ACERTOS')}
              className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                filterMode === 'ACERTOS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Acertos ({attempt.correctCount})
            </button>
          </div>
        </div>

        {/* Lista de Questões Comentadas */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns?.isCorrect;
            const selectedOpt = userAns?.selectedOption;
            const qNumber = questions.findIndex((orig) => orig.id === q.id) + 1;

            return (
              <div
                key={q.id}
                className={`p-5 sm:p-6 rounded-2xl border-2 space-y-4 break-inside-avoid ${
                  isCorrect
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                }`}
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Questão {qNumber} • {q.discipline} ({q.topic})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <span>Sua resposta: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{selectedOpt || 'Em branco'}</strong></span>
                    <span>• Gabarito: <strong className="text-emerald-600">{q.correctOption}</strong></span>
                  </div>
                </div>

                {/* Texto de Apoio se houver */}
                {q.supportText && (
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                    {q.supportText}
                  </div>
                )}

                {/* Enunciado */}
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {q.statement}
                </p>

                {/* Alternativas com indicação visual */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isUserChoice = selectedOpt === opt.letter;
                    const isAnswerKey = q.correctOption === opt.letter;

                    return (
                      <div
                        key={opt.letter}
                        className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                          isAnswerKey
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 font-bold text-emerald-950 dark:text-emerald-100'
                            : isUserChoice && !isCorrect
                            ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400 font-bold text-rose-950 dark:text-rose-100'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-xs w-5">{opt.letter})</span>
                          <span>{opt.text}</span>
                        </div>
                        {isAnswerKey && (
                          <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 shrink-0">
                            Gabarito Oficial
                          </span>
                        )}
                        {isUserChoice && !isCorrect && (
                          <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-800 shrink-0">
                            Sua Resposta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Resolução Comentada */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <span className="font-black text-brand-600 dark:text-brand-400 uppercase text-[10px] tracking-wider block">
                    💡 Resolução Comentada Oficial do Professor:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </p>
                </div>

                {/* Ações da questão */}
                {!isCorrect && (
                  <div className="pt-1 flex items-center justify-end print:hidden">
                    <button
                      onClick={() => onNavigate('erros')}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Treinar no Caderno de Erros →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
