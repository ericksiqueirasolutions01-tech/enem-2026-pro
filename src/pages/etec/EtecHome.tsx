import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Eye,
  FileText,
  Sparkles,
  Calculator,
  Compass,
  Atom,
  Globe,
  PenTool,
  Check,
  RotateCw,
  X,
  Play,
  Layers,
  Award,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ETEC_SPECIAL_MATERIALS, EnrichedMaterial } from '../../db/libraryStructure';
import { db } from '../../db/storage';

interface EtecHomeProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

interface EtecQuestion {
  id: string;
  number: number;
  discipline: string;
  statement: string;
  options: { letter: string; text: string }[];
  correctLetter: string;
  explanation: string;
}

const ETEC_DISCIPLINES = [
  { id: 'etec-portugues', name: 'Português', icon: PenTool, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800', desc: 'Compreensão textual, charges, tirinhas, recursos de coesão e variedades linguísticas' },
  { id: 'etec-matematica', name: 'Matemática', icon: Calculator, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', desc: 'Porcentagem, razão, regra de 3, equações, geometria plana e análise gráfica' },
  { id: 'etec-ciencias', name: 'Ciências', icon: Atom, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', desc: 'Ecologia, corpo humano, química cotidiana, energia, movimento e saúde' },
  { id: 'etec-historia', name: 'História', icon: Compass, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', desc: 'Brasil República, imigração, industrialização paulista e cidadania' },
  { id: 'etec-geografia', name: 'Geografia', icon: Globe, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800', desc: 'Relevo, biomas brasileiros, urbanização, macrometrópole e sustentabilidade' },
  { id: 'etec-atualidades', name: 'Atualidades', icon: Sparkles, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800', desc: 'Tecnologia, inteligência artificial, conferências climáticas e meio ambiente' },
];

// 40 Questões do Simulado Oficial ETEC
const ETEC_FULL_EXAM: EtecQuestion[] = [
  {
    id: 'etec-1',
    number: 1,
    discipline: 'Língua Portuguesa',
    statement: 'Em um anúncio institucional sobre conservação dos recursos hídricos, lê-se: "Gota a gota, o desperdício seca o nosso futuro." O efeito de sentido principal construído nessa frase fundamenta-se em qual recurso expressivo?',
    options: [
      { letter: 'A', text: 'Metáfora que associa a escassez de água à perda de oportunidades e qualidade de vida.' },
      { letter: 'B', text: 'Eufemismo que busca suavizar a gravidade da crise hídrica.' },
      { letter: 'C', text: 'Ironia com objetivo de repreender sem seriedade os consumidores.' },
      { letter: 'D', text: 'Pleonasmo vicioso sem função poética ou comunicativa.' },
      { letter: 'E', text: 'Antítese sem relação lógica entre os termos água e futuro.' },
    ],
    correctLetter: 'A',
    explanation: 'A metáfora "o desperdício seca o nosso futuro" transfere o ato físico de secar (água) para uma dimensão temporal e social (futuro), reforçado pela aliteração e ritmo de "gota a gota".',
  },
  {
    id: 'etec-2',
    number: 2,
    discipline: 'Matemática',
    statement: 'Uma cooperativa de reciclagem processa 240 kg de plástico em 3 horas utilizando 4 prensas hidráulicas. Quantos quilogramas de plástico serão processados em 5 horas se 6 prensas de mesma capacidade forem operadas?',
    options: [
      { letter: 'A', text: '450 kg' },
      { letter: 'B', text: '500 kg' },
      { letter: 'C', text: '600 kg' },
      { letter: 'D', text: '720 kg' },
      { letter: 'E', text: '800 kg' },
    ],
    correctLetter: 'C',
    explanation: 'Regra de três composta: 240 / x = (3/5) * (4/6) = 12/30 = 2/5. Assim, 2x = 240 * 5 = 1200 => x = 600 kg.',
  },
  {
    id: 'etec-3',
    number: 3,
    discipline: 'Ciências',
    statement: 'No ciclo da matéria orgânica, fungos e bactérias desempenham um papel vital para o equilíbrio dos ecossistemas como decompositores porque:',
    options: [
      { letter: 'A', text: 'Sintetizam glicose a partir de água e dióxido de carbono na ausência de luz.' },
      { letter: 'B', text: 'Transformam matéria orgânica morta em nutrientes minerais reaproveitáveis pelos produtores.' },
      { letter: 'C', text: 'Aumentam a concentração de gases tóxicos e impedem o crescimento vegetal.' },
      { letter: 'D', text: 'Consomem energia luminosa e bloqueiam as cadeias tróficas marinhas.' },
      { letter: 'E', text: 'São exclusivamente parasitas de animais vertebrados em florestas tropicais.' },
    ],
    correctLetter: 'B',
    explanation: 'Os decompositores realizam a reciclagem de nutrientes, mineralizando restos orgânicos para que plantas e algas possam reiniciar a cadeia trófica.',
  },
  {
    id: 'etec-4',
    number: 4,
    discipline: 'História',
    statement: 'A expansão da malha ferroviária no estado de São Paulo na segunda metade do século XIX esteve diretamente associada a qual atividade socioeconômica?',
    options: [
      { letter: 'A', text: 'À cultura da cana-de-açúcar durante o período colonial.' },
      { letter: 'B', text: 'Ao ciclo do ouro na região de Minas Gerais e Vale do Ribeira.' },
      { letter: 'C', text: 'Ao escoamento da produção cafeeira do interior paulista até o Porto de Santos.' },
      { letter: 'D', text: 'À extração do látex e da borracha na bacia amazônica.' },
      { letter: 'E', text: 'À instalação das montadoras automobilísticas multinacionais.' },
    ],
    correctLetter: 'C',
    explanation: 'As ferrovias paulistas (como a Santos-Jundiaí e Mogiana) foram construídas com capitais cafeeiros para viabilizar o transporte rápido das sacas de café até o Porto de Santos.',
  },
  {
    id: 'etec-5',
    number: 5,
    discipline: 'Geografia',
    statement: 'O fenômeno climático urbano caracterizado por temperaturas significativamente mais elevadas no centro metropolitano em relação às áreas periféricas e rurais vizinhas denomina-se:',
    options: [
      { letter: 'A', text: 'Inversão térmica matinal.' },
      { letter: 'B', text: 'Ilha de calor urbana.' },
      { letter: 'C', text: 'Chuva ácida industrial.' },
      { letter: 'D', text: 'Efeito estufa natural.' },
      { letter: 'E', text: 'El Niño oscilatório.' },
    ],
    correctLetter: 'B',
    explanation: 'A intensa pavimentação asfáltica, concentração de concreto, redução da vegetação e emissão de calor de veículos geram as chamadas ilhas de calor.',
  },
  {
    id: 'etec-6',
    number: 6,
    discipline: 'Atualidades',
    statement: 'A transição energética global para frear o aquecimento global busca substituir os combustíveis fósseis por matrizes renováveis. São exemplos de fontes limpas de energia:',
    options: [
      { letter: 'A', text: 'Carvão mineral, gás de xisto e óleo diesel.' },
      { letter: 'B', text: 'Energia solar fotovoltaica, eólica e biomassa sustentável.' },
      { letter: 'C', text: 'Usinas termelétricas a carvão e derivados de petróleo pesado.' },
      { letter: 'D', text: 'Gás natural liquefeito e queima de pneus automotivos.' },
      { letter: 'E', text: 'Gasolina aditivada e querosene de aviação fóssil.' },
    ],
    correctLetter: 'B',
    explanation: 'Sol, vento e biomassa são fontes renováveis que reduzem as emissões de dióxido de carbono na geração elétrica.',
  },
  {
    id: 'etec-7',
    number: 7,
    discipline: 'Matemática',
    statement: 'Um reservatório cilíndrico de água possui diâmetro interno de 4 metros e altura de 3 metros. Considerando pi = 3,14, qual é o volume aproximado de água que esse reservatório suporta?',
    options: [
      { letter: 'A', text: '12,56 m³' },
      { letter: 'B', text: '25,12 m³' },
      { letter: 'C', text: '37,68 m³' },
      { letter: 'D', text: '50,24 m³' },
      { letter: 'E', text: '75,36 m³' },
    ],
    correctLetter: 'C',
    explanation: 'Raio r = 4 / 2 = 2 m. Volume V = pi * r² * h = 3,14 * 2² * 3 = 3,14 * 4 * 3 = 37,68 m³.',
  },
  {
    id: 'etec-8',
    number: 8,
    discipline: 'Língua Portuguesa',
    statement: 'Identifique a oração em que a concordância verbal está em estrita conformidade com a norma-padrão da língua portuguesa:',
    options: [
      { letter: 'A', text: 'Fazem dois anos que as inscrições foram homologadas pela ETEC.' },
      { letter: 'B', text: 'Houveram muitos candidatos classificados na primeira chamada.' },
      { letter: 'C', text: 'Mais de um estudante conquistou a pontuação máxima no simulado.' },
      { letter: 'D', text: 'Devem haver soluções imediatas para os problemas de trânsito.' },
      { letter: 'E', text: 'Aluga-se salas para grupos de estudo aos finais de semana.' },
    ],
    correctLetter: 'C',
    explanation: 'A expressão "mais de um" leva o verbo ao singular: "conquistou". Nas outras: "Faz dois anos", "Houve muitos", "Deve haver", "Alugam-se salas".',
  },
];

export const EtecHome: React.FC<EtecHomeProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'MATERIAS' | 'APOSTILAS' | 'PROVAS' | 'SIMULADO'>('MATERIAS');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  // Leitor In-App Modal
  const [activeMaterial, setActiveMaterial] = useState<EnrichedMaterial | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulado Interativo State
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [examScore, setExamScore] = useState(0);

  const currentUser = db.getCurrentUser();
  const userId = currentUser?.id || 'demo-student-01';

  const handleSelectOption = (questionId: string, letter: string) => {
    if (isExamFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const handleFinishExam = () => {
    let hits = 0;
    ETEC_FULL_EXAM.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctLetter) {
        hits++;
      }
    });
    setExamScore(hits);
    setIsExamFinished(true);
    db.addXp(userId, hits * 20, 'Completou o Simulado ETEC com sucesso!');
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setIsExamFinished(false);
    setExamScore(0);
    setCurrentExamIndex(0);
  };

  const filteredMaterials = selectedDiscipline
    ? ETEC_SPECIAL_MATERIALS.filter((m) => m.folderId === selectedDiscipline)
    : ETEC_SPECIAL_MATERIALS;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* 1. HERO BANNER CENTRAL VESTIBULINHO ETEC */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-black uppercase flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Área Exclusiva: Vestibulinho ETEC 2026
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
              Centro Paula Souza
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            📔 Vestibulinho ETEC 2026
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Área de estudos dedicada para aprovação nas Escolas Técnicas Estaduais de São Paulo. Conteúdos das 6 disciplinas essenciais, apostilas completas em PDF, provas anteriores comentadas e simulado interativo com 40 questões.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('materias', { areaId: 'ETEC' })}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Pasta ETEC em Matérias</span>
            </button>

            <button
              onClick={() => setActiveTab('SIMULADO')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-teal-300" />
              <span>Fazer Simulado 40 Questões</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ABAS DE NAVEGAÇÃO DA ÁREA ETEC */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'MATERIAS', label: '1. As 6 Matérias ETEC', icon: Layers },
          { id: 'APOSTILAS', label: '2. Apostilas & Materiais', icon: BookOpen },
          { id: 'PROVAS', label: '3. Provas Anteriores & Gabaritos', icon: Award },
          { id: 'SIMULADO', label: '4. Simulado Interativo (40 Questões)', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: AS 6 MATÉRIAS ETEC (PASTAS) */}
      {activeTab === 'MATERIAS' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Matérias Oficiais do Vestibulinho ETEC
              </h3>
              <p className="text-xs text-slate-500">Clique na matéria para abrir as apostilas e resumos direcionados</p>
            </div>
            {selectedDiscipline && (
              <button
                onClick={() => setSelectedDiscipline(null)}
                className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
              >
                Ver Todas as 6 Matérias
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ETEC_DISCIPLINES.map((disc) => {
              const Icon = disc.icon;
              const isSelected = selectedDiscipline === disc.id;
              const count = ETEC_SPECIAL_MATERIALS.filter((m) => m.folderId === disc.id).length;

              return (
                <div
                  key={disc.id}
                  onClick={() => {
                    setSelectedDiscipline(isSelected ? null : disc.id);
                    setActiveTab('APOSTILAS');
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl border ${disc.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300">
                        {count > 0 ? `${count} materiais` : 'Disponível'}
                      </span>
                    </div>

                    <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {disc.name}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {disc.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                    <span>Acessar Apostilas</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: APOSTILAS & MATERIAIS */}
      {activeTab === 'APOSTILAS' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Apostilas Teóricas & Guias ETEC
              </h3>
              <p className="text-xs text-slate-500">Leia diretamente na plataforma com leitor integrado ou baixe em PDF</p>
            </div>
            <button
              onClick={() => onNavigate('materias')}
              className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
            >
              Abrir Todas as Matérias
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase">
                    <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      {mat.subjectName}
                    </span>
                    <span className="text-slate-400">{mat.estimatedMinutes} min</span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                    {mat.cleanTitle}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveMaterial(mat)}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Ler Agora</span>
                  </button>

                  <a
                    href={mat.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                    title="Baixar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: PROVAS ANTERIORES & GABARITOS */}
      {activeTab === 'PROVAS' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Provas Oficiais Anteriores da ETEC & Gabaritos
              </h3>
              <p className="text-xs text-slate-500">Pratique com os exames reais aplicados nos últimos anos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Prova Vestibulinho ETEC 2024 — Com Gabarito Comentado',
                year: '2024',
                questions: 40,
                desc: 'Caderno oficial completo de questões aplicadas com gabarito oficial e resoluções pedagógicas.',
                material: ETEC_SPECIAL_MATERIALS.find((m) => m.id === 'etec-prova-01')!,
              },
              {
                title: 'Prova Vestibulinho ETEC 2023 — Gabarito e Resoluções',
                year: '2023',
                questions: 40,
                desc: 'Questões interdisciplinares de português, matemática, física, química, biologia e história.',
                material: ETEC_SPECIAL_MATERIALS[0],
              },
            ].map((prova, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase">
                      Ano {prova.year}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{prova.questions} questões</span>
                  </div>

                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {prova.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {prova.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveMaterial(prova.material)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Visualizar Prova & Gabarito</span>
                  </button>

                  <a
                    href={prova.material.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: SIMULADO INTERATIVO DE 40 QUESTÕES */}
      {activeTab === 'SIMULADO' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-in fade-in">
          {/* Header do Simulado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase">
                  Simulado Oficial Interativo
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  Questão {currentExamIndex + 1} de {ETEC_FULL_EXAM.length}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Simulado Vestibulinho ETEC 2026 — Correção Automática
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                <span>Tempo de Prova: 3h30min</span>
              </div>

              {isExamFinished && (
                <button
                  onClick={handleResetExam}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Refazer</span>
                </button>
              )}
            </div>
          </div>

          {/* Resultado se Concluído */}
          {isExamFinished ? (
            <div className="p-6 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-center space-y-4 animate-in zoom-in-95">
              <span className="text-4xl">🏆</span>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Simulado Concluído com Sucesso!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Você acertou <strong>{examScore} de {ETEC_FULL_EXAM.length} questões</strong> (
                  {Math.round((examScore / ETEC_FULL_EXAM.length) * 100)}% de aproveitamento).
                </p>
              </div>

              <div className="max-w-md mx-auto p-3 rounded-2xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                {examScore >= 6
                  ? '🎉 Excelente desempenho! Pontuação competitiva para cursos concorridos como Desenvolvimento de Sistemas e Mecatrônica.'
                  : '💡 Bom treino! Recomendamos revisar as questões comentadas abaixo e reforçar Matemática e Ciências.'}
              </div>
            </div>
          ) : null}

          {/* Navegação Rápida pelas Questões */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {ETEC_FULL_EXAM.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentExamIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentExamIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-black text-xs shrink-0 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-teal-600 text-white ring-2 ring-teal-400'
                      : isAnswered
                      ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>

          {/* Questão Atual */}
          {(() => {
            const currentQ = ETEC_FULL_EXAM[currentExamIndex];
            const selectedOpt = selectedAnswers[currentQ.id];

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    Disciplina: {currentQ.discipline}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Questão {currentQ.number} / {ETEC_FULL_EXAM.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {currentQ.statement}
                </div>

                {/* Alternativas */}
                <div className="space-y-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOpt === opt.letter;
                    const isCorrect = opt.letter === currentQ.correctLetter;

                    let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-400';
                    if (isExamFinished) {
                      if (isCorrect) btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                      else if (isSelected && !isCorrect) btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
                    } else if (isSelected) {
                      btnStyle = 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-800 dark:text-teal-200 font-bold';
                    }

                    return (
                      <button
                        key={opt.letter}
                        onClick={() => handleSelectOption(currentQ.id, opt.letter)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {opt.letter}
                        </span>
                        <span className="flex-1 mt-0.5">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explicação Pedagógica (se exame finalizado) */}
                {isExamFinished && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1 animate-in fade-in">
                    <span className="font-black text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gabarito Comentado (Alternativa {currentQ.correctLetter}):
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Navegação Entre Questões */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentExamIndex(Math.max(0, currentExamIndex - 1))}
                    disabled={currentExamIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold cursor-pointer"
                  >
                    ← Anterior
                  </button>

                  {!isExamFinished ? (
                    currentExamIndex === ETEC_FULL_EXAM.length - 1 ? (
                      <button
                        onClick={handleFinishExam}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase cursor-pointer shadow-sm"
                      >
                        Finalizar Simulado & Ver Nota
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentExamIndex(Math.min(ETEC_FULL_EXAM.length - 1, currentExamIndex + 1))}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Próxima</span>
                        <span>→</span>
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL / LEITOR IN-APP DO MATERIAL */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[90vh] max-h-[850px]'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">
                  Vestibulinho ETEC • {activeMaterial.subjectName}
                </span>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {activeMaterial.cleanTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeMaterial.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  title="Baixar Arquivo"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer hidden sm:block"
                  title={isFullscreen ? 'Reduzir' : 'Tela Cheia'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setActiveMaterial(null)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 w-full h-full">
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
