import React from 'react';
import { db } from '../../db/storage';
import { Essay, EssayTopic } from '../../types';
import {
  PenTool,
  Sparkles,
  Award,
  Clock,
  TrendingUp,
  Shuffle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RedacaoHomeProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const RedacaoHome: React.FC<RedacaoHomeProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const essays = currentUser ? db.getEssays(currentUser.id) : [];
  const topics = db.getEssayTopics();

  const correctedEssays = essays.filter((e) => e.status === 'CORRECTED' && e.correction);

  // Média e melhor nota
  const bestScore = correctedEssays.length > 0
    ? Math.max(...correctedEssays.map((e) => e.correction!.totalScore))
    : 880;

  const averageScore = correctedEssays.length > 0
    ? Math.round(
        correctedEssays.reduce((acc, e) => acc + e.correction!.totalScore, 0) /
          correctedEssays.length
      )
    : 820;

  // Gráfico de evolução nas redações
  const chartData = correctedEssays.length > 0
    ? correctedEssays.map((e, idx) => ({
        index: `Redação ${idx + 1}`,
        nota: e.correction!.totalScore,
      }))
    : [
        { index: 'Redação 1', nota: 680 },
        { index: 'Redação 2', nota: 760 },
        { index: 'Redação 3', nota: 840 },
      ];

  const handleSurpriseTheme = () => {
    const randomTopic = db.getRandomEssayTopic();
    if (randomTopic) {
      onNavigate('redacao_write', { topicId: randomTopic.id });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header com Ações Principais */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Matriz Oficial do ENEM • 5 Competências
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Laboratório de Redação ENEM
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Escreva na folha de 30 linhas, receba correção completa por inteligência artificial em segundos e domine a nota 900+.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {/* Botão Destaque: CRIAR NOVA REDAÇÃO */}
            <button
              onClick={() => onNavigate('redacao_write', { topicId: topics[0]?.id || 'tema-01' })}
              className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase px-6 py-4 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              <PenTool className="w-4 h-4 fill-slate-950" />
              <span>Criar Nova Redação</span>
            </button>

            {/* Tema Surpresa */}
            <button
              onClick={handleSurpriseTheme}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Tema Surpresa</span>
            </button>
          </div>
        </div>

        {/* 4 Cards de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-white/10 pt-4">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Redações Feitas</span>
            <span className="text-2xl font-black font-mono">{correctedEssays.length || 3}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Média Geral</span>
            <span className="text-2xl font-black text-purple-400 font-mono">{averageScore}</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Melhor Nota</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{bestScore}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Foco de Melhoria</span>
            <span className="text-xs font-black text-amber-400 block truncate mt-1">Competência 5 (Intervenção)</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução na Redação */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Evolução na Redação (0 a 1000 pontos)
            </h3>
            <p className="text-xs text-slate-500">
              Trajetória de pontuação conforme a matriz oficial de correção do ENEM
            </p>
          </div>
          <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
            Meta: 900+
          </span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[500, 1000]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="nota"
                name="Nota da Redação"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Catálogo de Temas Disponíveis */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Propostas de Redação Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Ano {t.year || 2026}</span>
                  <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                    {t.difficulty}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                  {t.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {t.theme}
                </p>

                <div className="text-[11px] text-slate-400 pt-1">
                  {t.motivatingTexts.length} textos motivadores incluídos
                </div>
              </div>

              <button
                onClick={() => onNavigate('redacao_write', { topicId: t.id })}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
              >
                Escrever Sobre Este Tema <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Redações já Realizadas */}
      {correctedEssays.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Suas Redações Corrigidas
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {correctedEssays.map((essay) => (
              <div
                key={essay.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-slate-900 dark:text-white">
                    {essay.topicTheme}
                  </h5>
                  <p className="text-xs text-slate-500">
                    Escrita em {new Date(essay.createdAt).toLocaleDateString('pt-BR')} • {essay.lineCount} linhas • {essay.timeSpentMinutes} minutos
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black text-purple-600 font-mono block">
                      {essay.correction?.totalScore} / 1000
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Nota Estimada</span>
                  </div>

                  <button
                    onClick={() => onNavigate('redacao_report', { essayId: essay.id })}
                    className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs uppercase hover:bg-purple-100 cursor-pointer"
                  >
                    Ver Relatório
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

