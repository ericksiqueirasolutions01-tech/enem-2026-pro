import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  Lock,
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
  Info,
  Plus,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 1. Linha: CONTINUE SUA JORNADA
  const trilhaJornada = [
    {
      id: 'matematica',
      title: 'Matemática ENEM',
      category: 'Ciências Exatas • 45 Itens',
      description: 'Funções de 1º e 2º grau, Geometria Espacial, Estatística e Análise Combinatória aplicada ao modelo TRI.',
      progress: 68,
      duration: '48 Aulas • 120 Exercícios',
      badge: 'TOP 10 EM ESTUDOS',
      bgGradient: 'from-blue-900/90 via-indigo-950/90 to-black',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'redacao',
      title: 'Redação Nota 1000',
      category: 'Linguagens & Argumentação',
      description: 'Estrutura clássica em 4 parágrafos, repertórios legitimados, conectivos interparágrafos e proposta com 5 elementos.',
      progress: 85,
      duration: '32 Módulos • 25 Temas Quentes',
      badge: 'MAIS ASSISTIDO',
      bgGradient: 'from-purple-900/90 via-violet-950/90 to-black',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'natureza',
      title: 'Biologia ENEM',
      category: 'Ciências da Natureza',
      description: 'Ecologia, Ciclos Biogeoquímicos, Citologia, Genética Mendeliana e Biotecnologia com maior recorrência no ENEM.',
      progress: 54,
      duration: '40 Aulas • 95 Questões',
      badge: 'ESSENCIAL',
      bgGradient: 'from-emerald-900/90 via-teal-950/90 to-black',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'simulados-tri',
      title: 'Simulados ENEM 2026',
      category: 'Treinamento Oficial TRI',
      description: 'Provas cronometradas no padrão INEP, caderno de erros inteligente e cálculo automático de proficiência TRI.',
      progress: 92,
      duration: '7 Cadernos de Elite • 5h de Prova',
      badge: 'EXCLUSIVO',
      bgGradient: 'from-rose-900/90 via-red-950/90 to-black',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // 2. Linha: OS MELHORES SIMULADOS DO MOMENTO (7 BANCAS DE ELITE)
  const simuladosNetflix = [
    {
      id: 'anglo',
      name: 'Anglo Sírio-Libanês',
      tag: 'Banca Tradicional',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-red-600',
      colorTo: 'to-rose-950',
      accentColor: 'text-rose-400',
      borderAccent: 'border-red-500/40',
      icon: '🏛️',
      focus: 'Foco em TRI & Saúde',
      bgImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'apeiron',
      name: 'Apeiron',
      tag: 'Inédito & Autoral',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-purple-600',
      colorTo: 'to-indigo-950',
      accentColor: 'text-purple-400',
      borderAccent: 'border-purple-500/40',
      icon: '⚡',
      focus: 'Diagnóstico de Pontos Cegos',
      bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bernoulli',
      name: 'Bernoulli',
      tag: 'Precisão TRI',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-cyan-600',
      colorTo: 'to-blue-950',
      accentColor: 'text-cyan-400',
      borderAccent: 'border-cyan-500/40',
      icon: '📘',
      focus: 'Referência Nacional em TRI',
      bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'hplus',
      name: 'HPlus',
      tag: 'Sprint Intensivo',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-amber-500',
      colorTo: 'to-yellow-950',
      accentColor: 'text-amber-400',
      borderAccent: 'border-amber-500/40',
      icon: '⏱️',
      focus: 'Velocidade & Resistência 5h',
      bgImage: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'poliedro',
      name: 'Poliedro',
      tag: 'Foco Medicina',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-blue-700',
      colorTo: 'to-slate-950',
      accentColor: 'text-blue-400',
      borderAccent: 'border-blue-500/40',
      icon: '🔬',
      focus: 'Máximo Rigor Conceitual',
      bgImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sas',
      name: 'SAS',
      tag: 'Matriz Oficial',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-orange-600',
      colorTo: 'to-red-950',
      accentColor: 'text-orange-400',
      borderAccent: 'border-orange-500/40',
      icon: '📙',
      focus: 'Mapeamento 30 Habilidades',
      bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'somos',
      name: 'Somos',
      tag: 'Interdisciplinar',
      seal: 'ENEM 2026',
      questions: '90 QUESTÕES',
      edition: 'SIMULADO COMPLETO',
      sub: 'GABARITO COMENTADO',
      colorFrom: 'from-emerald-600',
      colorTo: 'to-teal-950',
      accentColor: 'text-emerald-400',
      borderAccent: 'border-emerald-500/40',
      icon: '📗',
      focus: 'Redação & Atualidades 2026',
      bgImage: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // 3. Linha: BIBLIOTECA COMPLETA POR DISCIPLINAS
  const bibliotecaDisciplinas = [
    { name: 'Português', icon: '📖', color: 'from-blue-600 to-indigo-900', items: '42 Apostilas' },
    { name: 'Matemática', icon: '📐', color: 'from-cyan-600 to-blue-900', items: '58 Apostilas' },
    { name: 'História', icon: '🏛️', color: 'from-amber-600 to-yellow-900', items: '36 Apostilas' },
    { name: 'Geografia', icon: '🌍', color: 'from-emerald-600 to-teal-900', items: '34 Apostilas' },
    { name: 'Biologia', icon: '🧬', color: 'from-green-600 to-emerald-950', items: '46 Apostilas' },
    { name: 'Física', icon: '⚡', color: 'from-sky-600 to-blue-950', items: '50 Apostilas' },
    { name: 'Química', icon: '🧪', color: 'from-purple-600 to-indigo-950', items: '48 Apostilas' },
    { name: 'Redação', icon: '✍️', color: 'from-rose-600 to-red-950', items: '28 Manuais' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      
      {/* ================================================== */}
      {/* TOPBAR ESTILO NETFLIX (TRANSLÚCIDA / STICKY) */}
      {/* ================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-8 h-16 flex items-center justify-between ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Logo ENEM 2026 PRO */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30 border border-white/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tighter text-white">
                  ENEM <span className="text-red-500">2026</span>
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider hidden sm:block -mt-0.5">
                Plataforma de Aprovação Inteligente
              </p>
            </div>
          </div>

          {/* Menu de Navegação Superior estilo Streaming */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#hero" className="hover:text-white transition-colors">Início</a>
            <a href="#jornada" className="hover:text-white transition-colors">Sua Jornada</a>
            <a href="#simulados" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>Simulados</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </a>
            <a href="#biblioteca" className="hover:text-white transition-colors">Biblioteca</a>
            <a href="#redacao" className="hover:text-white transition-colors">Redação</a>
            <a href="#tutor-ia" className="hover:text-white transition-colors">Tutor IA</a>
          </nav>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white hover:text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Entrar</span>
          </button>

          <button
            onClick={() => onNavigate('cadastro')}
            className="hidden xs:flex px-4 sm:px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Começar</span>
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* HERO BILLBOARD CINEMATOGRÁFICO (ESTILO NETFLIX COMPACTADO) */}
      {/* ================================================== */}
      <section id="hero" className="relative min-h-[76dvh] lg:min-h-[80dvh] flex items-center justify-start overflow-hidden pt-16">
        {/* Imagem de Fundo Cinematográfica em Alta Resolução */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=85"
            alt="Estudantes focados em ambiente cinematográfico de estudos"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Vinheta lateral e vertical em degradê contínuo para o preto puro */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 via-45% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 via-80% to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
        </div>

        {/* Conteúdo do Hero (Alinhado à Esquerda como Netflix Original) */}
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center space-y-4 sm:space-y-5">
          
          {/* Badge Top 1 Aprovação */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider w-fit shadow-md">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>#1 PLATAFORMA DE PREPARAÇÃO • ENEM 2026</span>
          </div>

          {/* Título Principal */}
          <div className="space-y-1.5 max-w-3xl">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
              PLATAFORMA DE APROVAÇÃO INTELIGENTE
            </h2>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl">
              ENEM 2026
            </h1>
            <p className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight pt-0.5">
              "O primeiro passo da sua aprovação está aqui."
            </p>
          </div>

          {/* Texto de Apoio e Bullet Points */}
          <div className="space-y-2.5 max-w-2xl text-slate-200">
            <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-300">
              Prepare-se com uma plataforma completa para o ENEM 2026. Tenha acesso a:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5 text-xs sm:text-xs font-semibold text-white">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Simulados atualizados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Materiais completos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Redação inteligente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Plano de estudos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Tutor pedagógico</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Análise de desempenho</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação Principais (Estilo Netflix Billboard Compactado) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-xl">
            <button
              onClick={() => onNavigate('cadastro')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 shadow-2xl shadow-white/20"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>COMEÇAR MINHA PREPARAÇÃO</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>ENTRAR NA MINHA CONTA</span>
            </button>
          </div>

          {/* Selo Etário / Classificação Oficial */}
          <div className="pt-1 flex items-center gap-2.5 text-[11px] text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded border border-slate-600 font-mono text-[10px] font-bold text-white">
              LIVRE
            </span>
            <span>Matriz Oficial de Referência do ENEM • Teoria de Resposta ao Item (TRI)</span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. CARROSSEL DE CONTEÚDOS: "CONTINUE SUA JORNADA" */}
      {/* ================================================== */}
      <section id="jornada" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-8 -mt-6 sm:-mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Seu Trilho de Estudos</span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>CONTINUE SUA JORNADA</span>
              <ChevronRight className="w-5 h-5 text-red-500" />
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 hidden sm:block">4 de 4 trilhas liberadas</span>
        </div>

        {/* Linha Horizontal de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trilhaJornada.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('cadastro')}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-red-500/80 transition-all duration-300 hover:scale-[1.03] hover:z-20 cursor-pointer shadow-xl flex flex-col justify-between"
            >
              {/* Thumbnail com Overlay */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-black tracking-wider text-red-400 border border-white/10">
                  {item.badge}
                </div>
              </div>

              {/* Informações */}
              <div className="p-4 space-y-2 bg-gradient-to-b from-slate-950/80 to-slate-950">
                <span className="text-[10px] font-bold text-slate-400 block truncate">{item.category}</span>
                <h4 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
                  <span>{item.duration}</span>
                  <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Assistir <Play className="w-2.5 h-2.5 fill-red-400" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. SEÇÃO: OS MELHORES SIMULADOS ENEM 2026 (7 CAPAS) */}
      {/* ================================================== */}
      <section id="simulados" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Vitrine de Elite</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🔥 Os melhores simulados ENEM 2026</span>
              <ChevronRight className="w-6 h-6 text-red-500" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Treine com simulados inspirados nas principais bancas de preparação do país.
            </p>
          </div>
        </div>

        {/* Linha de Capas de Livros / Apostilas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {simuladosNetflix.map((sim, idx) => (
            <div
              key={sim.id}
              onClick={() => onNavigate('cadastro')}
              className={`group relative rounded-3xl overflow-hidden bg-gradient-to-b ${sim.colorFrom} ${sim.colorTo} p-1 shadow-2xl hover:shadow-red-600/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer flex flex-col justify-between border ${sim.borderAccent} min-h-[460px] ${
                idx === 6 ? 'md:col-span-2 md:max-w-md md:mx-auto lg:col-span-1 lg:col-start-2 lg:max-w-none' : ''
              }`}
            >

              <div className="relative z-10 space-y-4">
                {/* Selo e Ícone */}
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shadow-inner">
                    {sim.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/50 text-white border border-white/20">
                    {sim.tag}
                  </span>
                </div>

                {/* Bloco Central da Capa */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-black text-white/80 uppercase tracking-widest block">
                    ENEM 2026
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-amber-200 transition-colors">
                    {sim.name}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">{sim.focus}</p>
                </div>

                {/* Especificações Oficiais */}
                <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-xs border border-white/15 space-y-2 text-xs text-white">
                  <div className="flex items-center justify-between font-black text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white/15">{sim.questions}</span>
                    <span className="text-white/90 uppercase tracking-wider font-extrabold">{sim.edition}</span>
                  </div>
                  <p className="font-extrabold text-emerald-300 flex items-center gap-1.5 pt-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {sim.sub}
                  </p>
                </div>
              </div>

              {/* Botão Inferior de Acesso */}
              <div className="relative z-10 pt-5 border-t border-white/20 flex items-center justify-between text-xs sm:text-sm font-black text-white">
                <span>Acessar Caderno Completo</span>
                <span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-amber-300 transition-colors shadow-md">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. SEÇÃO: BIBLIOTECA COMPLETA POR MATÉRIAS */}
      {/* ================================================== */}
      <section id="biblioteca" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10 space-y-5 bg-gradient-to-b from-transparent via-slate-950 to-transparent">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Acervo Curricular</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📚 Biblioteca completa</span>
              <ChevronRight className="w-6 h-6 text-red-500" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              428+ apostilas, resumos e listas organizadas por disciplina.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {bibliotecaDisciplinas.map((disc, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('cadastro')}
              className={`group p-4 rounded-2xl bg-gradient-to-b ${disc.color} border border-white/10 hover:border-white/40 shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col justify-between text-center space-y-3`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                {disc.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">{disc.name}</h4>
                <span className="text-[10px] text-white/70 font-semibold block">{disc.items}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. SEÇÃO: REDAÇÃO ENEM (ESTILO STREAMING ORIGINAL) */}
      {/* ================================================== */}
      <section id="redacao" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-slate-950 to-black border border-purple-500/30 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Lado Esquerdo: Textos & Recursos */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
                <PenTool className="w-3.5 h-3.5" />
                <span>Oficina de Escrita • Critérios Oficiais INEP</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ✍️ Prepare sua redação
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Crie sua redação com temas que podem aparecer no ENEM 2026 e receba uma análise formativa inteligente para evoluir até a nota 1000.
                </p>
                <div className="inline-block text-[11px] text-purple-300/80 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-500/20">
                  Estimativa Pedagógica Automatizada • Diagnóstico formativo calibrado pelas 5 competências do INEP
                </div>
              </div>

              {/* 4 Destaques */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Temas atuais
                  </span>
                  <p className="text-xs text-slate-400">Temas sociais e científicos prováveis para 2026.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correção por competências
                  </span>
                  <p className="text-xs text-slate-400">Notas de C1 a C5 avaliadas item a item.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Sugestões de melhoria
                  </span>
                  <p className="text-xs text-slate-400">Dicas para enriquecer repertório e conectivos.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Histórico de evolução
                  </span>
                  <p className="text-xs text-slate-400">Acompanhe seu salto até o patamar 900+.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('cadastro')}
                  className="px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Escrever Minha Redação Agora</span>
                </button>
              </div>
            </div>

            {/* Lado Direito: Preview da Redação Corrigida (Card Flutuante) */}
            <div className="lg:col-span-5 relative">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tema da Semana</span>
                    <h4 className="text-xs font-black text-white">Desafios da Inteligência Artificial no Trabalho</h4>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-sm text-center">
                    960 / 1000
                  </div>
                </div>

                {/* Barras das 5 Competências */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>C1: Domínio da Norma Culta</span>
                    <span className="text-emerald-400 font-bold">180 pts</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '90%' }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>C2: Compreensão da Proposta & Repertório</span>
                    <span className="text-emerald-400 font-bold">200 pts</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>C5: Proposta de Intervenção Completa</span>
                    <span className="text-emerald-400 font-bold">200 pts</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 italic">
                  "Excelente articulação sintática e repertório sociocultural produtivo."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. SEÇÃO: TUTOR IA & ATUALIZAÇÃO CONSTANTE */}
      {/* ================================================== */}
      <section id="tutor-ia" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Tutor IA */}
          <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-black border border-indigo-500/30 shadow-2xl space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-2xl shadow-inner">
                🤖
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Seu professor particular com IA
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tire dúvidas, peça explicações, crie resumos e organize seus estudos em segundos com inteligência pedagógica calibrada para o ENEM 2026.
              </p>
              <div className="inline-block text-[11px] text-indigo-300/80 bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-500/20">
                Suporte pedagógico automatizado para estudo individualizado (diagnóstico formativo)
              </div>

              {/* Chips de Ferramentas Rápidas */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
                  💡 Explicar Questão da TRI
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
                  📝 Criar Resumo Rápido
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
                  📅 Cronograma Personalizado
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('cadastro')}
              className="mt-4 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Bot className="w-4 h-4" />
              <span>Experimentar Tutor IA</span>
            </button>
          </div>

          {/* Card 2: Atualização Constante */}
          <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-950 to-black border border-rose-500/30 shadow-2xl space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center text-2xl shadow-inner">
                🚀
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sempre atualizado
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Novos conteúdos, novos simulados e novas estratégias adicionados constantemente para acompanhar sua preparação em tempo real.
              </p>

              {/* Lista de Atualizações */}
              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400 stroke-[3]" />
                  <span>Novos simulados das bancas líderes todo mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400 stroke-[3]" />
                  <span>Acervo de apostilas sincronizado e categorizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400 stroke-[3]" />
                  <span>Propostas de redação com os temas do momento</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('cadastro')}
              className="mt-4 w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
            >
              <Zap className="w-4 h-4" />
              <span>Garantir Acesso Atualizado</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. DEPOIMENTOS ILUSTRATIVOS */}
      {/* ================================================== */}
      <section id="depoimentos" className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Resultados Reais</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quem estudou com a plataforma evoluiu
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Depoimentos ilustrativos de metas e aprovação alcançadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
            <div className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              “Os simulados me ajudaram a entender melhor meu nível e a estudar com mais estratégia.”
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/30 text-purple-300 font-black text-xs flex items-center justify-center">
                M
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Mariana</h5>
                <span className="text-[11px] text-purple-400 font-bold">Aprovada em Medicina</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
            <div className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              “A plataforma me deu direção. Antes eu estudava sem saber por onde começar.”
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 font-black text-xs flex items-center justify-center">
                R
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Rafael</h5>
                <span className="text-[11px] text-blue-400 font-bold">Aprovado em Engenharia</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-xl">
            <div className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              “A parte de redação foi essencial para minha evolução. A correção linha a linha fez total diferença.”
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-300 font-black text-xs flex items-center justify-center">
                J
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Juliana</h5>
                <span className="text-[11px] text-emerald-400 font-bold">Aprovada em Direito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 10. FINAL CTA CINEMATOGRÁFICO */}
      {/* ================================================== */}
      <section className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-black to-slate-950 border border-red-600/30 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase text-red-500 tracking-widest">
              Preparação de Alta Performance
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Sua aprovação pode começar hoje.
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
              Tenha acesso a uma plataforma moderna, atualizada e organizada para ajudar você a estudar com estratégia até o ENEM 2026.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('cadastro')}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-red-600/50 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>COMEÇAR AGORA</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-red-400" />
              <span>ENTRAR NA MINHA CONTA</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 11. FOOTER ESTILO STREAMING (SEM PREÇOS) */}
      {/* ================================================== */}
      <footer className="relative z-20 border-t border-white/10 bg-black px-4 sm:px-8 lg:px-12 py-10 text-xs text-slate-500 space-y-4">
        <div className="max-w-[1200px] mx-auto w-full space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 font-black text-white text-sm">
              <GraduationCap className="w-5 h-5 text-red-500" />
              <span>ENEM 2026 PRO — Plataforma de Aprovação Inteligente</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('login')}>Entrar</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('cadastro')}>Criar Conta</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Voltar ao Topo</span>
            </div>
          </div>

          <p className="text-slate-500 text-center sm:text-left">
            "O primeiro passo da sua aprovação está aqui." • Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
