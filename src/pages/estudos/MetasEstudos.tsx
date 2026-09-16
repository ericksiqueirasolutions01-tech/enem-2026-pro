import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { StudentGoals, Disciplina } from '../../types';
import {
  Target,
  GraduationCap,
  Award,
  Clock,
  HelpCircle,
  CheckCircle2,
  Save,
  Sparkles,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

interface MetasEstudosProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const MetasEstudos: React.FC<MetasEstudosProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const [goals, setGoals] = useState<StudentGoals | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [targetCourse, setTargetCourse] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetScore, setTargetScore] = useState(800);
  const [weeklyQuestionsGoal, setWeeklyQuestionsGoal] = useState(200);
  const [weeklyHoursGoal, setWeeklyHoursGoal] = useState(25);
  const [monthlySimuladosGoal, setMonthlySimuladosGoal] = useState(4);

  useEffect(() => {
    if (currentUser) {
      const g = db.getStudentGoals(currentUser.id);
      setGoals(g);
      setTargetCourse(g.targetCourse);
      setTargetUniversity(g.targetUniversity);
      setTargetScore(g.targetScore);
      setWeeklyQuestionsGoal(g.weeklyQuestionsGoal);
      setWeeklyHoursGoal(g.weeklyHoursGoal);
      setMonthlySimuladosGoal(g.monthlySimuladosGoal);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !goals) return;

    const updated: StudentGoals = {
      ...goals,
      targetCourse,
      targetUniversity,
      targetScore,
      weeklyQuestionsGoal,
      weeklyHoursGoal,
      monthlySimuladosGoal,
      updatedAt: new Date().toISOString(),
    };

    db.saveStudentGoals(updated);
    setGoals(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!goals) return null;

  const questionsProgress = Math.min(100, Math.round((goals.weeklyQuestionsDone / (goals.weeklyQuestionsGoal || 1)) * 100));
  const hoursProgress = Math.min(100, Math.round((goals.weeklyHoursDone / (goals.weeklyHoursGoal || 1)) * 100));
  const simuladosProgress = Math.min(100, Math.round((goals.monthlySimuladosDone / (goals.monthlySimuladosGoal || 1)) * 100));

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Target className="w-3.5 h-3.5 text-amber-300" />
            <span>Planejamento Estratégico de Aprovação</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Minhas Metas de Estudo ENEM 2026
          </h1>
          <p className="text-sm md:text-base text-brand-100 leading-relaxed font-medium">
            Defina seu curso dos sonhos, nota de corte almejada e metas semanais de questões e horas para manter uma rotina consistente até o dia da prova.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t border-white/15">
            <div>
              <div className="text-xs text-brand-200 font-semibold">Curso Alvo</div>
              <div className="text-lg md:text-xl font-black text-white">{goals.targetCourse || 'Não definido'}</div>
            </div>
            <div>
              <div className="text-xs text-brand-200 font-semibold">Universidade</div>
              <div className="text-lg md:text-xl font-black text-white">{goals.targetUniversity || 'Não definida'}</div>
            </div>
            <div>
              <div className="text-xs text-brand-200 font-semibold">Nota Alvo TRI</div>
              <div className="text-lg md:text-xl font-black text-amber-300">{goals.targetScore} pts</div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Suas metas foram atualizadas com sucesso!
        </div>
      )}

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Questões Semanal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Questões Semanais</span>
            <HelpCircle className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {goals.weeklyQuestionsDone}
            </span>
            <span className="text-xs text-slate-400">/ {goals.weeklyQuestionsGoal} questões</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${questionsProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 block">
            {questionsProgress}% concluído esta semana
          </span>
        </div>

        {/* Horas de Estudo Semanal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Horas de Estudo</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {goals.weeklyHoursDone}h
            </span>
            <span className="text-xs text-slate-400">/ {goals.weeklyHoursGoal}h semanais</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${hoursProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
            {hoursProgress}% concluído esta semana
          </span>
        </div>

        {/* Simulados Mensais */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Simulados Mensais</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {goals.monthlySimuladosDone}
            </span>
            <span className="text-xs text-slate-400">/ {goals.monthlySimuladosGoal} simulados</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${simuladosProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
            {simuladosProgress}% concluído este mês
          </span>
        </div>
      </div>

      {/* Edit Form or Display Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configurações do Seu Objetivo
            </h3>
            <p className="text-xs text-slate-500">
              Mantenha estes dados atualizados com base no edital do seu curso e faculdade.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 text-xs font-bold transition-all cursor-pointer"
          >
            {isEditing ? 'Cancelar Edição' : 'Editar Metas'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Curso Desejado
              </label>
              <input
                type="text"
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                placeholder="Ex: Medicina, Direito, Engenharia..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Faculdade Desejada
              </label>
              <input
                type="text"
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="Ex: USP, UNICAMP, UFRJ, SISU..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nota Alvo ENEM (TRI Média)
              </label>
              <input
                type="number"
                min="500"
                max="1000"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meta Semanal de Questões
              </label>
              <input
                type="number"
                min="20"
                max="1000"
                value={weeklyQuestionsGoal}
                onChange={(e) => setWeeklyQuestionsGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meta Semanal de Horas de Estudo
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={weeklyHoursGoal}
                onChange={(e) => setWeeklyHoursGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meta Mensal de Simulados
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={monthlySimuladosGoal}
                onChange={(e) => setMonthlySimuladosGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Salvar Metas
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 block mb-1 font-semibold">Curso Alvo:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {goals.targetCourse}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 block mb-1 font-semibold">Instituição Alvo:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {goals.targetUniversity}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 block mb-1 font-semibold">Nota de Corte Média Desejada:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                {goals.targetScore} pontos
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

