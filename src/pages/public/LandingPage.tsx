import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileCheck2,
  PenTool,
  TrendingUp,
  Brain,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Flame,
  Award,
  Users,
  Layers,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { db } from '../../db/storage';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoaded(true), 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  const handleQuickLogin = (role: 'ALUNO' | 'ADMIN' | 'PENDENTE') => {
    if (role === 'ADMIN') {
      const res = db.login('admin@enem2026.com.br', 'admin');
      if (res.user) {
        onNavigate('admin');
      }
    } else if (role === 'ALUNO') {
      const res = db.login('aluno@enem2026.com.br', 'aluno123');
      if (res.user) {
        onNavigate('dashboard');
      }
    } else {
      const res = db.login('mariana.rocha@gmail.com', 'senha123');
      onNavigate('pending-approval');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight">ENEM 2026</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Plataforma Premium de Preparação</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Já sou Aluno
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-md shadow-brand-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
          >
            <span>Criar Conta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center space-y-12">
        {/* Animated Loading Bar Header if not fully loaded */}
        {!isLoaded && (
          <div className="max-w-md mx-auto w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                Carregando Ecossistema de Estudos...
              </span>
              <span className="font-mono text-brand-400 font-bold">{Math.min(100, loadProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, loadProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Preparação de Alto Nível para a Prova de 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            A MELHOR PLATAFORMA DE ESTUDOS PARA O <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">ENEM 2026</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Prepare-se com conteúdos completos, simulados, análise de desempenho e inteligência artificial para alcançar sua aprovação.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-black shadow-xl shadow-brand-600/30 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Quero Criar Minha Conta</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Acessar com E-mail</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid (Pastas, Drive, Redação, ETEC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Pastas de Matérias</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Linguagens, Humanas, Natureza e Matemática organizadas em pastas independentes com mais de 400 apostilas.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Simulados ENEM & ETEC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provas do Dia 1, Dia 2, Vestibulinho ETEC e outros grandes vestibulares com cronômetro e gabarito comentado.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Redação Nota 1000</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Digitação direta ou foto com correção pedagógica detalhada pelas 5 Competências oficiais do INEP.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Assistente de Estudos IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inteligência Artificial que explica questões, cria resumos dinâmicos e identifica suas maiores dificuldades.
            </p>
          </div>
        </div>

        {/* Section: Depoimentos Ilustrativos */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Depoimentos ilustrativos de demonstração</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Histórias de Sucesso e Disciplina
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Depois que comecei meus estudos pela plataforma consegui organizar minha rotina e fui aprovado no curso que queria."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs">
                  L
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lucas</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Aprovado ENEM 2026</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Os simulados mostraram exatamente onde eu precisava melhorar."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mariana</h4>
                  <span className="text-[10px] text-indigo-400 font-semibold">Aprovada Medicina</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Minha evolução na redação mudou completamente meu resultado."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                  J
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">João</h4>
                  <span className="text-[10px] text-purple-400 font-semibold">Aprovado Engenharia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fast Test Access Bar (Quick Navigation) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Atalhos rápidos de demonstração e teste:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickLogin('ALUNO')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entrar como Aluno Aprovado</span>
            </button>

            <button
              onClick={() => handleQuickLogin('PENDENTE')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Tela Aluno Pendente</span>
            </button>

            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="px-3 py-1.5 rounded-xl bg-brand-900/40 hover:bg-brand-900/60 text-brand-300 border border-brand-700/50 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Painel Administrador</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-6 text-center text-xs text-slate-500">
        <p>© 2026 ENEM PRO — Plataforma de Preparação Vestibulares & ENEM. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

