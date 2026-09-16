import React, { useState, useMemo } from 'react';
import { db } from '../../db/storage';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { AreaDoConhecimento, SubjectData } from '../../types';
import {
  BookOpen,
  Search,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calculator,
  Compass,
  Atom,
  PenTool,
  Layers,
  Flame,
  Globe,
  Download,
  FileText,
  ExternalLink,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Eye,
  Maximize2,
  Minimize2,
  X,
  BookMarked,
  CheckSquare,
  Headphones,
  FileCode,
} from 'lucide-react';
import { TOTAL_DRIVE_MATERIALS_COUNT } from '../../db/driveConstants';
import {
  getDriveMaterialsBySubject,
  DriveMaterial,
} from '../../db/driveMaterialsData';

interface MateriasHomeProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

interface AreaFolderDef {
  id: AreaDoConhecimento;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  badgeColor: string;
  disciplines: {
    id: string;
    name: string;
    shortDesc: string;
  }[];
}

const AREA_FOLDERS: AreaFolderDef[] = [
  {
    id: 'LINGUAGENS',
    name: 'Linguagens, Códigos e suas Tecnologias',
    shortName: 'Linguagens',
    icon: PenTool,
    color: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    disciplines: [
      { id: 'lingua-portuguesa', name: 'Língua Portuguesa', shortDesc: 'Gramática, Sintaxe, Interpretação textual e Variação linguística' },
      { id: 'literatura', name: 'Literatura', shortDesc: 'Modernismo, Romantismo, Barroco e Vanguardas europeias' },
      { id: 'ingles', name: 'Inglês', shortDesc: 'Compreensão de textos, inferência de sentido e vocabulário' },
      { id: 'espanhol', name: 'Espanhol', shortDesc: 'Leitura crítica, falsos cognatos e conectivos' },
      { id: 'artes', name: 'Artes', shortDesc: 'Manifestações artísticas, patrimônio cultural e vanguardas' },
      { id: 'educacao-fisica', name: 'Educação Física', shortDesc: 'Corpo, saúde, esportes e práticas corporais no ENEM' },
    ],
  },
  {
    id: 'CIENCIAS_HUMANAS',
    name: 'Ciências Humanas e suas Tecnologias',
    shortName: 'Ciências Humanas',
    icon: Compass,
    color: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    disciplines: [
      { id: 'historia', name: 'História', shortDesc: 'Brasil Colônia, República, Era Vargas e História Geral' },
      { id: 'geografia', name: 'Geografia', shortDesc: 'Geopolítica, Meio Ambiente, Urbanização e Cartografia' },
      { id: 'filosofia', name: 'Filosofia', shortDesc: 'Ética, Política, Filosofia Antiga, Moderna e Contemporânea' },
      { id: 'sociologia', name: 'Sociologia', shortDesc: 'Trabalho, Cidadania, Cultura, Movimentos Sociais e Teóricos clássicos' },
    ],
  },
  {
    id: 'CIENCIAS_DA_NATUREZA',
    name: 'Ciências da Natureza e suas Tecnologias',
    shortName: 'Ciências da Natureza',
    icon: Atom,
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    disciplines: [
      { id: 'biologia', name: 'Biologia', shortDesc: 'Ecologia, Genética, Citologia, Fisiologia e Evolução' },
      { id: 'quimica', name: 'Química', shortDesc: 'Estequiometria, Termoquímica, Soluções e Química Orgânica' },
      { id: 'fisica', name: 'Física', shortDesc: 'Mecânica, Termodinâmica, Ondulatória e Eletricidade' },
    ],
  },
  {
    id: 'MATEMATICA',
    name: 'Matemática e suas Tecnologias',
    shortName: 'Matemática',
    icon: Calculator,
    color: 'from-blue-600 to-cyan-600',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    disciplines: [
      { id: 'matematica', name: 'Matemática ENEM', shortDesc: 'Funções, Geometria Espacial, Probabilidade, Estatística e Razão/Proporção' },
    ],
  },
];

