import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../../db/storage';
import {
  LibraryAreaId,
  MaterialContentType,
  MaterialProgressStatus,
  StudentMaterialProgress,
} from '../../types';
import {
  LIBRARY_AREAS,
  LibraryAreaDef,
  getAllEnrichedMaterials,
  EnrichedMaterial,
} from '../../db/libraryStructure';
import {
  BookOpen,
  Search,
  Download,
  Eye,
  FileText,
  Headphones,
  Image as ImageIcon,
  Sparkles,
  Folder,
  X,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Star,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  GraduationCap,
  Layers,
  Award,
  Compass,
  Atom,
  Calculator,
  PenTool,
  Bookmark,
  Share2,
} from 'lucide-react';

interface BibliotecaDriveProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  initialArea?: LibraryAreaId;
  initialCategory?: string;
}

export const BibliotecaDrive: React.FC<BibliotecaDriveProps> = ({
  onNavigate,
  initialArea,
  initialCategory,
}) => {
  const currentUser = db.getCurrentUser();
  const userId = currentUser?.id || 'demo-student-01';

  // Navegação hierárquica
  const [selectedAreaId, setSelectedAreaId] = useState<LibraryAreaId | null>(() => {
    if (initialArea) return initialArea;
    if (initialCategory && initialCategory !== 'TODAS') {
      const lower = initialCategory.toLowerCase();
      if (lower.includes('mat')) return 'MATEMATICA';
      if (lower.includes('port') || lower.includes('ling') || lower.includes('art')) return 'LINGUAGENS';
      if (lower.includes('bio') || lower.includes('qui') || lower.includes('fis')) return 'CIENCIAS_DA_NATUREZA';
      if (lower.includes('hist') || lower.includes('geo') || lower.includes('fil') || lower.includes('soc')) return 'CIENCIAS_HUMANAS';
      if (lower.includes('redac')) return 'REDACAO';
      if (lower.includes('etec')) return 'ETEC';
    }
    return null;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Filtros de busca e tipo
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');

  // Modal de Leitura / Estudo do Material
  const [activeMaterial, setActiveMaterial] = useState<EnrichedMaterial | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTimer, setReadingTimer] = useState<number>(0);

  // Progresso do aluno
  const [userProgressMap, setUserProgressMap] = useState<Record<string, StudentMaterialProgress>>(() =>
    db.getAllMaterialProgress(userId)
  );

  // Todos os materiais catalogados + customizados do admin
  const allMaterials = useMemo(() => {
    return getAllEnrichedMaterials();
  }, []);

  // Recarregar progresso ao atualizar storage
  useEffect(() => {
    return db.subscribe(() => {
      setUserProgressMap(db.getAllMaterialProgress(userId));
    });
  }, [userId]);

  // Timer de leitura quando o modal do material estiver aberto
  useEffect(() => {
    let interval: any;
    if (activeMaterial) {
      setReadingTimer(0);
      interval = setInterval(() => {
        setReadingTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMaterial]);

  // Estatísticas gerais da biblioteca
  const libraryStats = useMemo(() => {
    const totalMaterials = allMaterials.length;
    const progressList = Object.values(userProgressMap);
    const completedCount = progressList.filter((p) => p.status === 'CONCLUIDO').length;
    const inProgressCount = progressList.filter((p) => p.status === 'EM_ANDAMENTO').length;
    const percentCompleted = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;
    const totalMinutes = progressList.reduce((acc, p) => acc + (p.timeSpentMinutes || 0), 0);

    return {
      totalMaterials,
      completedCount,
      inProgressCount,
      percentCompleted,
      totalHours: Math.round(totalMinutes / 60) || 0,
    };
  }, [allMaterials, userProgressMap]);

  // Último material acessado (Sistema de continuidade)
  const lastAccessed = useMemo(() => {
    return db.getLastAccessedMaterial(userId);
  }, [userId, userProgressMap]);

  // Materiais filtrados por área, pasta, tipo e busca
  const displayedMaterials = useMemo(() => {
    let list = allMaterials;

    if (selectedAreaId) {
      list = list.filter((m) => m.areaId === selectedAreaId);
    }

    if (selectedFolderId) {
      list = list.filter((m) => m.folderId === selectedFolderId);
    }

    if (selectedType !== 'TODOS') {
      list = list.filter((m) => m.contentType === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.cleanTitle.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.subjectName.toLowerCase().includes(q) ||
          (m.subfolder && m.subfolder.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allMaterials, selectedAreaId, selectedFolderId, selectedType, searchQuery]);

  // Helpers de progresso por área
  const getAreaStats = (areaId: LibraryAreaId) => {
    const areaMaterials = allMaterials.filter((m) => m.areaId === areaId);
    const completed = areaMaterials.filter(
      (m) => userProgressMap[m.id]?.status === 'CONCLUIDO'
    ).length;
    const percent = areaMaterials.length > 0 ? Math.round((completed / areaMaterials.length) * 100) : 0;
    return {
      total: areaMaterials.length,
      completed,
      percent,
    };
  };

  // Helpers de progresso por pasta
  const getFolderCount = (folderId: string) => {
    return allMaterials.filter((m) => m.folderId === folderId).length;
  };

  // Manipuladores de Ação do Material
  const handleOpenMaterial = (mat: EnrichedMaterial) => {
    // Registrar início ou andamento
    const currentProg = userProgressMap[mat.id];
    if (!currentProg || currentProg.status === 'NAO_INICIADO') {
      db.setMaterialProgress(userId, mat.id, { status: 'EM_ANDAMENTO' });
    } else {
      db.setMaterialProgress(userId, mat.id, { lastAccessedAt: new Date().toISOString() });
    }
    setActiveMaterial(mat);
  };

  const handleToggleStatus = (materialId: string, newStatus: MaterialProgressStatus) => {
    db.setMaterialProgress(userId, materialId, { status: newStatus });
  };

  const handleToggleFavorite = (materialId: string) => {
    const current = userProgressMap[materialId];
    const isFav = !current?.isFavorite;
    db.setMaterialProgress(userId, materialId, { isFavorite: isFav });
  };

  const handleCloseModal = () => {
    if (activeMaterial && readingTimer > 10) {
      // Registrar tempo estudado
      const minutes = Math.ceil(readingTimer / 60);
      const current = userProgressMap[activeMaterial.id];
      const prevMinutes = current?.timeSpentMinutes || 0;
      db.setMaterialProgress(userId, activeMaterial.id, {
        timeSpentMinutes: prevMinutes + minutes,
      });
    }
    setActiveMaterial(null);
    setIsFullscreen(false);
  };

  const currentAreaDef = LIBRARY_AREAS.find((a) => a.id === selectedAreaId);
  const currentFolderDef = currentAreaDef?.folders.find((f) => f.id === selectedFolderId);

  // Tipos de filtros disponíveis
  const contentTypeFilters: { id: string; label: string; icon: any }[] = [
    { id: 'TODOS', label: 'Todos os Tipos', icon: Layers },
    { id: 'APOSTILA', label: '📄 Apostilas', icon: FileText },
    { id: 'AUDIO', label: '🎧 Áudios', icon: Headphones },
    { id: 'MAPA_MENTAL', label: '🖼 Mapas Mentais', icon: ImageIcon },
    { id: 'EXERCICIO', label: '📝 Exercícios', icon: PenTool },
    { id: 'SIMULADO', label: '🎯 Simulados', icon: Award },
    { id: 'RESUMO', label: '📚 Resumos', icon: BookOpen },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* 1. TOPO: HEADER DAS PASTAS DE MATÉRIAS & BUSCA AVANÇADA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Pastas de Matérias do ENEM 2026
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/10">
                  Acervo Completo & Leitor Integrado
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                📚 Pastas de Matérias
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Acesse todos os materiais e apostilas didáticas organizados por área do conhecimento e disciplinas: teoria aprofundada, mapas mentais, resumos esquemáticos, listas de exercícios e o acervo completo da ETEC e do ENEM 2026.
              </p>
            </div>

            {/* Régua de Métricas Educacionais */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 shrink-0 shadow-inner">
              <div className="text-center px-2">
                <span className="block text-xl sm:text-2xl font-black text-brand-400 font-mono">15</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Disciplinas</span>
              </div>
              <div className="text-center px-2 border-x border-white/10">
                <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">{allMaterials.length}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Arquivos didáticos</span>
              </div>
              <div className="text-center px-2">
                <span className="block text-xl sm:text-2xl font-black text-indigo-400 font-mono">45+</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-tight">Tópicos curriculares</span>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar matéria, tema, professor, apostila ou palavra-chave..."
              className="w-full pl-12 pr-10 py-3.5 bg-white/10 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PAINEL DO ALUNO (MINHA EVOLUÇÃO) & SISTEMA DE CONTINUIDADE (CONTINUE ESTUDANDO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Painel: Minha Evolução nas Matérias */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Minha Evolução nas Matérias
            </span>
            <span className="text-xs font-mono font-black text-brand-600 dark:text-brand-400">
              {libraryStats.percentCompleted}% concluído
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(libraryStats.percentCompleted, 3)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 font-bold block">Arquivos Estudados</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {libraryStats.completedCount} / {libraryStats.totalMaterials}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 font-bold block">Em Andamento</span>
                <span className="text-sm font-black text-amber-600">
                  {libraryStats.inProgressCount} arquivos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema de Continuidade: Continue de onde parou */}
        <div className="lg:col-span-2 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30 p-5 rounded-3xl border border-brand-200 dark:border-brand-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-brand-700 dark:text-brand-400 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                Continue de Onde Parou
              </span>
              <span className="px-2 py-0.2 rounded-full bg-brand-200 dark:bg-brand-900 text-brand-800 dark:text-brand-200 text-[10px] font-black">
                {lastAccessed ? 'Último Acesso' : 'Recomendado para Hoje'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {lastAccessed ? lastAccessed.material.cleanTitle : '📘 Matemática: Função do 2º Grau & Vértice da Parábola'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {lastAccessed ? (
                <>Status: <strong>{lastAccessed.progress.status === 'CONCLUIDO' ? 'Concluído' : 'Em andamento'}</strong> • Tempo dedicado: {lastAccessed.progress.timeSpentMinutes || 15} min</>
              ) : (
                'Retome seu estudo de Matemática com a apostila completa e 25 exercícios resolvidos.'
              )}
            </p>
          </div>

          <button
            onClick={() => {
              if (lastAccessed) {
                handleOpenMaterial(lastAccessed.material);
              } else {
                const mathMat = allMaterials.find((m) => m.areaId === 'MATEMATICA');
                if (mathMat) handleOpenMaterial(mathMat);
              }
            }}
            className="shrink-0 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continuar Estudando →</span>
          </button>
        </div>
      </div>

      {/* BREADCRUMB DE NAVEGAÇÃO ENTRE NÍVEIS */}
      {(selectedAreaId || selectedFolderId || searchQuery) && (
        <div className="flex items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-bold">
            <button
              onClick={() => {
                setSelectedAreaId(null);
                setSelectedFolderId(null);
                setSearchQuery('');
              }}
              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matérias</span>
            </button>

            {currentAreaDef && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`hover:underline cursor-pointer ${
                    !selectedFolderId ? 'text-slate-900 dark:text-white font-black' : 'text-brand-600 dark:text-brand-400'
                  }`}
                >
                  <span>{currentAreaDef.emoji} {currentAreaDef.shortName}</span>
                </button>
              </>
            )}

            {currentFolderDef && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 dark:text-white font-black">
                  📁 {currentFolderDef.name}
                </span>
              </>
            )}

            {searchQuery && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 font-normal">
                  Busca: "{searchQuery}"
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedAreaId(null);
              setSelectedFolderId(null);
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
          >
            Ver Todas as Áreas
          </button>
        </div>
      )}

      {/* 3. NÍVEL 0: OS 6 GRANDES CARDS DE MATÉRIAS (SE NENHUMA ÁREA ESTIVER SELECIONADA E NÃO FOR BUSCA) */}
      {!selectedAreaId && !searchQuery && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                Áreas do Conhecimento & Trilha de Estudos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione uma pasta para acessar as matérias, resumos teóricos e apostilas em PDF
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              6 Grandes Áreas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LIBRARY_AREAS.map((area) => {
              const stats = getAreaStats(area.id);
              const areaMaterials = allMaterials.filter((m) => m.areaId === area.id);

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-brand-400/80 dark:hover:border-brand-500/80 transition-all duration-300 p-6 flex flex-col justify-between gap-5 cursor-pointer group hover:-translate-y-1.5"
                >
                  <div className="space-y-3.5">
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                          {area.emoji}
                        </div>
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${area.badgeBg} ${area.badgeText}`}>
                            {area.folders.length} Matérias
                          </span>
                          <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-1">
                            {area.shortName}
                          </h3>
                        </div>
                      </div>

                      <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-xs shrink-0">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {area.description}
                    </p>

                    {/* Pastas da área */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {area.folders.slice(0, 5).map((f) => (
                        <span
                          key={f.id}
                          className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <span className="opacity-60">📁</span> {f.name}
                        </span>
                      ))}
                      {area.folders.length > 5 && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[11px] font-bold">
                          +{area.folders.length - 5} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rodapé do Card: Progresso e Contador de Materiais + Botão Abrir Pasta */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">
                        📄 <strong>{stats.total} arquivos didáticos</strong>
                      </span>
                      <span className="text-brand-600 dark:text-brand-400 font-mono">
                        {stats.percent}% concluído
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(stats.percent, 4)}%` }}
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAreaId(area.id);
                      }}
                      className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 group-hover:shadow-lg group-hover:shadow-brand-600/30 transition-all cursor-pointer mt-1"
                    >
                      <span>Abrir Pasta</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. NÍVEL 1: PASTAS DA ÁREA SELECIONADA */}
      {selectedAreaId && !selectedFolderId && !searchQuery && currentAreaDef && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header da Área */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentAreaDef.emoji}</span>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${currentAreaDef.badgeBg} ${currentAreaDef.badgeText}`}>
                  Área do Conhecimento
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currentAreaDef.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {getAreaStats(selectedAreaId).total} materiais didáticos organizados em {currentAreaDef.folders.length} matérias.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedAreaId(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Áreas</span>
            </button>
          </div>

          {/* Pastas da Área */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selecione a Matéria / Pasta:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {currentAreaDef.folders.map((folder) => {
                const count = getFolderCount(folder.id);
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-lg">
                          📁
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                          {count} materiais
                        </span>
                      </div>

                      <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {folder.name}
                      </h4>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {folder.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                      <span>Abrir Pasta</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. NÍVEL 2: MATERIAIS DENTRO DA PASTA / MATÉRIA OU RESULTADOS DE BUSCA */}
      {(selectedFolderId || searchQuery) && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header da Pasta Selecionada */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xl font-bold">
                📁
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {searchQuery ? `Resultados da busca: "${searchQuery}"` : currentFolderDef?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {displayedMaterials.length} materiais didáticos encontrados • {currentAreaDef?.name || 'Matérias do ENEM 2026'}
                </p>
              </div>
            </div>

            {selectedFolderId && (
              <button
                onClick={() => setSelectedFolderId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para Matérias</span>
              </button>
            )}
          </div>

          {/* Filtros por Tipo de Conteúdo (Apostilas, Áudios, Mapas Mentais, Exercícios, Simulados, Resumos) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {contentTypeFilters.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedType === tab.id;
              const count = tab.id === 'TODOS'
                ? displayedMaterials.length
                : allMaterials.filter(
                    (m) =>
                      m.contentType === tab.id &&
                      (!selectedAreaId || m.areaId === selectedAreaId) &&
                      (!selectedFolderId || m.folderId === selectedFolderId)
                  ).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de Materiais */}
          {displayedMaterials.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-800">
              <span className="text-4xl">🔍</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Nenhum material encontrado com esses filtros
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente selecionar outro tipo de conteúdo ou limpar a busca para visualizar mais opções.
              </p>
              <button
                onClick={() => {
                  setSelectedType('TODOS');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedMaterials.map((material) => {
                const progress = userProgressMap[material.id];
                const status = progress?.status || 'NAO_INICIADO';
                const isFav = !!progress?.isFavorite;

                return (
                  <div
                    key={material.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-2.5">
                      {/* Topo do Material: Tipo & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          material.contentType === 'MAPA_MENTAL'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : material.contentType === 'AUDIO'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : material.contentType === 'EXERCICIO'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : material.contentType === 'SIMULADO'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {material.contentType === 'MAPA_MENTAL' && '🖼 Mapa Mental'}
                          {material.contentType === 'AUDIO' && '🎧 Áudio Aula'}
                          {material.contentType === 'EXERCICIO' && '📝 Exercícios'}
                          {material.contentType === 'SIMULADO' && '🎯 Simulado'}
                          {material.contentType === 'RESUMO' && '📚 Resumo'}
                          {material.contentType === 'APOSTILA' && '📄 Apostila PDF'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(material.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isFav
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                            title={isFav ? 'Remover dos favoritos' : 'Favoritar material'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                          </button>

                          {/* Indicador de Status */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus: MaterialProgressStatus =
                                status === 'CONCLUIDO'
                                  ? 'NAO_INICIADO'
                                  : status === 'EM_ANDAMENTO'
                                  ? 'CONCLUIDO'
                                  : 'EM_ANDAMENTO';
                              handleToggleStatus(material.id, nextStatus);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                              status === 'CONCLUIDO'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : status === 'EM_ANDAMENTO'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                            title="Clique para alternar o status"
                          >
                            <span>{status === 'CONCLUIDO' ? '🟢 Concluído' : status === 'EM_ANDAMENTO' ? '🟡 Em andamento' : '⚪ Não lido'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Título do Material */}
                      <h4
                        onClick={() => handleOpenMaterial(material)}
                        className="font-black text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer line-clamp-2"
                      >
                        {material.cleanTitle}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {material.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-600" />
                          {material.estimatedMinutes} min estimados
                        </span>
                        <span>•</span>
                        <span>{material.mimeType.includes('pdf') ? 'PDF' : material.type}</span>
                      </div>
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenMaterial(material)}
                        className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Ler Agora</span>
                      </button>

                      <a
                        href={material.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Baixar Arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. NÍVEL 3: MODAL / VISUALIZADOR PRÓPRIO DO MATERIAL COM LEITOR IN-APP */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[92vh] max-h-[850px]'
          }`}>
            {/* Header da Leitura */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 gap-3">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                  <span>{currentAreaDef?.shortName || activeMaterial.category}</span>
                  <span>•</span>
                  <span>{activeMaterial.contentType}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    Tempo na sessão: {Math.floor(readingTimer / 60)}m {readingTimer % 60}s
                  </span>
                </div>

                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {activeMaterial.cleanTitle}
                </h3>
              </div>

              {/* Botões do Header */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleFavorite(activeMaterial.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    userProgressMap[activeMaterial.id]?.isFavorite
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Favoritar"
                >
                  <Star className={`w-4 h-4 ${userProgressMap[activeMaterial.id]?.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                <a
                  href={activeMaterial.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors"
                  title="Baixar Material"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors hidden sm:block"
                  title={isFullscreen ? 'Reduzir tela' : 'Tela cheia'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barra de Status e Ações Rápidas */}
            <div className="px-4 py-2.5 bg-brand-50/60 dark:bg-brand-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                  Seu status neste material:
                </span>
                <select
                  value={userProgressMap[activeMaterial.id]?.status || 'NAO_INICIADO'}
                  onChange={(e) =>
                    handleToggleStatus(activeMaterial.id, e.target.value as MaterialProgressStatus)
                  }
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="NAO_INICIADO">⚪ Não iniciado</option>
                  <option value="EM_ANDAMENTO">🟡 Em andamento</option>
                  <option value="CONCLUIDO">🟢 Concluído (+50 XP)</option>
                </select>
              </div>

              <button
                onClick={() => handleToggleStatus(activeMaterial.id, 'CONCLUIDO')}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                  userProgressMap[activeMaterial.id]?.status === 'CONCLUIDO'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Marcar como Concluído</span>
              </button>
            </div>

            {/* Leitor Incorporado Nativo In-App */}
            <div className="flex-1 bg-slate-950 relative w-full h-full overflow-hidden">
              <iframe
                src={activeMaterial.embedUrl}
                title={activeMaterial.title}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
