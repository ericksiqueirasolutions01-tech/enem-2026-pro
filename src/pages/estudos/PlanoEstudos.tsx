import React, { useState } from 'react';
import { db } from '../../db/storage';
import { StudyPlanTask } from '../../types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Filter,
  Sliders,
  Check,
  Calendar,
  Target,
  Flame,
  Award,
  AlertCircle,
} from 'lucide-react';

interface PlanoEstudosProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const PlanoEstudos: React.FC<PlanoEstudosProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const profile = currentUser ? db.getStudentProfile(currentUser.id) : null;
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Estados do Questionário Adaptativo
  const [examDate, setExamDate] = useState('2026-11-08');
  const [dailyHours, setDailyHours] = useState(profile?.studyHoursPerDay || 4);
  const [difficulties, setDifficulties] = useState<string[]>([
    'Matemática',
    'Física',
    'Química',
    'Redação',
  ]);
  const [targetCourse, setTargetCourse] = useState(profile?.targetCourse || '');

  const allDisciplines = [
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'Redação',
    'Língua Portuguesa',
    'Literatura',
    'História',
    'Geografia',
    'Filosofia',
    'Sociologia',
    'Inglês',
  ];

  const toggleDifficulty = (disc: string) => {
    if (difficulties.includes(disc)) {
      setDifficulties(difficulties.filter((d) => d !== disc));
    } else {
      setDifficulties([...difficulties, disc]);
    }
  };

  const handleSavePlanConfig = () => {
    if (currentUser) {
      db.updateProfile(currentUser.id, {
        studyHoursPerDay: dailyHours,
        targetCourse: targetCourse,
      });
    }
    setShowConfigModal(false);
  };

  const days = [
    { num: 1, name: 'Segunda-feira', subjects: 'Matemática + Português', icon: '📐' },
    { num: 2, name: 'Terça-feira', subjects: 'Biologia + História', icon: '🧬' },
    { num: 3, name: 'Quarta-feira', subjects: 'Redação + Química', icon: '✍️' },
    { num: 4, name: 'Quinta-feira', subjects: 'Física + Geografia', icon: '⚡' },
    { num: 5, name: 'Sexta-feira', subjects: 'Filosofia + Sociologia', icon: '🏛️' },
    { num: 6, name: 'Sábado', subjects: 'Simulado + Revisão', icon: '📝' },
    { num: 0, name: 'Domingo', subjects: 'Descanso / Planejamento', icon: '☕' },
  ];

  const tasks = db.getStudyPlanTasks();
  const currentTasks = tasks.filter((t) => t.dayOfWeek === selectedDay);
  const completedCount = currentTasks.filter((t) => t.completed).length;

  // Dias até a prova
  const examDateTime = new Date(`${examDate}T08:00:00`);
  const now = new Date();
  const diffDays = Math.max(1, Math.ceil((examDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
      {/* 1. HEADER DO PLANO ADAPTATIVO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-black uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cronograma Adaptativo ENEM 2026
            </span>
            <span className="text-xs text-slate-300 font-bold">
              ⏱️ Faltam {diffDays} dias
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Plano de Estudos Semanal & Metas
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Calibrado para <strong>{targetCourse || 'seu objetivo'}</strong> com rotina de <strong>{dailyHours}h por dia</strong>. Reforço automático nas matérias de maior peso e revisão espaçada.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Ajustar Plano</span>
          </button>

          <button
            onClick={() => onNavigate('pomodoro')}
            className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Clock className="w-4 h-4 fill-slate-950" />
            <span>Foco Pomodoro</span>
          </button>
        </div>
      </div>

      {/* 2. PAINEL DE METAS DIÁRIAS E SEMANAIS (ITEM 13 REQUISITADO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metas Diárias */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              Metas Diárias de Hoje
            </span>
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold">
              {dailyHours}h programadas
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                📝 25 questões das matérias do dia
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">18 / 25</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                ⏱️ {dailyHours} ciclos de estudo focado (Pomodoro)
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-black">2 / {dailyHours}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                🔄 Revisão de 24h (3 questões do dia anterior)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Concluída ✓</span>
            </div>
          </div>
        </div>

        {/* Metas Semanais */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Metas Semanais (Ciclo 2026)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              72% da semana concluída
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>150 Questões Resolvidas</span>
                <span className="font-mono text-brand-600">145 / 150</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>1 Redação Completa Avaliada</span>
                <span className="font-mono text-emerald-600">1 / 1 (880 pts) ✓</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>1 Simulado de Fim de Semana</span>
                <span className="font-mono text-indigo-600">Programado p/ Sábado</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CRONOGRAMA SEMANAL (DIAS DA SEMANA - TABS CONFORME ESPECIFICADO NO ITEM 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-600" />
            Estrutura Semanal do Plano Adaptativo
          </h3>
          <span className="text-xs text-slate-400">Clique no dia para ver tarefas</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {days.map((d) => {
            const isSelected = selectedDay === d.num;

            return (
              <button
                key={d.num}
                onClick={() => setSelectedDay(d.num)}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                  isSelected
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {d.name.split('-')[0]}
                    </span>
                    <span>{d.icon}</span>
                  </div>
                  <h4 className={`text-xs font-black mt-1 leading-snug ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>
                    {d.subjects}
                  </h4>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>{d.num === 6 ? 'Simulado' : d.num === 0 ? 'Descanso' : 'Teoria + Questões'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TAREFAS DETALHADAS DO DIA SELECIONADO */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {days.find((d) => d.num === selectedDay)?.icon}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {days.find((d) => d.num === selectedDay)?.name} — {days.find((d) => d.num === selectedDay)?.subjects}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Blocos recomendados para completar hoje ({completedCount} de {currentTasks.length} tarefas finalizadas)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('materias')}
              className="px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs hover:bg-brand-100 transition-colors cursor-pointer"
            >
              Ver Apostilas do Dia
            </button>
          </div>
        </div>

        {selectedDay === 0 ? (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <span className="text-4xl">☕</span>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Domingo é Dia de Descanso Ativo & Recarga
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              O descanso é parte fundamental da consolidação da memória. Aproveite para passear, dormir bem ou dar uma olhada leve nas metas da próxima semana.
            </p>
          </div>
        ) : currentTasks.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <p className="text-xs text-slate-500">
              Nenhuma tarefa pendente para este dia. Aproveite para revisar o Caderno de Erros!
            </p>
            <button
              onClick={() => onNavigate('erros')}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Abrir Caderno de Erros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <button
                    onClick={() => db.toggleTaskCompleted(task.id)}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors cursor-pointer mt-0.5 sm:mt-0 ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-brand-600'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                        {task.discipline}
                      </span>
                      <span className="text-xs text-slate-400">• {task.area.replace(/_/g, ' ')}</span>
                      {difficulties.includes(task.discipline) && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                          Prioritária
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {task.topic}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>⏱️ {task.durationMinutes} minutos</span>
                      {task.targetQuestions > 0 && <span>📝 Meta: {task.targetQuestions} questões</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onNavigate(task.area === 'REDACAO' ? 'redacao' : 'questoes')}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Iniciar Estudo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DO QUESTIONÁRIO ADAPTATIVO (REQUISITADO NO ITEM 13) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Questionário Adaptativo
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Campo 1: Data da Prova */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                1. Data da Prova Alvo
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">
                Padrão: 08/11/2026 (ENEM 2026)
              </p>
            </div>

            {/* Campo 2: Horas por dia */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                2. Horas de Estudo por Dia
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDailyHours(h)}
                    className={`py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      dailyHours === h
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {h}h/dia
                  </button>
                ))}
              </div>
            </div>

            {/* Campo 3: Matérias com maior dificuldade */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                3. Matérias com Maior Dificuldade
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {allDisciplines.map((disc) => {
                  const isChecked = difficulties.includes(disc);
                  return (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => toggleDifficulty(disc)}
                      className={`p-2 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 text-brand-700 dark:text-brand-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{disc}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                O cronograma aumentará o tempo e quantidade de questões nessas matérias.
              </p>
            </div>

            {/* Ações */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePlanConfig}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase cursor-pointer shadow-sm"
              >
                Salvar & Gerar Cronograma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
