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

      <div className="flex-1 flex w-full">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      <BottomNav
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />

      {/* Floating AI Tutor Button (Seção 15: 🤖 Tutor IA) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in">
        <button
          onClick={() => setAiModalOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-brand-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 backdrop-blur-md"
          title="Tutor IA ENEM — Explicar questões, resumos, planos e dúvidas"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-lg">🤖</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase">
            Tutor IA
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
