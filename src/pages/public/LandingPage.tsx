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
  Bot,
  Target,
  BarChart3,
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
          setTimeout(() => setIsLoaded(true), 250);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 12;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const handleQuickLogin = (role: 'ALUNO' | 'ADMIN') => {
    if (role === 'ADMIN') {
      const res = db.login('admin@enem2026.com.br', 'admin');
      if (res.user) {
        onNavigate('admin');
      }
    } else {
      const res = db.login('aluno@enem2026.com.br', 'aluno123');
      if (res.user) {
        onNavigate('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#050c1f] to-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glowing tech elements */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 1. Header Fixo & Identidade Visual Superior */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 border border-white/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight">ENEM 2026</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white tracking-widest shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300 -mt-0.5">Plataforma de Aprovação Inteligente</p>
            <p className="text-[10px] text-slate-500 hidden sm:block">"Estude, evolua e conquiste sua vaga."</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Entrar
          </button>
          <button
            onClick={() => onNavigate('cadastro')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Criar Conta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-14 flex flex-col justify-center space-y-12">
        {/* 3. Seção: Loading Bar Animada de Inicialização */}
        <div className="max-w-md mx-auto w-full p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 text-center space-y-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span className="flex items-center gap-2 text-brand-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Carregando sua jornada de estudos...
            </span>
            <span className="font-mono text-brand-400 font-black">{Math.min(100, loadProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, loadProgress)}%` }}
            />
          </div>
        </div>

        {/* 3. Hero Principal: Apresentação Tecnológica */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-black uppercase tracking-wider shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Ecossistema Completo de Alta Performance</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-brand-400">
              ENEM 2026
            </h2>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              PLATAFORMA DE APROVAÇÃO INTELIGENTE
            </h1>
          </div>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            "Seu caminho completo para conquistar sua aprovação."
          </p>

          {/* Botões Principais de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('cadastro')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-black shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Começar Minha Preparação</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Entrar com Minha Conta</span>
            </button>
          </div>

          {/* Acesso Rápido para Demonstração */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Acesso Rápido:</span>
            <button
              onClick={() => handleQuickLogin('ALUNO')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-600 hover:text-white text-brand-300 font-bold border border-slate-700/80 transition-colors cursor-pointer"
            >
              Demo Aluno (João)
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-indigo-300 font-bold border border-slate-700/80 transition-colors cursor-pointer"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* 4. Os 5 Cards de Benefícios da Plataforma (Seção 4 do Prompt) */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-brand-400 tracking-wider">Recursos Exclusivos</span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Tudo o que Você Precisa para a Nota Máxima
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* CARD 01 */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group hover:-translate-y-1 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📚
              </div>
              <h4 className="text-sm font-black text-white">428+ materiais organizados</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Conteúdos separados por matérias e assuntos."
              </p>
            </div>

            {/* CARD 02 */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 group hover:-translate-y-1 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h4 className="text-sm font-black text-white">Simulados ENEM 2026</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Treine como na prova oficial."
              </p>
            </div>

            {/* CARD 03 */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all space-y-3 group hover:-translate-y-1 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                ✍️
              </div>
              <h4 className="text-sm font-black text-white">Correção inteligente de redação</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Melhore sua nota com análise por competências."
              </p>
            </div>

            {/* CARD 04 */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 group hover:-translate-y-1 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h4 className="text-sm font-black text-white">Tutor IA ENEM</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Tire dúvidas e acelere seus estudos."
              </p>
            </div>

            {/* CARD 05 */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 group hover:-translate-y-1 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📈
              </div>
              <h4 className="text-sm font-black text-white">Análise de desempenho</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Saiba exatamente onde melhorar."
              </p>
            </div>
          </div>
        </div>

        {/* 5. Seção de Depoimentos (Seção 5 do Prompt) */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Depoimentos ilustrativos</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Quem estudou com a plataforma evoluiu
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Veja como a organização, os simulados e a análise por competências transformam a rotina de quem busca as vagas mais concorridas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Depoimento 1: Ana */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-brand-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "Minha maior dificuldade era organizar meus estudos. A plataforma criou uma rotina e mostrou exatamente onde eu precisava melhorar."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300 font-black text-sm">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ana</h4>
                  <span className="text-[11px] text-emerald-400 font-bold">Aprovada em Engenharia</span>
                </div>
              </div>
            </div>

            {/* Depoimento 2: Lucas */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-indigo-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "Os simulados me ajudaram a entender meu nível antes da prova."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-black text-sm">
                  L
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Lucas</h4>
                  <span className="text-[11px] text-indigo-400 font-bold">Aprovado em Direito</span>
                </div>
              </div>
            </div>

            {/* Depoimento 3: Mariana */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-purple-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "A análise da redação mostrou meus erros e aumentou minha confiança."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black text-sm">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mariana</h4>
                  <span className="text-[11px] text-purple-400 font-bold">Aprovada em Medicina</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-8 py-6 text-center text-xs text-slate-500">
        <p className="font-bold">ENEM 2026 PRO — Plataforma de Aprovação Inteligente • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
