import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { User, NotificationItem } from '../../types';
import {
  GraduationCap,
  Flame,
  Zap,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Shield,
  UserCheck,
  Check,
  Calendar,
  X,
  BookOpen,
  FileCheck2,
  PenTool,
  FolderDown,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  currentRoute,
  onOpenSearch,
}) => {
  const [profile, setProfile] = useState(() =>
    currentUser ? db.getStudentProfile(currentUser.id) : null
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    currentUser ? db.getNotifications(currentUser.id) : []
  );
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    return db.subscribe(() => {
      if (currentUser) {
        setProfile(db.getStudentProfile(currentUser.id));
        setNotifications(db.getNotifications(currentUser.id));
      }
    });
  }, [currentUser]);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('enem2026_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('enem2026_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dias até a prova do ENEM 2026
  const examDate = new Date('2026-11-08T08:00:00');
  const now = new Date();
  const diffDays = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const handleLogout = () => {
    db.setCurrentUser(null);
    onNavigate('landing');
  };

  const handleSwitchToAdmin = () => {
    const adminUser = db.getUsers().find((u) => u.role === 'ADMINISTRADOR');
    if (adminUser) {
      db.setCurrentUser(adminUser, true);
      onNavigate('admin');
    }
  };

  const handleSwitchToAluno = () => {
    const alunoUser = db.getUsers().find((u) => u.role === 'ALUNO');
    if (alunoUser) {
      db.setCurrentUser(alunoUser, true);
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* 1. Logo & Identidade Visual Reestruturada */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate(currentUser?.role === 'ADMINISTRADOR' ? 'admin' : 'dashboard')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-brand-500/40 transition-all border border-white/20 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                  ENEM <span className="text-brand-600 dark:text-brand-400">2026</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white tracking-widest shadow-xs">
                  PRO
                </span>
              </div>
              <div className="space-y-0">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 tracking-tight">
                  Plataforma de Aprovação Inteligente
                </p>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden md:block">
                  "Estude, evolua e conquiste sua vaga."
                </p>
              </div>
            </div>
          </button>

          {/* 11. Contador do ENEM Reestruturado */}
          <div className="hidden 2xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 shadow-xs shrink-0 whitespace-nowrap">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="leading-tight">
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Contagem Oficial</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Faltam <strong className="font-black text-amber-600 dark:text-amber-400 text-sm font-mono">{diffDays} dias</strong> para o ENEM 2026
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-xs hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate">Pesquisar matérias, questões, simulados...</span>
          <kbd className="ml-auto text-[10px] font-mono font-bold bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Nav Links on Header */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('materias')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              currentRoute === 'materias' || currentRoute === 'biblioteca'
                ? 'bg-brand-600 text-white shadow-xs font-black'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Matérias</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              currentRoute === 'materias' || currentRoute === 'biblioteca'
                ? 'bg-white text-brand-700'
                : 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
            }`}>
              428
            </span>
          </button>

          <button
            onClick={() => onNavigate('simulados')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRoute === 'simulados' || currentRoute.includes('simulado')
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Simulados</span>
          </button>

          <button
            onClick={() => onNavigate('redacao')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRoute.includes('redacao')
                ? 'bg-purple-600 text-white shadow-xs font-black'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Redação</span>
          </button>

          <button
            onClick={() => onNavigate('etec')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRoute === 'etec'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>ETEC</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              currentRoute === 'etec'
                ? 'bg-white text-emerald-700'
                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
            }`}>
              40Q
            </span>
          </button>
        </div>

        {/* User Stats & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge (Aluno) */}
          {currentUser?.role === 'ALUNO' && profile && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 text-xs font-black" title="Ofensiva de estudos diários">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{profile.streakDays}d</span>
            </div>
          )}

          {/* Level / XP Badge (Aluno) */}
          {currentUser?.role === 'ALUNO' && profile && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-bold" title="Nível e Pontos de Experiência">
              <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 fill-brand-600" />
              <span>Nível {profile.level}</span>
              <span className="text-[10px] opacity-75 font-mono">({profile.xp} XP)</span>
            </div>
          )}

          {/* Quick Search Button (Mobile/Tablet) */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notificações ({notifications.length})
                  </h4>
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Nenhuma notificação recente.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-xs flex items-start gap-3 cursor-pointer ${
                          !n.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                        }`}
                        onClick={() => {
                          db.markNotificationRead(n.id);
                          if (n.link) onNavigate(n.link);
                        }}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            n.type === 'success'
                              ? 'bg-emerald-500'
                              : n.type === 'alert'
                              ? 'bg-amber-500'
                              : 'bg-brand-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile / Role Switcher */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onNavigate('perfil')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                title="Meu Perfil"
              >
                <img
                  src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=aluno'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border-2 border-brand-500/40 bg-slate-100"
                />
                <div className="hidden xl:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 block">
                    {currentUser.role}
                  </span>
                </div>
              </button>

              {/* Quick Role Toggle button for development & testing */}
              {currentUser.role === 'ALUNO' ? (
                <button
                  onClick={handleSwitchToAdmin}
                  className="hidden md:flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 cursor-pointer transition-colors"
                  title="Alternar para o Painel do Administrador"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </button>
              ) : (
                <button
                  onClick={handleSwitchToAluno}
                  className="hidden md:flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer transition-colors"
                  title="Alternar para a Visão do Aluno"
                >
                  <UserCheck className="w-3 h-3" />
                  Aluno
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Sair da Plataforma"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
