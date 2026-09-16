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
  Bot,
  Target,
  BarChart3,
  Calendar,
  RotateCcw,
  Check,
  Zap,
  Library,
  Trophy,
  FileSpreadsheet,
  CheckSquare,
  Bookmark,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Colorful Glows & Tech Gradients */}
      <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-brand-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-2/3 -left-32 w-[650px] h-[650px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* ================================================== */}
      {/* 1. HEADER FIXO / NAVEGAÇÃO SUPERIOR */}
      {/* ================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between w-full shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 border border-white/20">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-white tracking-tight">ENEM 2026</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white tracking-widest shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300 -mt-0.5 hidden xs:block">Plataforma de Aprovação Inteligente</p>
          </div>
        </div>

        {/* Links Rápidos Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#simulados" className="hover:text-cyan-400 transition-colors">Melhores Simulados</a>
          <a href="#recursos" className="hover:text-brand-400 transition-colors">Recursos</a>
          <a href="#atualizacoes" className="hover:text-emerald-400 transition-colors">Atualizações</a>
          <a href="#depoimentos" className="hover:text-amber-400 transition-colors">Depoimentos</a>
        </nav>

        {/* Botões de Acesso */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
          >
            Entrar
          </button>
          <button
            onClick={() => onNavigate('cadastro')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Começar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* 2. MAIN CONTENT BODY */}
      {/* ================================================== */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-14 space-y-16 sm:space-y-20">
        
        {/* Barra Sutil de Inicialização Tecnológica */}
        <div className="max-w-md mx-auto w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center space-y-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
            <span className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Carregando sua jornada de estudos...
            </span>
            <span className="font-mono text-cyan-400 font-black">{Math.min(100, loadProgress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-brand-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, loadProgress)}%` }}
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* HERO SECTION PRINCIPAL */}
        {/* ================================================== */}
        <section className="text-center space-y-7 max-w-4xl mx-auto pt-2">
          {/* Badge de Impacto */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20 border border-brand-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>O primeiro passo da sua aprovação está aqui.</span>
          </div>

          {/* Headline Principal */}
          <div className="space-y-3">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-purple-400">
              ENEM 2026
            </h2>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              PLATAFORMA DE APROVAÇÃO INTELIGENTE
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-cyan-200 tracking-tight">
              O primeiro passo da sua aprovação está aqui.
            </p>
          </div>

          {/* Texto de Apoio */}
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Estude com uma plataforma completa, constantemente atualizada, com materiais organizados, simulados de alto nível, correção inteligente de redação, análise de desempenho e suporte com IA.
          </p>

          {/* Botões Principais de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigate('cadastro')}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-black shadow-xl shadow-brand-600/35 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>COMEÇAR MINHA PREPARAÇÃO</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:border-slate-600"
            >
              <span>ENTRAR NA MINHA CONTA</span>
            </button>
          </div>

          {/* Mini Preview / Elementos Visuais Educacionais */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-black">
                📚
              </div>
              <div>
                <p className="text-xs font-black text-white">428+ Materiais</p>
                <p className="text-[10px] text-slate-400">Pastas por matéria</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black">
                🎯
              </div>
              <div>
                <p className="text-xs font-black text-white">Bancas Líderes</p>
                <p className="text-[10px] text-slate-400">Bernoulli, Poliedro...</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                ✍️
              </div>
              <div>
                <p className="text-xs font-black text-white">Redação 900+</p>
                <p className="text-[10px] text-slate-400">5 Competências TRI</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black">
                🤖
              </div>
              <div>
                <p className="text-xs font-black text-white">Tutor IA 24h</p>
                <p className="text-[10px] text-slate-400">Resoluções e planos</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3. FRASES DE IMPACTO (STRIP VISUAL ESTRATÉGICO) */}
        {/* ================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/50 shadow-xl space-y-4">
          <div className="flex items-center gap-2 justify-center text-xs font-black uppercase text-cyan-400 tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Compromisso com o Seu Resultado</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                “Sua aprovação começa com a decisão de se preparar melhor.”
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                “Estude com inteligência. Evolua com constância. Conquiste sua vaga.”
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <p className="text-xs sm:text-sm font-bold text-emerald-300">
                “Conteúdo completo para quem quer resultado de verdade.”
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 4. BANNER DE DESTAQUE: PLATAFORMA CONSTANTEMENTE ATUALIZADA */}
        {/* ================================================== */}
        <section id="atualizacoes" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-950 p-6 sm:p-10 border border-indigo-500/30 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Atualizações Contínuas
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                PLATAFORMA CONSTANTEMENTE ATUALIZADA
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Novos conteúdos, novos simulados, novos materiais e novas estratégias adicionados continuamente para manter sua preparação sempre no mais alto nível.
              </p>
            </div>

            <button
              onClick={() => onNavigate('cadastro')}
              className="shrink-0 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Explorar Plataforma</span>
              <ArrowRight className="w-4 h-4 text-brand-600" />
            </button>
          </div>

          {/* Grid dos 5 Destaques com Checkmarks Verdes */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Conteúdos organizados por matéria</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Simulados atualizados</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Redação com análise inteligente</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Questões por assunto</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Plano de estudo personalizado</span>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 5. SEÇÃO: OS MELHORES SIMULADOS DO MOMENTO */}
        {/* ================================================== */}
        <section id="simulados" className="space-y-6 pt-2">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-black uppercase text-cyan-400 tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Preparação no Nível Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              OS MELHORES SIMULADOS DO MOMENTO
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Treine com simulados inspirados nas principais bancas e nos materiais mais relevantes da atualidade.
            </p>
          </div>

          {/* Cards com Nomes das Instituições e Simulados de Destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* 1. Bernoulli */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-cyan-500/30 hover:border-cyan-400 transition-all space-y-3 shadow-lg group hover:-translate-y-1.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                    01
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-black uppercase">
                    Referência
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                  Simulado ENEM 2026 – Bernoulli
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Caderno oficial completo, 90 questões com Teoria de Resposta ao Item (TRI) e alta precisão pedagógica.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <span>Incluso na plataforma</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* 2. Poliedro */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-brand-500/30 hover:border-brand-400 transition-all space-y-3 shadow-lg group hover:-translate-y-1.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-sm">
                    02
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 text-[10px] font-black uppercase">
                    Medicina
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-brand-300 transition-colors">
                  Simulado ENEM 2026 – Poliedro
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Alta complexidade em Ciências da Natureza e Matemática para quem mira cursos de altíssima nota de corte.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-bold text-brand-400 flex items-center gap-1">
                <span>Incluso na plataforma</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* 3. Anglo */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-indigo-500/30 hover:border-indigo-400 transition-all space-y-3 shadow-lg group hover:-translate-y-1.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">
                    03
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-black uppercase">
                    Tradicional
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                  Simulado ENEM 2026 – Anglo
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Foco na interdisciplinaridade e na interpretação apurada dos textos motivadores da matriz do ENEM.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <span>Incluso na plataforma</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* 4. Apeiron */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-purple-500/30 hover:border-purple-400 transition-all space-y-3 shadow-lg group hover:-translate-y-1.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm">
                    04
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-black uppercase">
                    Inovador
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                  Simulado ENEM 2026 – Apeiron
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Questões inéditas calibradas para avaliar competências críticas e pontos cegos antes da prova oficial.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <span>Incluso na plataforma</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* 5. HPlus */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-amber-500/30 hover:border-amber-400 transition-all space-y-3 shadow-lg group hover:-translate-y-1.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    05
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase">
                    Sprint Final
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Simulado ENEM 2026 – HPlus
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Condicionamento físico e psicológico de 5 horas com cronômetro real e cálculo instantâneo de desempenho.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <span>Incluso na plataforma</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Chamada Complementar dos Simulados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-bold text-slate-200">
              ⚡ <span className="text-amber-400">Treine com simulados completos</span>, atualizados e alinhados com o nível das melhores preparações do Brasil.
            </p>
            <button
              onClick={() => onNavigate('cadastro')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Fazer Simulado Agora
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* 6. SEÇÃO DE BENEFÍCIOS / RECURSOS (8 CARDS COLORIDOS) */}
        {/* ================================================== */}
        <section id="recursos" className="space-y-8 pt-4">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-black uppercase text-purple-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estrutura Completa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tudo o que você precisa para buscar sua nota máxima
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Recursos integrados pensados para transformar cada minuto de estudo em pontos reais no dia da sua prova.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-base font-black text-white group-hover:text-brand-400 transition-colors">
                1. MATÉRIAS ORGANIZADAS
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conteúdos separados por áreas, disciplinas e assuntos para facilitar sua jornada de estudo.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                2. MELHORES SIMULADOS DO MOMENTO
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Treine com simulados completos e atualizados para o ENEM 2026.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                ✍️
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
                3. CORREÇÃO INTELIGENTE DE REDAÇÃO
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receba análise por competências e orientações para evoluir.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                4. TUTOR IA ENEM
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tire dúvidas, peça resumos, organize seus estudos e revise com mais inteligência.
              </p>
            </div>

            {/* CARD 5 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                5. ANÁLISE DE DESEMPENHO
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Descubra seus pontos fortes, seus erros e os assuntos que mais precisam de atenção.
              </p>
            </div>

            {/* CARD 6 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">
                6. PLANO DE ESTUDO PERSONALIZADO
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monte sua rotina com mais foco e clareza até o dia da prova.
              </p>
            </div>

            {/* CARD 7 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📖
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition-colors">
                7. BIBLIOTECA DE MATERIAIS
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apostilas, resumos, mapas mentais, exercícios e revisões organizadas.
              </p>
            </div>

            {/* CARD 8 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🔄
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                8. PLATAFORMA SEMPRE ATUALIZADA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Novos conteúdos e melhorias constantes para manter sua preparação forte.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 7. SEÇÃO DE DEPOIMENTOS DE ALUNOS */}
        {/* ================================================== */}
        <section id="depoimentos" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Depoimentos ilustrativos</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Quem estudou com a plataforma evoluiu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Resultados começam com preparo, organização e constância.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Depoimento 1: Juliana */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-emerald-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “Antes eu estudava sem direção. Hoje tenho clareza do que revisar e consigo acompanhar minha evolução.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                  J
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Juliana</h4>
                  <span className="text-[11px] text-emerald-400 font-bold">Aprovada em Enfermagem</span>
                </div>
              </div>
            </div>

            {/* Depoimento 2: Rafael */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-brand-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “Os simulados me ajudaram a entender melhor meu nível e a ganhar confiança.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300 font-black text-sm">
                  R
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rafael</h4>
                  <span className="text-[11px] text-brand-400 font-bold">Aprovado em Engenharia</span>
                </div>
              </div>
            </div>

            {/* Depoimento 3: Camila */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-purple-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “A redação era meu maior medo. Com a análise da plataforma, comecei a enxergar meus erros com mais clareza.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black text-sm">
                  C
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Camila</h4>
                  <span className="text-[11px] text-purple-400 font-bold">Aprovada em Direito</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 8. SEÇÃO DE CHAMADA FINAL (FINAL CTA) */}
        {/* ================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua aprovação pode começar hoje.
            </h2>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed font-normal">
              Tenha acesso a uma plataforma moderna, atualizada e preparada para ajudar você a estudar com estratégia até o ENEM 2026.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex items-center justify-center">
            <button
              onClick={() => onNavigate('cadastro')}
              className="px-10 py-4 rounded-2xl bg-white hover:bg-slate-100 text-brand-700 font-black text-sm sm:text-base shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>COMEÇAR AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* ================================================== */}
      {/* 9. FOOTER */}
      {/* ================================================== */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/95 px-4 sm:px-8 py-8 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-black text-white text-sm">
          <GraduationCap className="w-5 h-5 text-brand-400" />
          <span>ENEM 2026 PRO — Plataforma de Aprovação Inteligente</span>
        </div>
        <p className="text-slate-400">
          "O primeiro passo da sua aprovação está aqui." • Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
