import React, { useState } from 'react';
import { db } from '../../db/storage';
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

  // Dados comparativos do prompt: Primeiro simulado vs Último
  const firstScore = 58;
  const lastScore = 76;
  const growth = lastScore - firstScore;

  // Matérias e Tópicos com Mapa de Cores (Verde, Amarelo, Vermelho)
  const mapaMaterias = [
    { disciplina: 'Matemática', topico: 'Funções de 1º e 2º Grau', status: 'VERDE', taxa: 84 },
    { disciplina: 'Matemática', topico: 'Geometria Espacial (Volumes)', status: 'AMARELO', taxa: 68 },
    { disciplina: 'Matemática', topico: 'Probabilidade e Combinações', status: 'VERMELHO', taxa: 48 },
    { disciplina: 'Física', topico: 'Eletrodinâmica e Circuitos', status: 'AMARELO', taxa: 64 },
    { disciplina: 'Física', topico: 'Ondulatória e Acústica', status: 'VERMELHO', taxa: 52 },
    { disciplina: 'Química', topico: 'Termoquímica e Entalpia', status: 'VERMELHO', taxa: 50 },
    { disciplina: 'Biologia', topico: 'Ecologia e Cadeias Tróficas', status: 'VERDE', taxa: 88 },
    { disciplina: 'História', topico: 'Era Vargas e Trabalhismo', status: 'VERDE', taxa: 82 },
    { disciplina: 'Geografia', topico: 'Urbanização e Segregação', status: 'VERDE', taxa: 86 },
    { disciplina: 'Filosofia', topico: 'Ética Aristotélica', status: 'AMARELO', taxa: 70 },
    { disciplina: 'Português', topico: 'Funções da Linguagem', status: 'VERDE', taxa: 90 },
    { disciplina: 'Literatura', topico: 'Modernismo e Variação', status: 'VERDE', taxa: 80 },
  ];

  const accuracyData = [
    { label: 'Semana 1', taxa: 58 },
    { label: 'Semana 2', taxa: 64 },
    { label: 'Semana 3', taxa: 70 },
    { label: 'Semana 4', taxa: 76 },
  ];

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
            <ArrowUpRight className="w-4 h-4" /> +{growth}% de Evolução
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Primeiro Simulado</span>
            <span className="text-3xl font-black font-mono">{firstScore}%</span>
            <span className="text-[10px] text-slate-400 block">Diagnóstico Inicial</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Último Simulado</span>
            <span className="text-3xl font-black font-mono text-emerald-400">{lastScore}%</span>
            <span className="text-[10px] text-emerald-300 block">Simulado Recente</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Meta ENEM</span>
            <span className="text-3xl font-black font-mono text-brand-400">82%</span>
            <span className="text-[10px] text-brand-300 block">Nota ~820 pontos</span>
          </div>
        </div>
      </div>

      {/* RELATÓRIO SEMANAL AUTOMÁTICO (46. RELATÓRIO SEMANAL) */}
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
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">148</span>
            <span className="text-[10px] text-emerald-600 font-bold">112 acertos (75,6%)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tempo de Estudo</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">18h 45m</span>
            <span className="text-[10px] text-slate-500 font-bold">Média de 3,7h/dia</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Redações Feitas</span>
            <span className="text-xl font-black font-mono text-purple-600">1</span>
            <span className="text-[10px] text-purple-600 font-bold">Nota: 840 / 1000</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Maior Salto</span>
            <span className="text-sm font-black text-emerald-600 block mt-1">Matemática</span>
            <span className="text-[10px] text-slate-500">+12% acertos</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mapaMaterias.map((item, idx) => {
            const isGreen = item.status === 'VERDE';
            const isYellow = item.status === 'AMARELO';
            const isRed = item.status === 'VERMELHO';

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
      </div>
    </div>
  );
};

