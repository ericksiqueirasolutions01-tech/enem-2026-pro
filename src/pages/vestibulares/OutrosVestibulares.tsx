import React, { useState, useMemo } from 'react';
import { db } from '../../db/storage';
import { Simulado, SimuladoAttempt } from '../../types';
import {
  GraduationCap,
  FileCheck2,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

interface OutrosVestibularesProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const OutrosVestibulares: React.FC<OutrosVestibularesProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const [selectedInstitution, setSelectedInstitution] = useState<string>('TODOS');

  // Filtrar simulados especificamente da categoria OUTROS_VESTIBULARES
  const vestibularesList = useMemo(() => {
    return db.getSimuladosByCategory('OUTROS_VESTIBULARES');
  }, []);

  const attempts = useMemo(() => {
    return currentUser ? db.getAttempts(currentUser.id) : [];
  }, [currentUser]);

  const attemptsBySimId = useMemo(() => {
    const map: Record<string, SimuladoAttempt> = {};
    attempts.forEach((a) => {
      if (!map[a.simulationId] || new Date(a.finishedAt) > new Date(map[a.simulationId].finishedAt)) {
        map[a.simulationId] = a;
      }
    });
    return map;
  }, [attempts]);

  const filteredVestibulares = useMemo(() => {
    if (selectedInstitution === 'TODOS') return vestibularesList;
    return vestibularesList.filter((v) => v.institution?.toLowerCase().includes(selectedInstitution.toLowerCase()) || v.systemOrigin === selectedInstitution);
  }, [vestibularesList, selectedInstitution]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-teal-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Exames Tradicionais e Faculdades Privadas de Medicina</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Outros Grandes Vestibulares
          </h1>
          <p className="text-sm md:text-base text-emerald-100 leading-relaxed font-medium">
            Ambiente exclusivo separado do ENEM para você treinar com provas objetivas e discursivas de bancas renomadas como Sírio-Libanês (Vunesp), UNICAMP (Comvest), FUVEST e mais, com gabaritos oficiais e resoluções analíticas.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Provas Reais & Simuladas
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Gabaritos & Resoluções Passo a Passo
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Histórico Isolado por Vestibular
            </span>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'TODOS', label: 'Todos os Vestibulares' },
          { id: 'SIRIO_LIBANES', label: 'Sírio-Libanês' },
          { id: 'UNICAMP', label: 'UNICAMP' },
          { id: 'FUVEST', label: 'FUVEST / USP' },
          { id: 'UNESP', label: 'UNESP / VUNESP' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedInstitution(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedInstitution === tab.id
                ? 'bg-teal-700 text-white shadow-md shadow-teal-600/20 font-black'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vestibulares List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredVestibulares.map((simulado) => {
          const lastAttempt = attemptsBySimId[simulado.id];
          const isDone = !!lastAttempt;

          return (
            <div
              key={simulado.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {simulado.institution || 'Vestibular'}
                  </span>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Realizado ({lastAttempt.scorePercentage}%)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                      Disponível
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                  {simulado.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                  {simulado.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> {simulado.totalQuestions} questões
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> {Math.floor(simulado.timeLimitMinutes / 60)}h{simulado.timeLimitMinutes % 60 > 0 ? ` ${simulado.timeLimitMinutes % 60}min` : ''}
                  </span>
                  {simulado.sourceNotes && (
                    <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                      • {simulado.sourceNotes}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isDone ? (
                  <>
                    <button
                      onClick={() => onNavigate('simulado_result', { attemptId: lastAttempt.id })}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" /> Ver Gabarito & Resolução
                    </button>
                    <button
                      onClick={() => onNavigate('simulado_run', { simuladoId: simulado.id })}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Refazer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate('simulado_run', { simuladoId: simulado.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" /> Começar Prova Agora
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

