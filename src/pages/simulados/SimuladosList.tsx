import React, { useState, useMemo } from 'react';
import { db } from '../../db/storage';
import { Simulado, ExamDay } from '../../types';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Building2,
  Layers,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface SimuladosListProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SimuladosList: React.FC<SimuladosListProps> = ({ onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState<string>('TODOS');
  const [selectedSystem, setSelectedSystem] = useState<string>('TODOS');

  const currentUser = db.getCurrentUser();
  const attempts = currentUser ? db.getAttempts(currentUser.id) : [];

  // Somente simulados da categoria ENEM 2026
  const enemSimulados = useMemo(() => {
    return db.getSimuladosByCategory('ENEM_2026');
  }, []);

  const attemptsBySimId = useMemo(() => {
    const map: Record<string, any> = {};
    attempts.forEach((a) => {
      if (!map[a.simulationId] || new Date(a.finishedAt) > new Date(map[a.simulationId].finishedAt)) {
        map[a.simulationId] = a;
      }
    });
    return map;
  }, [attempts]);

  const filteredSimulados = useMemo(() => {
    return enemSimulados.filter((s) => {
      const matchDay = selectedDay === 'TODOS' || s.day === selectedDay;
      const matchSystem = selectedSystem === 'TODOS' || s.systemOrigin === selectedSystem;
      return matchDay && matchSystem;
    });
  }, [enemSimulados, selectedDay, selectedSystem]);

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-700 p-6 md:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulações Nacionais 100% no Padrão Inep</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Simulados ENEM 2026 Oficiais
          </h1>
          <p className="text-sm md:text-base text-brand-100 leading-relaxed font-medium">
            Pratique no ambiente de prova real com os cadernos dos principais sistemas educacionais do país (SAS, Poliedro, Bernoulli, Apeiron, Somos e HPlus). Cadernos separados por Dia 1 e Dia 2 com cronômetro, seleção de idioma e correção automática.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/15">
            <button
              onClick={() => onNavigate('vestibulares')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Procurando Sírio-Libanês ou UNICAMP? Acesse "Outros Vestibulares"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs: Day 1 vs Day 2 + Systems */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Day selection */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'TODOS', label: 'Todos os Cadernos' },
              { id: 'DIA_1', label: 'Dia 1 (Linguagens + Humanas + Redação)' },
              { id: 'DIA_2', label: 'Dia 2 (Natureza + Matemática)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDay(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDay === tab.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* System selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'TODOS', label: 'Todos os Sistemas' },
              { id: 'SAS', label: 'SAS' },
              { id: 'POLIEDRO', label: 'Poliedro' },
              { id: 'BERNOULLI', label: 'Bernoulli' },
              { id: 'APEIRON', label: 'Apeiron' },
              { id: 'HPLUS', label: 'HPlus' },
              { id: 'SOMOS', label: 'Somos' },
            ].map((sys) => (
              <button
                key={sys.id}
                onClick={() => setSelectedSystem(sys.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSystem === sys.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {sys.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulados Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSimulados.map((sim) => {
          const attempt = attemptsBySimId[sim.id];
          const isDone = !!attempt;

          const isDay1 = sim.day === 'DIA_1';

          return (
            <div
              key={sim.id}
              className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {sim.institution || 'Sistema de Ensino'}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                      isDay1
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}>
                      {isDay1 ? 'Caderno Dia 1' : 'Caderno Dia 2'}
                    </span>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído ({attempt.scorePercentage}%)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                      Não iniciado
                    </span>
                  )}
                </div>

                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {sim.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {sim.description}
                </p>

                {/* Exam Details Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-brand-600" /> {sim.totalQuestions} questões
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" /> {Math.floor(sim.timeLimitMinutes / 60)}h{sim.timeLimitMinutes % 60 > 0 ? ` ${sim.timeLimitMinutes % 60}min` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> Ano {sim.year}
                  </span>
                  {isDay1 && (
                    <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded">
                      Inglês / Espanhol
                    </span>
                  )}
                </div>

                {sim.sourceNotes && (
                  <div className="text-[11px] text-slate-400 italic">
                    {sim.sourceNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {isDone ? (
                  <>
                    <button
                      onClick={() => onNavigate('simulado_result', { attemptId: attempt.id })}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" /> Ver Gabarito & Resolução
                    </button>
                    <button
                      onClick={() => onNavigate('simulado_run', { simuladoId: sim.id })}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-brand-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Refazer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate('simulado_run', { simuladoId: sim.id })}
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" /> Iniciar Simulado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
