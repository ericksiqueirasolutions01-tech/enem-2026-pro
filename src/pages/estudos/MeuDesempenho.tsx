import React, { useMemo } from 'react';
import { db } from '../../db/storage';
import { SimuladoAttempt } from '../../types';
import {
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck2,
} from 'lucide-react';

interface MeuDesempenhoProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const MeuDesempenho: React.FC<MeuDesempenhoProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const summary = currentUser ? db.getStudentPerformanceSummary(currentUser.id) : null;
  const attempts: SimuladoAttempt[] = currentUser ? db.getAttempts(currentUser.id).filter((a: SimuladoAttempt) => !!a.finishedAt) : [];

  // Calcular disciplina com maior dificuldade e disciplina de melhor desempenho
  const disciplinePerformance = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};

    attempts.forEach((att: SimuladoAttempt) => {
      Object.entries(att.disciplineScores || {}).forEach(([disc, data]: [string, any]) => {
        if (!map[disc]) map[disc] = { total: 0, correct: 0 };
        map[disc].total += data.total || 0;
        map[disc].correct += data.correct || 0;
      });
    });

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      correct: data.correct,
      rate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    list.sort((a, b) => b.rate - a.rate);

    return {
      best: list.length > 0 ? list[0] : null,
      weakest: list.length > 0 ? list[list.length - 1] : null,
      all: list,
    };
  }, [attempts]);

  // Desempenho real por área do conhecimento
  const areaPerformance = useMemo(() => {
    const areaMap: Record<string, { total: number; correct: number }> = {
      MATEMATICA: { total: 0, correct: 0 },
      LINGUAGENS: { total: 0, correct: 0 },
      CIENCIAS_HUMANAS: { total: 0, correct: 0 },
      CIENCIAS_DA_NATUREZA: { total: 0, correct: 0 },
    };

    attempts.forEach((att: SimuladoAttempt) => {
      Object.entries(att.areaScores || {}).forEach(([area, val]: [string, any]) => {
        if (areaMap[area]) {
          areaMap[area].total += val.total || 0;
          areaMap[area].correct += val.correct || 0;
        }
      });
    });

    const getRate = (area: string) => {
      const a = areaMap[area];
      return a.total > 0 ? Math.round((a.correct / a.total) * 100) : null;
    };

    return [
      {
        label: 'Matemática',
        color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
        rate: getRate('MATEMATICA'),
      },
      {
        label: 'Linguagens',
        color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
        rate: getRate('LINGUAGENS'),
      },
      {
        label: 'Ciências Humanas',
        color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
        rate: getRate('CIENCIAS_HUMANAS'),
      },
      {
        label: 'Ciências da Natureza',
        color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
        rate: getRate('CIENCIAS_DA_NATUREZA'),
      },
    ];
  }, [attempts]);

  const hasData = attempts.length > 0 && disciplinePerformance.all.length > 0;
  const questionsAnswered = summary?.totalQuestionsAnswered ?? 0;
  const accuracyRate = questionsAnswered > 0 ? (summary?.accuracyRate ?? 0) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Recommendation Banner */}
      {hasData && disciplinePerformance.weakest ? (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Diagnóstico Inteligente ENEM 2026</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Você precisa revisar: {disciplinePerformance.weakest.name}
            </h2>
            <p className="text-xs md:text-sm text-orange-100 font-medium">
              Seu índice de acertos em {disciplinePerformance.weakest.name} é de {disciplinePerformance.weakest.rate}%. Foque nos tópicos prioritários para elevar sua nota TRI e garantir a sua vaga.
            </p>
          </div>

          <button
            onClick={() => onNavigate('materias')}
            className="px-6 py-3 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Estudar Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-brand-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Diagnóstico Inteligente ENEM 2026</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Sua jornada começa agora
            </h2>
            <p className="text-xs md:text-sm text-indigo-100 font-medium">
              Conclua seu primeiro simulado para começar a acompanhar sua evolução por disciplina e áreas de conhecimento.
            </p>
          </div>

          <button
            onClick={() => onNavigate('simulados')}
            className="px-6 py-3 rounded-2xl bg-white text-brand-700 hover:bg-slate-100 font-black text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Fazer Primeiro Simulado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Média Geral de Acertos</span>
            <Award className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {questionsAnswered > 0 ? `${accuracyRate}%` : '--'}
          </div>
          <span className="text-[11px] text-slate-400 font-bold block mt-1">
            {questionsAnswered > 0 ? 'Calculado a partir das suas respostas' : 'Ainda não há dados'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Simulados Concluídos</span>
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {attempts.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {questionsAnswered} questões respondidas
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Melhor Desempenho</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 truncate">
            {disciplinePerformance.best?.name || 'Ainda não há dados'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {disciplinePerformance.best ? `${disciplinePerformance.best.rate}% de acertos` : '--'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Maior Dificuldade</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 truncate">
            {disciplinePerformance.weakest?.name || 'Ainda não há dados'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {disciplinePerformance.weakest ? `${disciplinePerformance.weakest.rate}% de acertos` : '--'}
          </span>
        </div>
      </div>

      {/* Gráficos e Barras de Desempenho por Matéria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acertos por Matéria */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              Taxa de Acertos por Disciplina
            </h3>
            <span className="text-xs text-slate-400">Meta: 80%</span>
          </div>

          {hasData ? (
            <div className="space-y-3.5">
              {disciplinePerformance.all.map((item) => {
                const isWeak = item.name === disciplinePerformance.weakest?.name;

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${isWeak ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.name} {isWeak && '⚠️'}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.rate}% ({item.correct}/{item.total})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.rate >= 75
                            ? 'bg-emerald-500'
                            : item.rate >= 60
                            ? 'bg-brand-500'
                            : item.rate >= 45
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Ainda não há dados de disciplinas.
              </p>
              <p className="text-[11px] text-slate-400">
                Resolva questões ou conclua um simulado para gerar seu ranking por matéria.
              </p>
            </div>
          )}
        </div>

        {/* Desempenho por Área de Conhecimento */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Desempenho por Áreas do ENEM
            </h3>
            <span className="text-xs text-slate-400">ENEM 2026</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {areaPerformance.map((area) => (
              <div
                key={area.label}
                className={`p-4 rounded-xl border ${area.color} flex flex-col justify-between`}
              >
                <div>
                  <div className="text-xs font-bold">{area.label}</div>
                  <div className="text-2xl font-black mt-1">
                    {area.rate !== null ? `${area.rate}%` : '--'}
                  </div>
                </div>
                <span className="text-[10px] font-semibold mt-2 opacity-80">
                  {area.rate !== null
                    ? area.rate >= 75
                      ? 'Excelente rendimento'
                      : area.rate >= 60
                      ? 'Bom domínio'
                      : area.rate >= 45
                      ? 'Regular/Estável'
                      : 'Atenção redobrada'
                    : 'Ainda não há dados'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico dos Simulados Realizados */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Histórico Cronológico de Provas e Simulados
          </h3>
          <button
            onClick={() => onNavigate('simulados')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            Fazer Novo Simulado →
          </button>
        </div>

        {attempts.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {attempts.map((att: SimuladoAttempt) => (
              <div
                key={att.id}
                className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                    {att.simulationTitle}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span>{new Date(att.finishedAt).toLocaleDateString('pt-BR')}</span>
                    <span>• {att.correctCount} acertos de {att.totalQuestions}</span>
                    {att.foreignLanguage && <span>• Opção: {att.foreignLanguage}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
                    {att.scorePercentage}% de Acerto
                  </span>
                  <button
                    onClick={() => onNavigate('simulado_result', { attemptId: att.id })}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-brand-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Ver Relatório
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhum simulado finalizado ainda. Inicie seu primeiro simulado quando estiver pronto para acompanhar suas métricas!
          </div>
        )}
      </div>
    </div>
  );
};
