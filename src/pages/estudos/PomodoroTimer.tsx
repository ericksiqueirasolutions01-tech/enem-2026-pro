import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { Disciplina } from '../../types';
import { Clock, Play, Pause, RotateCcw, CheckCircle2, Sparkles, BookOpen, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PomodoroTimerProps {
  onNavigate: (route: string) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutos
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Disciplina>('Matemática');
  const [topicName, setTopicName] = useState('Resolução de Questões');
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleFinishSession = () => {
    if (currentUser) {
      db.recordStudySession({
        userId: currentUser.id,
        discipline: selectedDiscipline,
        topic: topicName,
        durationMinutes: selectedDuration,
        sessionType: 'POMODORO',
        date: new Date().toISOString().split('T')[0],
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setSessionCompleted(true);
      setTimeout(() => setSessionCompleted(false), 5000);
    }
  };

  const handleSelectPreset = (mins: number) => {
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(selectedDuration * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((selectedDuration * 60 - secondsLeft) / (selectedDuration * 60)) * 100;

  return (
    <div className="max-w-xl w-full mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-black uppercase">
            <Clock className="w-3.5 h-3.5" /> Cronômetro de Foco Pomodoro
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Sessão de Alta Performance
          </h2>
          <p className="text-xs text-slate-500">
            Elimine distrações. Todo minuto focado acumula XP e constrói sua aprovação.
          </p>
        </div>

        {/* Presets de Duração */}
        <div className="flex justify-center gap-2">
          {[
            { label: '25 min (Pomodoro)', mins: 25 },
            { label: '45 min (Bloco)', mins: 45 },
            { label: '60 min (Aprofundado)', mins: 60 },
          ].map((preset) => (
            <button
              key={preset.mins}
              type="button"
              onClick={() => handleSelectPreset(preset.mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedDuration === preset.mins
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Círculo do Cronômetro */}
        <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800 shadow-inner">
          {/* Progress Ring visual */}
          <div className="text-5xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {isRunning ? 'Em Foco...' : 'Pronto'}
          </span>
        </div>

        {/* Seleção da Matéria e Tópico */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Disciplina
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value as Disciplina)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none"
            >
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biologia">Biologia</option>
              <option value="Redação">Redação</option>
              <option value="História">História</option>
              <option value="Geografia">Geografia</option>
              <option value="Português">Português</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Tópico / Atividade
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Ex: Funções, Leitura..."
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reiniciar tempo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/30'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Pausar Foco
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> Iniciar Estudo
              </>
            )}
          </button>
        </div>

        {sessionCompleted && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Sessão concluída com sucesso! Seus minutos foram registrados no painel de horas.</span>
          </div>
        )}
      </div>
    </div>
  );
};
