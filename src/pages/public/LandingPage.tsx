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
  CheckSquare,
  Bookmark,
  FileText,
  Search,
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
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 90);

    return () => clearInterval(timer);
  }, []);

  // Lista dos 7 Simulados das Melhores Instituições (Vitrine Visual)
  const simuladosDestaque = [
    {
      id: 'anglo',
      name: 'Simulado ENEM 2026 – Anglo Sírio-Libanês',
      shortName: 'Anglo Sírio-Libanês',
      tag: 'Banca Tradicional',
      questions: '90 Questões',
      edition: 'Caderno 1 & 2',
      colorFrom: 'from-rose-600',
      colorTo: 'to-red-800',
      accentColor: 'text-rose-300',
      borderAccent: 'border-rose-500/40',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      spineColor: 'border-l-rose-400',
      icon: '🏛️',
      description: 'Enfoque em interpretação profunda de textos motivadores e ciências da saúde.',
    },
    {
      id: 'apeiron',
      name: 'Simulado ENEM 2026 – Apeiron',
      shortName: 'Apeiron',
      tag: 'Inédito & Autoral',
      questions: '90 Questões',
      edition: 'Edição Especial',
      colorFrom: 'from-purple-600',
      colorTo: 'to-indigo-900',
      accentColor: 'text-purple-300',
      borderAccent: 'border-purple-500/40',
      badgeBg: 'bg-purple-500/20 text-purple-300',
      spineColor: 'border-l-purple-400',
      icon: '⚡',
      description: 'Itens inéditos elaborados para diagnosticar pontos cegos e competências da TRI.',
    },
    {
      id: 'bernoulli',
      name: 'Simulado ENEM 2026 – Bernoulli',
      shortName: 'Bernoulli',
      tag: 'Precisão TRI',
      questions: '90 Questões',
      edition: 'Ciclo 01 Oficial',
      colorFrom: 'from-cyan-600',
      colorTo: 'to-blue-900',
      accentColor: 'text-cyan-300',
      borderAccent: 'border-cyan-500/40',
      badgeBg: 'bg-cyan-500/20 text-cyan-300',
      spineColor: 'border-l-cyan-400',
      icon: '📘',
      description: 'A maior referência nacional em calibração TRI e distribuição pedagógica oficial.',
    },
    {
      id: 'hplus',
      name: 'Simulado ENEM 2026 – HPlus',
      shortName: 'HPlus',
      tag: 'Sprint Intensivo',
      questions: '90 Questões',
      edition: 'Caderno de Alta Pressão',
      colorFrom: 'from-amber-500',
      colorTo: 'to-yellow-800',
      accentColor: 'text-amber-300',
      borderAccent: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      spineColor: 'border-l-amber-400',
      icon: '⏱️',
      description: 'Treinamento de resistência para condicionamento de 5h com gabarito imediato.',
    },
    {
      id: 'poliedro',
      name: 'Simulado ENEM 2026 – Poliedro',
      shortName: 'Poliedro',
      tag: 'Foco Medicina',
      questions: '90 Questões',
      edition: 'Fase de Excelência',
      colorFrom: 'from-blue-700',
      colorTo: 'to-slate-900',
      accentColor: 'text-blue-300',
      borderAccent: 'border-blue-500/40',
      badgeBg: 'bg-blue-500/20 text-blue-300',
      spineColor: 'border-l-blue-400',
      icon: '🔬',
      description: 'Rigor extremo em Ciências da Natureza e Matemática para notas acima de 800+.',
    },
    {
      id: 'sas',
      name: 'Simulado ENEM 2026 – SAS',
      shortName: 'SAS',
      tag: 'Diagnóstico Amplo',
      questions: '90 Questões',
      edition: 'Caderno Integrado',
      colorFrom: 'from-orange-600',
      colorTo: 'to-red-950',
      accentColor: 'text-orange-300',
      borderAccent: 'border-orange-500/40',
      badgeBg: 'bg-orange-500/20 text-orange-300',
      spineColor: 'border-l-orange-400',
      icon: '📙',
      description: 'Avaliação detalhada das 30 habilidades da Matriz de Referência do ENEM.',
    },
    {
      id: 'somos',
      name: 'Simulado ENEM 2026 – Somos',
      shortName: 'Somos',
      tag: 'Interdisciplinar',
      questions: '90 Questões',
      edition: 'Volume Consolidado',
      colorFrom: 'from-emerald-600',
      colorTo: 'to-teal-950',
      accentColor: 'text-emerald-300',
      borderAccent: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      spineColor: 'border-l-emerald-400',
      icon: '📗',
      description: 'Integração de Humanas e Linguagens com proposta de redação temática contemporânea.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Luminous Gradients & Soft Glows */}
      <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-brand-600/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-purple-600/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-[650px] h-[650px] bg-cyan-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[700px] h-[700px] bg-emerald-600/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* ================================================== */}
      {/* 1. HEADER INSTITUCIONAL */}
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

        {/* Links Rápidos Institucionais */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#simulados" className="hover:text-cyan-400 transition-colors">Simulados do Momento</a>
          <a href="#atualizacoes" className="hover:text-emerald-400 transition-colors">Atualizações</a>
          <a href="#recursos" className="hover:text-brand-400 transition-colors">Recursos de Estudo</a>
          <a href="#depoimentos" className="hover:text-amber-400 transition-colors">Depoimentos</a>
        </nav>

        {/* Botões de Acesso Oficial */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
          >
            Entrar na Minha Conta
          </button>
          <button
            onClick={() => onNavigate('cadastro')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Começar Preparação</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* 2. CORPO PRINCIPAL */}
      {/* ================================================== */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
        
        {/* Barra Tecnológica de Inicialização */}
        <div className="max-w-md mx-auto w-full p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center space-y-2 shadow-xl backdrop-blur-md">
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
        {/* HERO SECTION COM FOTO DE ESTUDO & APRESENTAÇÃO */}
        {/* ================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2">
          {/* Coluna de Texto (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20 border border-brand-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>O primeiro passo da sua aprovação está aqui.</span>
            </div>

            <div className="space-y-2">
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

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
              Estude com uma plataforma constantemente atualizada, com os melhores simulados, conteúdos organizados por matéria, análise de desempenho, correção de redação e suporte com IA.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('cadastro')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-black shadow-xl shadow-brand-600/35 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
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

            {/* Mini-Badges com Métricas Oficiais */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="block font-black text-white text-lg">428+</span>
                <span className="text-[10px] text-slate-400 font-bold">Apostilas & Aulas</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="block font-black text-cyan-400 text-lg">7 Bancas</span>
                <span className="text-[10px] text-slate-400 font-bold">Melhores Simulados</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="block font-black text-emerald-400 text-lg">900+</span>
                <span className="text-[10px] text-slate-400 font-bold">Média na Redação</span>
              </div>
            </div>
          </div>

          {/* Coluna Visual: Foto de Estudantes em Alta Foco + Badges Flutuantes (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Glow de fundo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/30 to-purple-600/30 rounded-3xl blur-2xl -z-10" />

            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl group bg-slate-900">
              {/* Foto Real de Estudantes Focados */}
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Estudantes focados na preparação para o ENEM 2026"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Tag sobre a foto */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black">
                    <Trophy className="w-4 h-4" />
                    <span>Foco em Aprovação nas Federais & Medicina</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Rotina orientada por diagnósticos pedagógicos diários</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                  TRI
                </div>
              </div>
            </div>

            {/* Card Flutuante 1: Redação Nota 960 */}
            <div className="absolute -top-4 -left-4 sm:-left-6 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-base">
                ✍️
              </div>
              <div>
                <p className="text-[11px] font-black text-white">Redação Nota 960</p>
                <p className="text-[10px] text-emerald-400 font-bold">5 Competências Gabaritadas</p>
              </div>
            </div>

            {/* Card Flutuante 2: Simulados Líderes */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-base">
                📚
              </div>
              <div>
                <p className="text-[11px] font-black text-white">Acervo Atualizado</p>
                <p className="text-[10px] text-cyan-300 font-bold">Poliedro, Bernoulli, Anglo...</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3. VITRINE DE LIVROS / CAPAS DOS SIMULADOS DO MOMENTO */}
        {/* ================================================== */}
        <section id="simulados" className="space-y-8 pt-4">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-black uppercase text-cyan-400 tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Simulados Oficiais das Melhores Instituições</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              OS MELHORES SIMULADOS DO MOMENTO
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Treine com simulados completos, atualizados e inspirados nas melhores instituições de preparação do país.
            </p>
          </div>

          {/* Vitrine Visual em Formato de Capas / Livros de Estudo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 pt-2">
            {simuladosDestaque.map((sim) => (
              <div
                key={sim.id}
                className={`relative rounded-3xl p-4.5 bg-gradient-to-b ${sim.colorFrom} ${sim.colorTo} border ${sim.borderAccent} shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group overflow-hidden border-l-[6px] ${sim.spineColor}`}
              >
                {/* Efeito de Brilho da Capa do Livro */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-60 pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  {/* Badge da Instituição */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{sim.icon}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sim.badgeBg}`}>
                      {sim.tag}
                    </span>
                  </div>

                  {/* Nome do Simulado / Capa do Livro */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-white/70 block uppercase tracking-widest">
                      ENEM 2026
                    </span>
                    <h3 className="text-sm font-black text-white leading-snug group-hover:text-amber-200 transition-colors">
                      {sim.name}
                    </h3>
                  </div>

                  {/* Ficha Técnica da Apostila */}
                  <div className="pt-2 border-t border-white/15 text-[10px] space-y-1 text-white/90">
                    <div className="flex items-center justify-between font-bold">
                      <span>{sim.questions}</span>
                      <span className="text-white/70">{sim.edition}</span>
                    </div>
                    <p className="text-[10px] text-white/80 line-clamp-3 leading-relaxed">
                      {sim.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-white">
                  <span>Acessar Caderno</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Faixa Complementar da Vitrine */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-bold text-slate-200 text-center sm:text-left">
              ⚡ <span className="text-cyan-400 font-extrabold">Acervo Completo e Padronizado</span> com gabaritos comentados, resolução passo a passo e nota TRI calculada item a item.
            </p>
            <button
              onClick={() => onNavigate('cadastro')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Começar a Praticar
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* 4. PLATAFORMA CONSTANTEMENTE ATUALIZADA */}
        {/* ================================================== */}
        <section id="atualizacoes" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-950 p-6 sm:p-10 border border-indigo-500/30 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sempre um Passo à Frente
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                PLATAFORMA CONSTANTEMENTE ATUALIZADA
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Novos simulados, novos materiais e novos conteúdos são adicionados continuamente para manter sua preparação sempre forte e atualizada.
              </p>
            </div>

            <button
              onClick={() => onNavigate('cadastro')}
              className="shrink-0 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Criar Meu Acesso</span>
              <ArrowRight className="w-4 h-4 text-brand-600" />
            </button>
          </div>

          {/* Grid dos 7 Destaques com Checkmarks Oficiais */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-2">
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
              <span className="text-xs font-bold text-white">Gabaritos oficiais</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Correção inteligente de redação</span>
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
              <span className="text-xs font-bold text-white">Análise de desempenho</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-white">Tutor IA</span>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 5. RECURSOS DA PLATAFORMA (8 CARDS MODERNOS) */}
        {/* ================================================== */}
        <section id="recursos" className="space-y-8 pt-2">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-black uppercase text-purple-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metodologia Completa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tudo o que você precisa para buscar sua nota máxima
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              O ecossistema definitivo para transformar horas de esforço em pontos reais de TRI no dia do ENEM.
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
                Conteúdos separados por áreas, disciplinas e assuntos.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                2. SIMULADOS ENEM 2026
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Treine com simulados completos e atualizados.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                3. GABARITOS E CORREÇÕES
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Acompanhe seu desempenho com correção automática.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                ✍️
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
                4. REDAÇÃO COM ANÁLISE INTELIGENTE
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evolua com análise por competências.
              </p>
            </div>

            {/* CARD 5 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                5. TUTOR IA ENEM
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tire dúvidas, peça resumos e organize seus estudos.
              </p>
            </div>

            {/* CARD 6 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition-colors">
                6. ANÁLISE DE DESEMPENHO
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Descubra pontos fortes e pontos fracos.
              </p>
            </div>

            {/* CARD 7 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                🔍
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">
                7. BANCO DE QUESTÕES
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Questões organizadas por matéria e assunto.
              </p>
            </div>

            {/* CARD 8 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/60 transition-all space-y-3 group hover:-translate-y-1.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                8. PLANO DE ESTUDOS
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monte sua rotina de forma personalizada.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 6. DEPOIMENTOS ILUSTRATIVOS DE ALUNOS */}
        {/* ================================================== */}
        <section id="depoimentos" className="space-y-6 pt-2">
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
            {/* Depoimento 1: Mariana */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-purple-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “Os simulados me ajudaram a entender melhor meu nível e a estudar com mais estratégia.”
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

            {/* Depoimento 2: Rafael */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-brand-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “A plataforma me deu direção. Antes eu estudava sem saber por onde começar.”
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

            {/* Depoimento 3: Juliana */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-emerald-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  “A parte de redação foi essencial para minha evolução.”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                  J
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Juliana</h4>
                  <span className="text-[11px] text-emerald-400 font-bold">Aprovada em Direito</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 7. CHAMADA FINAL (FINAL CTA) */}
        {/* ================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Sua aprovação pode começar hoje.
            </h2>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed font-normal">
              Tenha acesso a uma plataforma moderna, atualizada e organizada para ajudar você a estudar com estratégia até o ENEM 2026.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('cadastro')}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white hover:bg-slate-100 text-brand-700 font-black text-sm sm:text-base shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>COMEÇAR AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white border border-white/25 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ENTRAR NA MINHA CONTA</span>
            </button>
          </div>
        </section>
      </main>

      {/* ================================================== */}
      {/* 8. FOOTER INSTITUCIONAL (SEM PREÇOS OU VALORES) */}
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
