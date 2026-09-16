import React, { useState } from 'react';
import { db } from '../../db/storage';
import { User, Achievement } from '../../types';
import {
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Target,
  Medal,
  Star,
  BookOpen,
  PenTool,
} from 'lucide-react';

interface ConquistasProps {
  currentUser: User | null;
  onNavigate: (route: string) => void;
}

export const Conquistas: React.FC<ConquistasProps> = ({ currentUser, onNavigate }) => {
  const profile = currentUser ? db.getStudentProfile(currentUser.id) : null;
  const achievements = db.getAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const currentXp = profile?.xp || 2850;
  const currentLevel = profile?.level || 6;
  const currentStreak = profile?.streakDays || 8;

  // Level thresholds: 500 XP per level
  const xpCurrentLevelBase = (currentLevel - 1) * 500;
  const xpNextLevelBase = currentLevel * 500;
  const xpInCurrentLevel = currentXp - xpCurrentLevelBase;
  const xpNeededForNext = 500;
  const levelProgressPct = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'TODAS') return true;
    return a.category === selectedCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
          <Trophy className="w-4 h-4" />
          <span>Gamificação & Premiações</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Conquistas, Nível & Recompensas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cada questão resolvida, simulado finalizado e redação enviada concede XP para você subir de nível rumo à sua aprovação.
        </p>
      </div>

      {/* Level & XP Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex flex-col items-center justify-center shadow-inner shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-100">Nível</span>
              <span className="text-3xl font-black">{currentLevel}</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Rumo ao Nível {currentLevel + 1}</span>
              </div>
              <h2 className="text-2xl font-black">
                {currentLevel >= 10 ? 'Mestre do ENEM 2026' : currentLevel >= 5 ? 'Vestibulando Avançado' : 'Estudante Focado'}
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Você já acumulou <strong className="text-white">{currentXp.toLocaleString('pt-BR')} XP</strong> ao longo da sua jornada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Streak Card */}
            <div className="px-4 py-3 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/20 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 mb-0.5">
                <Flame className="w-4 h-4 fill-amber-300" />
                <span className="text-xl font-black">{currentStreak} dias</span>
              </div>
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Ofensiva Atual</span>
            </div>

            {/* Unlocked badges count */}
            <div className="px-4 py-3 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/20 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 mb-0.5">
                <Award className="w-4 h-4" />
                <span className="text-xl font-black">{unlockedCount}/{achievements.length}</span>
              </div>
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Emblemas</span>
            </div>
          </div>
        </div>

        {/* Progress to next level bar */}
        <div className="mt-6 pt-5 border-t border-white/20">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>Progresso para o Nível {currentLevel + 1}</span>
            <span>{xpInCurrentLevel} / {xpNeededForNext} XP ({levelProgressPct}%)</span>
          </div>
          <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-200 to-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/70 mt-1.5">
            <span>Nível {currentLevel} ({xpCurrentLevelBase} XP)</span>
            <span>Faltam {xpNeededForNext - xpInCurrentLevel} XP</span>
            <span>Nível {currentLevel + 1} ({xpNextLevelBase} XP)</span>
          </div>
        </div>
      </div>

      {/* How to earn XP card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Tabela de Pontuação de Experiência (XP)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-lg font-black text-brand-600 dark:text-brand-400">+10 XP</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Questão Correta</div>
            <div className="text-[10px] text-slate-400 mt-0.5">No banco de questões</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-lg font-black text-purple-600 dark:text-purple-400">+250 XP</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Redação Corrigida</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Correção detalhada por IA</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">+200 XP</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Simulado Concluído</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Com diagnóstico completo</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">+75 XP</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">Superar um Erro</div>
            <div className="text-[10px] text-slate-400 mt-0.5">No caderno de erros</div>
          </div>
        </div>
      </div>

      {/* Badges Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Galeria de Conquistas & Emblemas
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'TODAS', label: 'Todas' },
              { id: 'OFENSIVA', label: 'Ofensiva' },
              { id: 'SIMULADOS', label: 'Simulados' },
              { id: 'REDACAO', label: 'Redação' },
              { id: 'QUESTOES', label: 'Questões' },
              { id: 'ESPECIAL', label: 'Especiais' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((item) => {
            const isUnlocked = Boolean(item.unlockedAt);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-amber-300/70 dark:border-amber-500/40 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                        isUnlocked
                          ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700'
                          : 'bg-slate-200 dark:bg-slate-800 grayscale'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Desbloqueada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        <span>Bloqueada</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    +{item.xpReward} XP
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

