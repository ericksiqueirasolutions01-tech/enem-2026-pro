import React, { useState } from 'react';
import { db } from '../../db/storage';
import { SimuladoAttempt, Essay } from '../../types';
import {
  TrendingUp,
  Award,
  Clock,
  HelpCircle,
  PenTool,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const Evolucao: React.FC = () => {
  const currentUser = db.getCurrentUser();
  const [periodo, setPeriodo] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');

  const stats = currentUser ? db.getStudentDashboardStats(currentUser.id) : null;
  const attempts: SimuladoAttempt[] = currentUser ? db.getAttempts(currentUser.id).filter((a: SimuladoAttempt) => !!a.finishedAt) : [];
  const essays: Essay[] = currentUser ? db.getEssays(currentUser.id) : [];

  // Dados comparativos reais: Primeiro simulado vs Último simulado
  const firstAttempt = attempts.length > 0 ? attempts[0] : null;
  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const firstScore = firstAttempt ? firstAttempt.scorePercentage : null;
  const lastScore = lastAttempt ? lastAttempt.scorePercentage : null;
  const growth = firstScore !== null && lastScore !== null ? lastScore - firstScore : null;

  // Mapa de matérias reais baseado nos acertos das tentativas
  const disciplineScoresMap: Record<string, { total: number; correct: number }> = {};
  attempts.forEach((att: SimuladoAttempt) => {
    Object.entries(att.disciplineScores || {}).forEach(([disc, val]: [string, any]) => {
      if (!disciplineScoresMap[disc]) disciplineScoresMap[disc] = { total: 0, correct: 0 };
      disciplineScoresMap[disc].total += val.total || 0;
      disciplineScoresMap[disc].correct += val.correct || 0;
    });
  });

  const mapaMaterias = Object.entries(disciplineScoresMap).map(([disciplina, val]) => {
    const taxa = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
    const status = taxa >= 75 ? 'VERDE' : taxa >= 60 ? 'AMARELO' : 'VERMELHO';
    return {
      disciplina,
      topico: `${val.correct} de ${val.total} questões corretas`,
      status,
      taxa,
    };
  });

  mapaMaterias.sort((a, b) => b.taxa - a.taxa);

  const accuracyData = attempts.map((att: SimuladoAttempt, i: number) => ({
    label: `Simulado ${i + 1}`,
    taxa: att.scorePercentage,
  }));

  const questionsCount = stats?.totalQuestionsAnswered ?? 0;
  const accuracyRate = stats?.accuracyRate ?? 0;
  const hoursStudied = stats?.totalHoursStudied ?? 0;
  const essaysCount = stats?.essaysCount ?? 0;
  const targetScore = stats?.profile?.targetScore ?? 800;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-brand-600" />
            Minha Evolução & Mapa de Domínio
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe seu avanço contínuo e identifique exatamente onde priorizar seus estudos.
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {[
            { id: '7D', label: '7 Dias' },
            { id: '30D', label: '30 Dias' },
            { id: '90D', label: '90 Dias' },
            { id: 'ALL', label: 'Todo Período' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriodo(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                periodo === tab.id
                  ? 'bg-brand-600 text-white font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPARATIVO: PRIMEIRO SIMULADO VS ÚLTIMO SIMULADO */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-[10px] font-black uppercase text-brand-300 tracking-wider">
            Comparativo de Desempenho
          </span>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
            {growth !== null ? (
              <>
                <ArrowUpRight className="w-4 h-4" /> {growth >= 0 ? `+${growth}%` : `${growth}%`} de Evolução
              </>
            ) : (
              <span>Aguardando 1º simulado</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Primeiro Simulado</span>
            <span className="text-3xl font-black font-mono">{firstScore !== null ? `${firstScore}%` : '--'}</span>
            <span className="text-[10px] text-slate-400 block">Diagnóstico Inicial</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Último Simulado</span>
            <span className="text-3xl font-black font-mono text-emerald-400">{lastScore !== null ? `${lastScore}%` : '--'}</span>
            <span className="text-[10px] text-emerald-300 block">Simulado Recente</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Meta ENEM</span>
            <span className="text-3xl font-black font-mono text-brand-400">{Math.round((targetScore / 1000) * 100)}%</span>
            <span className="text-[10px] text-brand-300 block">Nota ~{targetScore} pontos</span>
          </div>
        </div>
      </div>

      {/* RELATÓRIO CONSOLIDADO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Sua Semana no ENEM 2026
          </h3>
          <span className="text-xs text-slate-400 font-bold">Relatório Consolidado</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Questões Feitas</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">{questionsCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {questionsCount > 0 ? `${accuracyRate}% acertos` : '0 acertos'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tempo de Estudo</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">{hoursStudied}h</span>
            <span className="text-[10px] text-slate-500 font-bold">
              {hoursStudied > 0 ? 'Horas focadas' : 'Inicie sua 1ª sessão'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Redações Feitas</span>
            <span className="text-xl font-black font-mono text-purple-600">{essaysCount}</span>
            <span className="text-[10px] text-purple-600 font-bold">
              {essaysCount > 0 && stats?.essaysAverage ? `Média: ${stats.essaysAverage} pts` : 'Nenhum envio'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Maior Domínio</span>
            <span className="text-sm font-black text-emerald-600 block mt-1 truncate">
              {stats?.bestArea && questionsCount > 0 ? stats.bestArea.name : 'Ainda não há dados'}
            </span>
            <span className="text-[10px] text-slate-500">
              {stats?.bestArea && questionsCount > 0 ? `${stats.bestArea.rate}% acertos` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* MAPA DE DESEMPENHO (VERDE, AMARELO, VERMELHO) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              Mapa de Domínio por Assunto
            </h3>
            <p className="text-xs text-slate-500">
              Classificação pedagógica em tempo real com base no seu histórico de acertos
            </p>
          </div>

          {/* Legenda de Cores */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Bom Domínio (≥ 75%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Revisar (60-74%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Prioridade (&lt; 60%)</span>
            </div>
          </div>
        </div>

        {/* Grid dos Tópicos com Indicadores */}
        {mapaMaterias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mapaMaterias.map((item, idx) => {
              const isGreen = item.status === 'VERDE';
              const isYellow = item.status === 'AMARELO';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 space-y-2 ${
                    isGreen
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : isYellow
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {item.disciplina}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isGreen
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : isYellow
                          ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          : 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {isGreen ? 'Domínio' : isYellow ? 'Revisar' : 'Prioridade'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.topico}
                  </h4>

                  <div className="flex items-center justify-between text-xs font-mono font-bold pt-1">
                    <span className="text-slate-500">Aproveitamento:</span>
                    <span
                      className={
                        isGreen
                          ? 'text-emerald-600 font-black'
                          : isYellow
                          ? 'text-amber-600 font-black'
                          : 'text-rose-600 font-black'
                      }
                    >
                      {item.taxa}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Ainda não há dados suficientes para compor o Mapa de Domínio.
            </p>
            <p className="text-[11px] text-slate-400">
              Resolva simulados ou questões para ver o nível de proficiência em cada matéria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