export const MateriasHome: React.FC<MateriasHomeProps> = ({ onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const [activeAreaFolder, setActiveAreaFolder] = useState<AreaFolderDef | null>(null);
  const [activeDiscipline, setActiveDiscipline] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<DriveMaterial | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const topicStatusMap = currentUser ? db.getTopicStatusMap(currentUser.id) : {};

  // Compute live progress based on topicStatusMap
  const enrichedCurriculum = useMemo(() => {
    return ENEM_CURRICULUM.map((subject) => {
      const total = subject.topics.length;
      let completed = 0;
      let dominated = 0;

      subject.topics.forEach((t) => {
        const st = topicStatusMap[t.id] || t.status;
        if (st === 'DOMINADO') {
          completed++;
          dominated++;
        } else if (st === 'REVISADO') {
          completed++;
        }
      });

      const mastery = total > 0 ? Math.round(((dominated * 1.0 + (completed - dominated) * 0.6) / total) * 100) : 0;

      return {
        ...subject,
        completedTopics: completed,
        masteryPercentage: mastery,
      };
    });
  }, [topicStatusMap]);

  // Overall stats
  const totalTopicsPlatform = enrichedCurriculum.reduce((acc, s) => acc + s.totalTopics, 0);
  const totalCompletedPlatform = enrichedCurriculum.reduce((acc, s) => acc + s.completedTopics, 0);
  const averageMastery = Math.round(
    enrichedCurriculum.reduce((acc, s) => acc + s.masteryPercentage, 0) / enrichedCurriculum.length
  );

  // Materials of active discipline
  const disciplineMaterials = useMemo(() => {
    if (!activeDiscipline) return [];
    return getDriveMaterialsBySubject(activeDiscipline.name);
  }, [activeDiscipline]);

  // Active curriculum subject data
  const currentCurriculumSubject = useMemo(() => {
    if (!activeDiscipline) return null;
    return enrichedCurriculum.find((s) => s.id === activeDiscipline.id || s.name.toLowerCase() === activeDiscipline.name.toLowerCase());
  }, [activeDiscipline, enrichedCurriculum]);

  // Classified modules inside a discipline
  const classifiedContent = useMemo(() => {
    if (!activeDiscipline) return null;

    const materials = disciplineMaterials;
    const topics = currentCurriculumSubject?.topics || [];

    return {
      aulas: topics,
      apostilas: materials.filter((m) => m.type === 'PDF' && (m.fileName.toLowerCase().includes('apostila') || m.fileName.toLowerCase().includes('livro') || m.fileName.toLowerCase().includes('modulo'))),
      resumos: materials.filter((m) => m.type === 'PDF' && (m.fileName.toLowerCase().includes('resumo') || m.fileName.toLowerCase().includes('mapa') || m.fileName.toLowerCase().includes('esquema'))),
      exercicios: materials.filter((m) => m.fileName.toLowerCase().includes('exercic') || m.fileName.toLowerCase().includes('questao') || m.fileName.toLowerCase().includes('lista')),
      complementar: materials.filter((m) => m.type === 'AUDIO' || m.type === 'IMAGEM' || (!m.fileName.toLowerCase().includes('apostila') && !m.fileName.toLowerCase().includes('resumo') && !m.fileName.toLowerCase().includes('exercic'))),
    };
  }, [activeDiscipline, disciplineMaterials, currentCurriculumSubject]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumbs & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap">
          <button
            onClick={() => {
              setActiveAreaFolder(null);
              setActiveDiscipline(null);
            }}
            className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>📚 Matérias</span>
          </button>

          {activeAreaFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setActiveDiscipline(null)}
                className={`hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer ${
                  !activeDiscipline ? 'text-brand-600 dark:text-brand-400 font-black' : ''
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>📂 {activeAreaFolder.shortName}</span>
              </button>
            </>
          )}

          {activeDiscipline && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-brand-600 dark:text-brand-400 font-black flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>📁 {activeDiscipline.name}</span>
              </span>
            </>
          )}
        </div>

        {/* Action: Voltar button when inside folder */}
        {(activeAreaFolder || activeDiscipline) && (
          <button
            onClick={() => {
              if (activeDiscipline) {
                setActiveDiscipline(null);
              } else {
                setActiveAreaFolder(null);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar um nível</span>
          </button>
        )}
      </div>

      {/* LEVEL 0: ROOT - 4 AREA FOLDERS */}
      {!activeAreaFolder && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold text-brand-200">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Organização em Pastas por Área do Conhecimento</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Pastas de Matérias do ENEM 2026
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Navegue pelas 4 grandes áreas e acesse as pastas individuais de cada disciplina com apostilas completas do acervo, resumos, listas de questões e aulas didáticas integradas.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white/10 font-bold border border-white/10">
                  📁 15 Disciplinas Independentes
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 font-bold border border-white/10">
                  📚 {TOTAL_DRIVE_MATERIALS_COUNT} Arquivos Didáticos Catalogados
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  🎯 {totalTopicsPlatform} Tópicos Curriculares
                </span>
              </div>
            </div>
          </div>

          {/* 4 Area Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {AREA_FOLDERS.map((area) => {
              const Icon = area.icon;
              const areaSubjects = enrichedCurriculum.filter((s) => s.area === area.id);
              const totalFilesArea = area.disciplines.reduce((acc, d) => {
                return acc + getDriveMaterialsBySubject(d.name).length;
              }, 0);
              const totalTopicsArea = areaSubjects.reduce((acc, s) => acc + s.totalTopics, 0);

              return (
                <div
                  key={area.id}
                  onClick={() => setActiveAreaFolder(area)}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${area.color} text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Pasta de Área
                          </span>
                          <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            📂 {area.shortName}
                          </h3>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${area.badgeColor}`}>
                        {area.disciplines.length} Disciplinas
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {area.name}. Contém todas as apostilas, listas de exercícios e teoria do ENEM.
                    </p>

                    {/* Subfolders list preview */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Pastas Internas:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {area.disciplines.map((d) => (
                          <span
                            key={d.id}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 flex items-center gap-1"
                          >
                            <Folder className="w-3 h-3 text-amber-500" />
                            <span>{d.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Folder Footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span><strong>{totalFilesArea}</strong> apostilas</span>
                      <span>•</span>
                      <span><strong>{totalTopicsArea}</strong> tópicos</span>
                    </div>

                    <div className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Abrir Pasta</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 1: INSIDE AN AREA FOLDER - DISCIPLINE FOLDERS */}
      {activeAreaFolder && !activeDiscipline && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                Área Selecionada
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                📂 {activeAreaFolder.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Escolha a disciplina abaixo para abrir os arquivos, apostilas, resumos e exercícios.
              </p>
            </div>

            <button
              onClick={() => setActiveAreaFolder(null)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Outras Áreas</span>
            </button>
          </div>

          {/* Discipline Subfolders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAreaFolder.disciplines.map((d) => {
              const materialsCount = getDriveMaterialsBySubject(d.name).length;
              const curSubject = enrichedCurriculum.find((s) => s.id === d.id || s.name.toLowerCase() === d.name.toLowerCase());
              const topicsCount = curSubject?.totalTopics || 0;
              const mastery = curSubject?.masteryPercentage || 0;

              return (
                <div
                  key={d.id}
                  onClick={() => setActiveDiscipline({ id: d.id, name: d.name })}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-brand-500 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                        <Folder className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800">
                        {mastery}% Domínio
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        📁 {d.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {d.shortDesc}
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-black text-slate-900 dark:text-white block">{materialsCount}</span>
                        <span className="text-[10px] text-slate-400">Arquivos no Acervo</span>
                      </div>
                      <div>
                        <span className="font-black text-slate-900 dark:text-white block">{topicsCount}</span>
                        <span className="text-[10px] text-slate-400">Tópicos do ENEM</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                    <span>Acessar Arquivos da Matéria</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 2: INSIDE A DISCIPLINE FOLDER - STUDY MODULES & DRIVE FILES */}
      {activeDiscipline && classifiedContent && (
        <div className="space-y-6">
          {/* Discipline Folder Header */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-200 dark:border-amber-800">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Pasta Aberta</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                📁 {activeDiscipline.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Biblioteca própria de estudos contendo todas as aulas estruturadas, apostilas completas em PDF, resumos esquematizados, listas de questões e materiais complementares.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('materia-detalhe', { subjectId: activeDiscipline.id })}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Modo de Estudo em 8 Abas</span>
              </button>

              <button
                onClick={() => setActiveDiscipline(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar às Matérias</span>
              </button>
            </div>
          </div>

          {/* 5 Organized Content Modules */}
          <div className="space-y-6">
            {/* 1. Aulas & Teoria */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    1. Aulas & Teoria Curricular ({classifiedContent.aulas.length} Aulas)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Matriz de Habilidades do INEP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classifiedContent.aulas.map((aula, idx) => (
                  <div
                    key={aula.id}
                    onClick={() => onNavigate('materia-detalhe', { subjectId: activeDiscipline.id })}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700 hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                          Aula {idx + 1}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">
                        {aula.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {aula.summary[0] || 'Conteúdo teórico e exercícios'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-brand-600">
                      <span>Estudar Teoria</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Apostilas & Livros Didáticos */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    2. Apostilas & Livros Didáticos ({disciplineMaterials.filter(m => m.type === 'PDF').length} Arquivos PDF)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Leitor integrado sem sair do sistema</span>
              </div>

              {disciplineMaterials.filter(m => m.type === 'PDF').length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma apostila registrada para esta matéria.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {disciplineMaterials.filter(m => m.type === 'PDF').map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700 hover:border-rose-400 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            PDF
                          </span>
                          {mat.subfolder && (
                            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                              {mat.subfolder}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
                          {mat.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {mat.fileName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setPreviewMaterial(mat)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ler no App</span>
                        </button>

                        <a
                          href={mat.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Baixar PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Exercícios & Listas de Questões */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    3. Exercícios & Listas de Questões Resolvidas
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('questoes')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Abrir Banco Geral →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Lista de Fixação Rápida — {activeDiscipline.name}
                    </span>
                    <p className="text-xs text-slate-500">
                      Questões selecionadas por relevância estatística no ENEM.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('questoes')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    Resolver
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Exercícios Resolvidos Passo a Passo
                    </span>
                    <p className="text-xs text-slate-500">
                      Resoluções comentadas em 4 etapas cognitivas.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('materia-detalhe', { subjectId: activeDiscipline.id })}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    Ver Etapas
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Material Complementar & Recursos */}
            {disciplineMaterials.filter(m => m.type !== 'PDF').length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    4. Material Complementar & Áudios
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {disciplineMaterials.filter(m => m.type !== 'PDF').map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Headphones className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="truncate">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{mat.title}</h4>
                          <span className="text-[10px] text-slate-400 uppercase">{mat.type}</span>
                        </div>
                      </div>

                      <a
                        href={mat.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded In-App PDF Reader Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-6 animate-fade-in">
          <div
            className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/50 transition-all ${
              isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {previewMaterial.category}
                </span>
                <h3 className="font-bold text-xs md:text-sm text-white truncate max-w-md">
                  {previewMaterial.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewMaterial.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar</span>
                </a>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Drive Viewer Frame */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src={previewMaterial.embedUrl}
                title={previewMaterial.title}
                className="w-full h-full border-0"
                allow="autoplay"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
