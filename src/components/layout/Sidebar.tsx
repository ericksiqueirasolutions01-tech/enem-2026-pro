import React from 'react';
import { db } from '../../db/storage';
import { User } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileCheck2,
  PenTool,
  CalendarDays,
  AlertOctagon,
  TrendingUp,
  Bookmark,
  UserCircle,
  Shield,
  Sparkles,
  Target,
  GraduationCap,
  FolderDown,
} from 'lucide-react';
import { DRIVE_MATERIALS } from '../../db/driveMaterialsData';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
}) => {
  const mistakes = currentUser ? db.getMistakes(currentUser.id).filter((m) => !m.isMastered) : [];
  const enemSimulados = db.getSimuladosByCategory('ENEM_2026');
  const outrosVestibulares = db.getSimuladosByCategory('OUTROS_VESTIBULARES');
  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  interface SidebarNavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }

  const estudosItems: SidebarNavItem[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    {
      id: 'materias',
      label: 'Matérias',
      icon: BookOpen,
      badge: `${DRIVE_MATERIALS.length}`,
      badgeColor: 'bg-brand-600',
    },
    { id: 'plano', label: 'Plano de Estudos', icon: CalendarDays },
    { id: 'questoes', label: 'Banco de Questões', icon: HelpCircle },
    {
      id: 'simulados',
      label: 'Simulados ENEM 2026',
      icon: FileCheck2,
      badge: `${enemSimulados.length}`,
    },
    { id: 'redacao', label: 'Redação', icon: PenTool, highlight: true },
  ];

  const desempenhoItems: SidebarNavItem[] = [
    { id: 'desempenho', label: 'Meu Desempenho', icon: TrendingUp },
    {
      id: 'erros',
      label: 'Questões Erradas',
      icon: AlertOctagon,
      badge: mistakes.length > 0 ? `${mistakes.length}` : undefined,
      badgeColor: 'bg-rose-500',
    },
    { id: 'favoritos', label: 'Favoritos', icon: Bookmark },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'perfil', label: 'Perfil', icon: UserCircle },
  ];

  const outrosItems: SidebarNavItem[] = [
    {
      id: 'etec',
      label: 'Vestibulinho ETEC',
      icon: GraduationCap,
      badge: 'NOVO',
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'vestibulares',
      label: 'Outros Vestibulares',
      icon: GraduationCap,
      badge: `${outrosVestibulares.length}`,
      badgeColor: 'bg-teal-600',
    },
  ];

  const renderNavGroup = (title: string, items: SidebarNavItem[]) => (
    <div className="space-y-1">
      <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>{title}</span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentRoute === item.id || (item.id === 'materias' && currentRoute === 'biblioteca');

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.badgeColor
                    ? `${item.badgeColor} text-white`
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-5rem)] p-3 select-none">
      <div className="space-y-3 flex-1">
        {/* 1. GRUPO: ESTUDOS */}
        {renderNavGroup('ESTUDOS', estudosItems)}

        {/* 2. GRUPO: DESEMPENHO */}
        {renderNavGroup('DESEMPENHO', desempenhoItems)}

        {/* 3. GRUPO: OUTROS */}
        {renderNavGroup('OUTROS', outrosItems)}

        {/* 4. GRUPO: ADMINISTRAÇÃO (Apenas Administrador) */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMINISTRAÇÃO</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  currentRoute === 'admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-black'
                    : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Painel Admin Geral</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gamification / Motivation Card */}
      <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800/60 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="font-black text-brand-900 dark:text-brand-200 uppercase tracking-tight">
            ENEM 2026 PRO
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Você está no caminho certo para sua aprovação. Mantenha o ritmo!
        </p>
      </div>
    </aside>
  );
};

