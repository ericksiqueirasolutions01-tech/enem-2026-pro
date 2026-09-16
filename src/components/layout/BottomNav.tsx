import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  PenTool,
  UserCircle,
} from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'estudar', label: 'Estudar', icon: BookOpen },
    { id: 'simulados', label: 'Simulados', icon: FileCheck2 },
    { id: 'redacao', label: 'Redação', icon: PenTool, isSpecial: true },
    { id: 'perfil', label: 'Perfil', icon: UserCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg select-none">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-brand-600 dark:text-brand-400' : ''}`} />
                {item.isSpecial && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

