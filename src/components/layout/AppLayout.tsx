import React, { useState } from 'react';
import { User } from '../../types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SearchModal } from './SearchModal';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import { Bot, Sparkles } from 'lucide-react';

interface AppLayoutProps {
  currentUser: User | null;
  currentRoute: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  children,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Telas sem Sidebar e BottomNav (autenticação, onboarding, landing e tela de pendente)
  const isCleanLayout =
    currentRoute === 'login' ||
    currentRoute === 'cadastro' ||
    currentRoute === 'onboarding' ||
    currentRoute === 'landing' ||
    currentRoute === 'pending-approval';

  if (isCleanLayout) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors relative">
      <Navbar
        currentUser={currentUser}
        onNavigate={onNavigate}
        currentRoute={currentRoute}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <BottomNav
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

      {/* Floating AI Tutor Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in">
        <button
          onClick={() => setAiModalOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-full shadow-xl shadow-brand-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Tutor Inteligente de Estudos com IA"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            Tutor IA ENEM
          </span>
        </button>
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={onNavigate}
      />

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
