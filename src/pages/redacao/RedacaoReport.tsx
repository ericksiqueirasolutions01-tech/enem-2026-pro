import React, { useState } from 'react';
import { db } from '../../db/storage';
import { Essay } from '../../types';
import {
  Sparkles,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
  Info,
} from 'lucide-react';

interface RedacaoReportProps {
  essayId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const RedacaoReport: React.FC<RedacaoReportProps> = ({ essayId, onNavigate }) => {
  const essay = db.getEssayById(essayId);
  const [selectedCompetency, setSelectedCompetency] = useState<number>(1);

  if (!essay || !essay.correction) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-slate-500">Relatório de redação não encontrado.</p>
        <button
          onClick={() => onNavigate('redacao')}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase"
        >
          Voltar para Redação
        </button>
      </div>
    );
  }

  const { correction } = essay;
  const activeComp = correction.competencies.find((c) => c.number === selectedCompetency) || correction.competencies[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
      {/* Botão Voltar */}
      <button
        onClick={() => onNavigate('redacao')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Painel de Redação
      </button>

      {/* Hero da Nota Geral */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Correção Oficial por Inteligência Artificial
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {essay.topicTheme}
            </h2>
            <p className="text-xs text-slate-300">
              Escrita em {new Date(essay.createdAt).toLocaleString('pt-BR')} • {essay.lineCount} linhas • {essay.timeSpentMinutes} minutos
            </p>
          </div>

          <div className="text-right shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-purple-300 uppercase block">Nota Estimada</span>
            <span className="text-4xl sm:text-5xl font-black text-white font-mono">
              {correction.totalScore}
            </span>
            <span className="text-xs text-slate-400 font-bold block">/ 1000 pontos</span>
          </div>
        </div>

        {/* Resumo Pedagógico */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
          {correction.pedagogicalSummary}
        </div>

        {/* Alerta de Nota Zero se houver */}
        {correction.isZeroScore && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <strong className="block font-black uppercase">Possível condição de nota zero detectada</strong>
              <p className="text-rose-300 mt-0.5">{correction.zeroScoreReason}</p>
            </div>
          </div>
        )}

        {/* Mandatory Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Nota estimada para fins de estudo. Não corresponde à correção oficial do ENEM.</span>
        </div>
      </div>

      {/* Grid das 5 Competências do ENEM */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {correction.competencies.map((comp) => {
          const isSelected = selectedCompetency === comp.number;

          return (
            <button
              key={comp.number}
              onClick={() => setSelectedCompetency(comp.number)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 shadow-md scale-102'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                <span>Comp. {comp.number}</span>
              </div>
              <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                {comp.score}
              </div>
              <span className="text-[10px] text-slate-500 font-bold block truncate">
                de 200 pontos
              </span>
            </button>
          );
        })}
      </div>

      {/* Detalhamento da Competência Selecionada */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
              Análise Individualizada
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Competência {activeComp.number}: {activeComp.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-purple-600 font-mono">
              {activeComp.score} / 200
            </span>
          </div>
        </div>

        {/* 4 Quadrantes de Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pontos Positivos */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Pontos Fortes Identificados
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {activeComp.positives.map((pos, idx) => (
                <li key={idx} className="leading-relaxed">{pos}</li>
              ))}
            </ul>
          </div>

          {/* O que melhorar */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              O Que Melhorar
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {activeComp.improvements.map((imp, idx) => (
                <li key={idx} className="leading-relaxed">{imp}</li>
              ))}
            </ul>
          </div>

          {/* Exemplos no texto */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600 shrink-0" />
              Trechos Identificados
            </span>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 italic">
              {activeComp.examplesFound.map((ex, idx) => (
                <li key={idx} className="leading-relaxed">"{ex}"</li>
              ))}
            </ul>
          </div>

          {/* Sugestões Práticas */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2">
            <span className="text-xs font-black uppercase text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              Sugestão Prática de Estudo
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {activeComp.suggestions.map((sug, idx) => (
                <li key={idx} className="leading-relaxed">{sug}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Análise Especial dos 5 Elementos da Proposta de Intervenção (se Comp. 5 selecionada) */}
        {activeComp.number === 5 && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Conferência dos 5 Elementos da Proposta de Intervenção
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: '1. Agente', el: correction.proposalElements.agente },
                { name: '2. Ação', el: correction.proposalElements.acao },
                { name: '3. Modo / Meio', el: correction.proposalElements.modo },
                { name: '4. Finalidade', el: correction.proposalElements.finalidade },
                { name: '5. Detalhamento', el: correction.proposalElements.detalhamento },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    item.el.detected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <span>{item.name}</span>
                    <span>{item.el.detected ? '✓' : '✕'}</span>
                  </div>
                  <p className="text-[10px] leading-tight opacity-90">{item.el.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Texto Original com Anotações */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          Texto Original da Redação
        </h3>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-loose whitespace-pre-line font-serif">
          {essay.text}
        </div>
      </div>
    </div>
  );
};

