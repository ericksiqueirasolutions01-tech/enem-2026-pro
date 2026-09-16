import React, { useState } from 'react';
import { db } from '../../db/storage';
import { AreaDoConhecimento, Disciplina } from '../../types';
import {
  BookOpen,
  Calculator,
  Compass,
  Atom,
  PenTool,
  CheckCircle2,
  PlayCircle,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AreaEstudosProps {
  onNavigate: (route: string, params?: any) => void;
}

interface TopicInfo {
  name: string;
  discipline: Disciplina;
  incidence: 'MUITO_ALTA' | 'ALTA' | 'MEDIA';
  description: string;
  approxQuestions: number;
}

const AREAS_DATA: {
  id: AreaDoConhecimento;
  title: string;
  subtitle: string;
  color: string;
  borderHover: string;
  badgeBg: string;
  icon: any;
  disciplines: { name: Disciplina; topics: TopicInfo[] }[];
}[] = [
  {
    id: 'MATEMATICA',
    title: 'Matemática e suas Tecnologias',
    subtitle: '45 questões • Peso determinante em muitos cursos',
    color: 'from-blue-600 to-indigo-600',
    borderHover: 'hover:border-blue-400 dark:hover:border-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: Calculator,
    disciplines: [
      {
        name: 'Matemática',
        topics: [
          {
            name: 'Funções e Álgebra',
            discipline: 'Matemática',
            incidence: 'MUITO_ALTA',
            description: 'Funções afim, quadrática, exponencial e análise gráfica',
            approxQuestions: 12,
          },
          {
            name: 'Geometria Espacial e Plana',
            discipline: 'Matemática',
            incidence: 'MUITO_ALTA',
            description: 'Áreas, volumes de prismas, cilindros, cones e esferas',
            approxQuestions: 10,
          },
          {
            name: 'Estatística e Probabilidade',
            discipline: 'Matemática',
            incidence: 'ALTA',
            description: 'Média, mediana, moda, desvio padrão e chances',
            approxQuestions: 8,
          },
          {
            name: 'Razão, Proporção e Porcentagem',
            discipline: 'Matemática',
            incidence: 'MUITO_ALTA',
            description: 'Regra de três, escala cartográfica, acréscimos e descontos',
            approxQuestions: 14,
          },
        ],
      },
    ],
  },
  {
    id: 'CIENCIAS_DA_NATUREZA',
    title: 'Ciências da Natureza',
    subtitle: 'Biologia, Física e Química com foco prático e ambiental',
    color: 'from-emerald-600 to-teal-600',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: Atom,
    disciplines: [
      {
        name: 'Biologia',
        topics: [
          {
            name: 'Ecologia e Meio Ambiente',
            discipline: 'Biologia',
            incidence: 'MUITO_ALTA',
            description: 'Cadeias tróficas, poluição, ciclos biogeoquímicos e biomas',
            approxQuestions: 10,
          },
          {
            name: 'Genética e Biologia Molecular',
            discipline: 'Biologia',
            incidence: 'ALTA',
            description: 'Transgênicos, CRISPR, herança monogênica e síntese proteica',
            approxQuestions: 6,
          },
          {
            name: 'Citologia e Fisiologia Humana',
            discipline: 'Biologia',
            incidence: 'ALTA',
            description: 'Respiração celular, membrana plasmática e imunologia',
            approxQuestions: 6,
          },
        ],
      },
      {
        name: 'Física',
        topics: [
          {
            name: 'Eletrodinâmica e Circuitos',
            discipline: 'Física',
            incidence: 'MUITO_ALTA',
            description: 'Leis de Ohm, potência elétrica, consumo de energia e circuitos mistos',
            approxQuestions: 7,
          },
          {
            name: 'Ondulatória e Acústica',
            discipline: 'Física',
            incidence: 'ALTA',
            description: 'Fenômenos ondulatórios, efeito Doppler e equação fundamental',
            approxQuestions: 5,
          },
          {
            name: 'Termologia e Calorimetria',
            discipline: 'Física',
            incidence: 'ALTA',
            description: 'Propagação de calor, trocas térmicas e dilatação',
            approxQuestions: 4,
          },
        ],
      },
      {
        name: 'Química',
        topics: [
          {
            name: 'Química Orgânica',
            discipline: 'Química',
            incidence: 'MUITO_ALTA',
            description: 'Funções orgânicas, isomeria e reações nos combustíveis',
            approxQuestions: 7,
          },
          {
            name: 'Estequiometria e Soluções',
            discipline: 'Química',
            incidence: 'MUITO_ALTA',
            description: 'Cálculo estequiométrico, rendimento, pureza e concentração molar',
            approxQuestions: 6,
          },
          {
            name: 'Termoquímica e Eletroquímica',
            discipline: 'Química',
            incidence: 'ALTA',
            description: 'Lei de Hess, entalpia, pilhas de Daniell e eletrólise',
            approxQuestions: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'CIENCIAS_HUMANAS',
    title: 'Ciências Humanas e suas Tecnologias',
    subtitle: 'História, Geografia, Filosofia e Sociologia conectadas à cidadania',
    color: 'from-amber-600 to-orange-600',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: Compass,
    disciplines: [
      {
        name: 'História',
        topics: [
          {
            name: 'Brasil República e Era Vargas',
            discipline: 'História',
            incidence: 'MUITO_ALTA',
            description: 'Direitos trabalhistas, Ditadura Militar e redemocratização',
            approxQuestions: 8,
          },
          {
            name: 'Brasil Colônia e Império',
            discipline: 'História',
            incidence: 'ALTA',
            description: 'Escravidão, economia açucareira e café',
            approxQuestions: 6,
          },
        ],
      },
      {
        name: 'Geografia',
        topics: [
          {
            name: 'Geografia Urbana e Agrária',
            discipline: 'Geografia',
            incidence: 'MUITO_ALTA',
            description: 'Urbanização excludente, agronegócio e impactos territoriais',
            approxQuestions: 7,
          },
          {
            name: 'Globalização e Geopolítica',
            discipline: 'Geografia',
            incidence: 'ALTA',
            description: 'Blocos econômicos, migrações e conflitos contemporâneos',
            approxQuestions: 6,
          },
        ],
      },
      {
        name: 'Filosofia',
        topics: [
          {
            name: 'Ética, Política e Cidadania',
            discipline: 'Filosofia',
            incidence: 'ALTA',
            description: 'Aristóteles, contratualistas, Iluminismo e Foucault',
            approxQuestions: 5,
          },
        ],
      },
      {
        name: 'Sociologia',
        topics: [
          {
            name: 'Mundo do Trabalho e Desigualdade',
            discipline: 'Sociologia',
            incidence: 'MUITO_ALTA',
            description: 'Marx, Weber, Durkheim e novas relações de trabalho precarizado',
            approxQuestions: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'LINGUAGENS',
    title: 'Linguagens, Códigos e suas Tecnologias',
    subtitle: 'Interpretação textual crítica, literatura, artes e língua estrangeira',
    color: 'from-rose-600 to-pink-600',
    borderHover: 'hover:border-rose-400 dark:hover:border-rose-500',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    icon: BookOpen,
    disciplines: [
      {
        name: 'Português',
        topics: [
          {
            name: 'Funções da Linguagem e Gêneros',
            discipline: 'Português',
            incidence: 'MUITO_ALTA',
            description: 'Emotiva, referencial, fática, conativa e metalinguística',
            approxQuestions: 14,
          },
          {
            name: 'Variação Linguística e Norma Culta',
            discipline: 'Português',
            incidence: 'MUITO_ALTA',
            description: 'Preconceito linguístico, registros formais e coloquiais',
            approxQuestions: 10,
          },
        ],
      },
      {
        name: 'Literatura',
        topics: [
          {
            name: 'Modernismo Brasileiro',
            discipline: 'Literatura',
            incidence: 'MUITO_ALTA',
            description: 'Semana de 22, Geração de 30 (Drummond, Graciliano Ramos) e Clarice Lispector',
            approxQuestions: 8,
          },
          {
            name: 'Realismo e Naturalismo',
            discipline: 'Literatura',
            incidence: 'ALTA',
            description: 'Machado de Assis e Aluísio Azevedo',
            approxQuestions: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'REDACAO',
    title: 'Redação Nota 1000',
    subtitle: 'Estrutura dissertativo-argumentativa e as 5 competências oficiais do ENEM',
    color: 'from-purple-600 to-indigo-600',
    borderHover: 'hover:border-purple-400 dark:hover:border-purple-500',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    icon: PenTool,
    disciplines: [
      {
        name: 'Redação',
        topics: [
          {
            name: 'Competência 1: Norma Culta',
            discipline: 'Redação',
            incidence: 'MUITO_ALTA',
            description: 'Concordância, regência, pontuação e crase',
            approxQuestions: 0,
          },
          {
            name: 'Competência 2 & 3: Tese e Repertório',
            discipline: 'Redação',
            incidence: 'MUITO_ALTA',
            description: 'Uso produtivo de sociologia, filosofia, história e dados',
            approxQuestions: 0,
          },
          {
            name: 'Competência 4: Coesão Inter e Intraparágrafos',
            discipline: 'Redação',
            incidence: 'MUITO_ALTA',
            description: 'Operadores argumentativos e conectivos sofisticados',
            approxQuestions: 0,
          },
          {
            name: 'Competência 5: Proposta de Intervenção Completa',
            discipline: 'Redação',
            incidence: 'MUITO_ALTA',
            description: 'Os 5 elementos obrigatórios: Agente, Ação, Meio/Modo, Efeito e Detalhamento',
            approxQuestions: 0,
          },
        ],
      },
    ],
  },
];

export const AreaEstudos: React.FC<AreaEstudosProps> = ({ onNavigate }) => {
  const [selectedArea, setSelectedArea] = useState<AreaDoConhecimento>('MATEMATICA');
  const allQuestions = db.getQuestions();

  const activeArea = AREAS_DATA.find((a) => a.id === selectedArea) || AREAS_DATA[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Matriz de Referência ENEM 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Estudar por Áreas do Conhecimento
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Navegue pelas 4 áreas e Redação, descubra os temas de maior incidência histórica no ENEM e treine com precisão cirúrgica.
        </p>
      </div>

      {/* Area Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {AREAS_DATA.map((area) => {
          const Icon = area.icon;
          const isSelected = area.id === selectedArea;

          return (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 bg-gradient-to-br ${area.color} text-white shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                {area.id === 'CIENCIAS_HUMANAS'
                  ? 'Humanas'
                  : area.id === 'CIENCIAS_DA_NATUREZA'
                  ? 'Natureza'
                  : area.id === 'MATEMATICA'
                  ? 'Matemática'
                  : area.id === 'LINGUAGENS'
                  ? 'Linguagens'
                  : 'Redação'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {area.disciplines.length} {area.disciplines.length === 1 ? 'matéria' : 'matérias'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Area Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${activeArea.color} text-white shadow-md shrink-0`}
            >
              <activeArea.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {activeArea.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeArea.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeArea.id === 'REDACAO' ? (
              <button
                onClick={() => onNavigate('redacao')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Ir para Redação & IA</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('questoes')}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Praticar Questões da Área</span>
              </button>
            )}
          </div>
        </div>

        {/* Disciplines & Topics */}
        <div className="mt-6 space-y-8">
          {activeArea.disciplines.map((discipline) => (
            <div key={discipline.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {discipline.name}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {discipline.topics.length} temas principais catalogados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {discipline.topics.map((topic, idx) => {
                  const areaQuestionsCount = allQuestions.filter(
                    (q) => q.discipline === discipline.name
                  ).length;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {topic.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              topic.incidence === 'MUITO_ALTA'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}
                          >
                            {topic.incidence === 'MUITO_ALTA' ? '🔥 Muito Recorrente' : '⚡ Alta Recorrência'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {topic.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span>~{topic.approxQuestions} questões/prova</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('pomodoro', { discipline: discipline.name, topic: topic.name })}
                            title="Estudar com Pomodoro"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {activeArea.id === 'REDACAO' ? (
                            <button
                              onClick={() => onNavigate('redacao')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Escrever</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigate('questoes')}
                              className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Praticar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

