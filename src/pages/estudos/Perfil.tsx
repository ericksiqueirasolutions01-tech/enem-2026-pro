import React, { useState } from 'react';
import { db } from '../../db/storage';
import { User, StudentProfile } from '../../types';
import {
  UserCircle,
  Mail,
  GraduationCap,
  Building,
  Target,
  Clock,
  Calendar,
  MapPin,
  Save,
  CheckCircle2,
  Flame,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react';

interface PerfilProps {
  currentUser: User | null;
  onNavigate: (route: string) => void;
}

const ALL_SUBJECTS = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Português',
  'Literatura',
  'Inglês',
  'Redação',
];

export const Perfil: React.FC<PerfilProps> = ({ currentUser, onNavigate }) => {
  const profile = currentUser ? db.getStudentProfile(currentUser.id) : null;

  const [name, setName] = useState(currentUser?.name || '');
  const [targetCourse, setTargetCourse] = useState(profile?.targetCourse || 'Medicina');
  const [targetUniversity, setTargetUniversity] = useState(profile?.targetUniversity || 'USP');
  const [targetScore, setTargetScore] = useState(profile?.targetScore || 800);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(profile?.studyHoursPerDay || 4);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(profile?.studyDaysPerWeek || 6);
  const [city, setCity] = useState(profile?.city || 'São Paulo');
  const [state, setState] = useState(profile?.state || 'SP');
  const [school, setSchool] = useState(profile?.school || 'Escola Estadual');
  const [difficultSubjects, setDifficultSubjects] = useState<string[]>(
    profile?.difficultSubjects || ['Matemática', 'Física']
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleSubject = (sub: string) => {
    if (difficultSubjects.includes(sub)) {
      setDifficultSubjects(difficultSubjects.filter((s) => s !== sub));
    } else {
      setDifficultSubjects([...difficultSubjects, sub]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Atualiza profile
    db.updateProfile(currentUser.id, {
      targetCourse,
      targetUniversity,
      targetScore: Number(targetScore),
      studyHoursPerDay: Number(studyHoursPerDay),
      studyDaysPerWeek: Number(studyDaysPerWeek),
      city,
      state,
      school,
      difficultSubjects,
    });

    // Se nome mudou, atualiza no storage também
    if (name !== currentUser.name) {
      const users = db.getUsers();
      const uIndex = users.findIndex((u) => u.id === currentUser.id);
      if (uIndex >= 0) {
        users[uIndex].name = name;
        db.setCurrentUser(users[uIndex], true);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          <UserCircle className="w-4 h-4" />
          <span>Configurações da Conta</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Meu Perfil & Metas do ENEM 2026
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personalize seus objetivos de curso, faculdade desejada e ritmo de estudos para receber recomendações adaptativas.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Seu perfil e metas foram atualizados com sucesso!</span>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.email}`}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-950/50 p-2 border-2 border-brand-500/30 shadow-sm"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {name || currentUser?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser?.email}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>Objetivo: <strong>{targetCourse}</strong> na <strong>{targetUniversity}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick badges */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-sm font-black">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{profile?.streakDays || 8}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Dias Ofensiva</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-black">
              <Zap className="w-4 h-4 fill-brand-500" />
              <span>Nvl {profile?.level || 6}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Nível Atual</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-black">
              <Target className="w-4 h-4" />
              <span>{targetScore}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Meta TRI</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <GraduationCap className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Dados do Candidato & Metas ENEM</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            {/* Curso Desejado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Curso dos Sonhos
              </label>
              <input
                type="text"
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                placeholder="Ex: Medicina, Direito, Computação"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            {/* Faculdade Alvo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Faculdade dos Sonhos
              </label>
              <input
                type="text"
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="Ex: USP, UNICAMP, UFRJ, UFMG"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            {/* Meta de Nota */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Meta de Média TRI (0 a 1000)
              </label>
              <input
                type="number"
                min="400"
                max="1000"
                step="5"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            {/* Horas de Estudo por Dia */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Horas de Estudo Diárias
              </label>
              <select
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                <option value={1}>1 hora por dia</option>
                <option value={2}>2 horas por dia</option>
                <option value={3}>3 horas por dia</option>
                <option value={4}>4 horas por dia (Recomendado)</option>
                <option value={6}>6 horas por dia (Intensivo)</option>
                <option value={8}>8 horas por dia (Dedicação exclusiva)</option>
              </select>
            </div>

            {/* Dias por Semana */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dias por Semana
              </label>
              <select
                value={studyDaysPerWeek}
                onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                <option value={4}>4 dias por semana</option>
                <option value={5}>5 dias por semana (Seg a Sex)</option>
                <option value={6}>6 dias por semana (Seg a Sáb)</option>
                <option value={7}>7 dias por semana (Todos os dias)</option>
              </select>
            </div>

            {/* Cidade / Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cidade
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Estado (UF)
              </label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Escola / Formação
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ex: Escola Pública / Particular"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Dificuldades */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Matérias que você sente maior dificuldade (O plano priorizará estas matérias):
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SUBJECTS.map((sub) => {
                const isSelected = difficultSubjects.includes(sub);

                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sub} {isSelected && '✕'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

