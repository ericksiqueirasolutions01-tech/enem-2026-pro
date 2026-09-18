import React, { useState } from 'react';
import { db } from '../../db/storage';
import { userRepository } from '../../services/repositories/userRepository';
import { User, Disciplina } from '../../types';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Calendar, Search, GraduationCap, School, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingProps {
  currentUser: User | null;
  onComplete: () => void;
}

const PRESET_COURSES = [
  'Medicina',
  'Direito',
  'Engenharia Civil',
  'Psicologia',
  'Enfermagem',
  'Odontologia',
  'Administração',
  'Ciência da Computação',
  'Pedagogia',
  'Fisioterapia',
  'Arquitetura',
  'Biomedicina',
  'Outro',
];

export const Onboarding: React.FC<OnboardingProps> = ({ currentUser, onComplete }) => {
  const profile = currentUser ? db.getStudentProfile(currentUser.id) : null;

  const [step, setStep] = useState(1);
  // GATE 2: Valor inicial estritamente vazio ou nulo (nunca Medicina pré-selecionada)
  const [course, setCourse] = useState<string>(profile?.targetCourse || '');
  const [isOther, setIsOther] = useState(false);
  const [customCourse, setCustomCourse] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [targetUniversity, setTargetUniversity] = useState(profile?.targetUniversity || '');
  const [targetScore, setTargetScore] = useState(profile?.targetScore || 800);
  const [hoursPerDay, setHoursPerDay] = useState(profile?.studyHoursPerDay || 4);
  const [daysPerWeek, setDaysPerWeek] = useState(profile?.studyDaysPerWeek || 6);
  const [difficultSubjects, setDifficultSubjects] = useState<string[]>(
    profile?.difficultSubjects || ['Matemática', 'Física', 'Química']
  );
  const [examDate, setExamDate] = useState('2026-11-08');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const disciplinasDisponiveis: Disciplina[] = [
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'Redação',
    'História',
    'Geografia',
    'Filosofia',
    'Sociologia',
    'Português',
    'Literatura',
    'Inglês',
  ];

  const handleSelectCourse = (c: string) => {
    setErrorMsg(null);
    if (c === 'Outro') {
      setIsOther(true);
      setCourse('');
    } else {
      setIsOther(false);
      setCourse(c);
      setCustomCourse('');
    }
  };

  const activeSelectedCourse = isOther ? customCourse.trim() : course.trim();

  const handleStep1Next = () => {
    if (!activeSelectedCourse) {
      setErrorMsg('Por favor, selecione ou digite o curso que você deseja conquistar.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const toggleSubject = (sub: string) => {
    if (difficultSubjects.includes(sub)) {
      setDifficultSubjects(difficultSubjects.filter((s) => s !== sub));
    } else {
      setDifficultSubjects([...difficultSubjects, sub]);
    }
  };

  const handleFinish = async () => {
    if (currentUser) {
      const finalCourse = activeSelectedCourse || 'Geral / Não Definido';
      await userRepository.completeOnboarding(currentUser.id, {
        targetCourse: finalCourse,
        targetUniversity: targetUniversity.trim() || 'ENEM 2026',
        targetScore,
        studyHoursPerDay: hoursPerDay,
        studyDaysPerWeek: daysPerWeek,
        difficultSubjects,
        examDate,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onComplete();
    }
  };

  const filteredCourses = PRESET_COURSES.filter((c) =>
    c.toLowerCase().includes(courseSearch.toLowerCase().trim())
  );

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 my-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Personalize sua Jornada
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Etapa {step} de 3
          </span>
        </div>

        {/* STEP 1: Escolha do Curso & Faculdade (GATE 2 Oficial) */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-black">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Definição de Objetivo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Qual curso você quer conquistar?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Vamos personalizar sua preparação com base no seu objetivo. Você poderá alterar essa escolha depois.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-2">
                  Curso desejado <span className="text-rose-500">*</span>
                </label>

                {/* Barra de busca de cursos */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Filtrar opções ou buscar curso..."
                    className="w-full text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                {/* Chips de cursos sugeridos */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {filteredCourses.map((c) => {
                    const isSelected = (c === 'Outro' && isOther) || (!isOther && course === c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCourse(c)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm scale-105'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>

                {/* Se escolher 'Outro' ou quiser digitar curso livre */}
                {isOther && (
                  <div className="animate-in fade-in space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Digite o nome do seu curso:
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={customCourse}
                      onChange={(e) => {
                        setCustomCourse(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Ex: Relações Internacionais, Engenharia de Software..."
                      className="w-full text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-brand-500 rounded-2xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Faculdade / Universidade desejada (Opcional) */}
              <div>
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                  Faculdade ou Universidade dos seus sonhos (Opcional):
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    placeholder="Ex: USP, UNICAMP, UFRJ, UFMG, ENEM / SISU..."
                    className="w-full text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Meta de nota TRI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Sua meta de pontuação média:
                  </label>
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400 font-mono">
                    {targetScore} pts
                  </span>
                </div>
                <input
                  type="range"
                  min={550}
                  max={950}
                  step={10}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>550 (Básico)</span>
                  <span>700 (Bom)</span>
                  <span>800 (Excelente)</span>
                  <span>950 (Top 1%)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              Próximo: Ritmo e Horários <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Ritmo de Estudo & Dias Disponíveis */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Como será a sua rotina de estudos?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O ENEM 2026 PRO montará seu cronograma adaptativo de forma realista com a sua disponibilidade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-black text-xs uppercase">
                  <Clock className="w-4 h-4" /> Horas de estudo por dia
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {hoursPerDay}h / dia
                  </span>
                  <div className="flex gap-1">
                    {[2, 3, 4, 6].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoursPerDay(h)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer ${
                          hoursPerDay === h
                            ? 'bg-brand-600 text-white font-black'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase">
                  <Calendar className="w-4 h-4" /> Dias por semana
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {daysPerWeek} dias
                  </span>
                  <div className="flex gap-1">
                    {[4, 5, 6, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysPerWeek(d)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer ${
                          daysPerWeek === d
                            ? 'bg-indigo-600 text-white font-black'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                Data Prevista do ENEM 2026:
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Próximo: Matérias Difíceis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Matérias de Maior Dificuldade */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Quais matérias você sente mais dificuldade?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione as disciplinas onde você mais perde pontos para que o sistema priorize revisões e treinos nelas.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {disciplinasDisponiveis.map((sub) => {
                const isSelected = difficultSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{sub}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs uppercase py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" /> Concluir e Acessar Meu Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
