import { LibraryAreaId, MaterialContentType } from '../types';
import { DRIVE_MATERIALS, DriveMaterial } from './driveMaterialsData';

export interface LibraryFolderDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface LibraryAreaDef {
  id: LibraryAreaId;
  name: string;
  shortName: string;
  emoji: string;
  iconName: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  lightBg: string;
  border: string;
  description: string;
  folders: LibraryFolderDef[];
}

export const LIBRARY_AREAS: LibraryAreaDef[] = [
  {
    id: 'LINGUAGENS',
    name: 'Linguagens, Códigos e suas Tecnologias',
    shortName: 'Linguagens',
    emoji: '📘',
    iconName: 'BookOpen',
    gradient: 'from-blue-600 via-indigo-600 to-blue-800',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/60',
    description: 'Gramática, Interpretação de Texto, Literatura Brasileira, Artes, Línguas Estrangeiras e Educação Física.',
    folders: [
      { id: 'portugues', name: 'Português', icon: 'PenTool', description: 'Morfologia, sintaxe, concordância e interpretação textual', color: 'text-blue-500' },
      { id: 'literatura', name: 'Literatura', icon: 'BookMarked', description: 'Escolas literárias, do Quinhentismo ao Modernismo e Contemporâneo', color: 'text-indigo-500' },
      { id: 'ingles', name: 'Inglês', icon: 'Languages', description: 'Leitura instrumental, falsos cognatos e técnicas de skimming', color: 'text-sky-500' },
      { id: 'espanhol', name: 'Espanhol', icon: 'Globe', description: 'Interpretação e vocabulário contextualizado para vestibulares', color: 'text-amber-500' },
      { id: 'artes', name: 'Artes', icon: 'Palette', description: 'Arte clássica, vanguardas europeias e manifestações brasileiras', color: 'text-pink-500' },
      { id: 'educacao-fisica', name: 'Educação Física', icon: 'Activity', description: 'Corpo, saúde, padrões estéticos e inclusão social', color: 'text-emerald-500' },
    ],
  },
  {
    id: 'CIENCIAS_HUMANAS',
    name: 'Ciências Humanas e suas Tecnologias',
    shortName: 'Ciências Humanas',
    emoji: '📕',
    iconName: 'Compass',
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    description: 'História do Brasil e Geral, Geografia Física e Humana, Filosofia Clássica/Moderna e Sociologia.',
    folders: [
      { id: 'historia', name: 'História', icon: 'History', description: 'Brasil Colônia, Império, República, Antiguidade e Idade Contemporânea', color: 'text-amber-500' },
      { id: 'geografia', name: 'Geografia', icon: 'Globe2', description: 'Geopolítica, urbanização, agronegócio, relevo e climatologia', color: 'text-teal-500' },
      { id: 'filosofia', name: 'Filosofia', icon: 'BrainCircuit', description: 'Ética, epistemologia, política, iluminismo e existencialismo', color: 'text-orange-500' },
      { id: 'sociologia', name: 'Sociologia', icon: 'Users', description: 'Trabalho, cidadania, movimentos sociais, cultura e desigualdade', color: 'text-rose-500' },
    ],
  },
  {
    id: 'CIENCIAS_DA_NATUREZA',
    name: 'Ciências da Natureza e suas Tecnologias',
    shortName: 'Ciências da Natureza',
    emoji: '📗',
    iconName: 'Atom',
    gradient: 'from-emerald-600 via-teal-600 to-green-800',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    description: 'Biologia Celular e Ecologia, Química Geral/Orgânica e Física Mecânica/Elétrica.',
    folders: [
      { id: 'biologia', name: 'Biologia', icon: 'Dna', description: 'Ecologia, citologia, genética, evolução e fisiologia humana', color: 'text-emerald-500' },
      { id: 'quimica', name: 'Química', icon: 'FlaskConical', description: 'Estequiometria, físico-química, soluções e química orgânica', color: 'text-teal-500' },
      { id: 'fisica', name: 'Física', icon: 'Zap', description: 'Mecânica clássica, termodinâmica, óptica, ondas e eletricidade', color: 'text-cyan-500' },
    ],
  },
  {
    id: 'MATEMATICA',
    name: 'Matemática e suas Tecnologias',
    shortName: 'Matemática',
    emoji: '📙',
    iconName: 'Calculator',
    gradient: 'from-blue-600 via-cyan-600 to-sky-800',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-800/60',
    description: 'Matemática Básica, Álgebra, Geometria Plana/Espacial, Estatística e Probabilidade.',
    folders: [
      { id: 'matematica-basica', name: 'Matemática Básica', icon: 'Percent', description: 'Aritmética, frações, razão, proporção, regra de 3 e porcentagem', color: 'text-blue-500' },
      { id: 'algebra', name: 'Álgebra', icon: 'FunctionSquare', description: 'Equações, funções afim, quadrática, exponencial e logarítmica', color: 'text-indigo-500' },
      { id: 'geometria', name: 'Geometria', icon: 'Shapes', description: 'Geometria plana, espacial, analítica e trigonometria', color: 'text-cyan-500' },
      { id: 'estatistica', name: 'Estatística', icon: 'BarChart2', description: 'Média, moda, mediana, variância e interpretação de gráficos', color: 'text-teal-500' },
      { id: 'probabilidade', name: 'Probabilidade', icon: 'Dice5', description: 'Análise combinatória, permutações e probabilidade condicional', color: 'text-amber-500' },
    ],
  },
  {
    id: 'REDACAO',
    name: 'Redação Nota 1000',
    shortName: 'Redação',
    emoji: '📒',
    iconName: 'PenTool',
    gradient: 'from-purple-600 via-pink-600 to-rose-800',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    lightBg: 'bg-purple-50/70 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/60',
    description: 'Estrutura oficial do ENEM, Repertórios Socioculturais, Modelos Nota 1000 e Proposta de Intervenção.',
    folders: [
      { id: 'estrutura-redacao', name: 'Estrutura da Redação ENEM', icon: 'FileCode2', description: 'Introdução, desenvolvimento argumentativo e conclusão padrão ENEM', color: 'text-purple-500' },
      { id: 'modelos-nota-1000', name: 'Modelos de Redação Nota 1000', icon: 'Award', description: 'Cartilhas completas com textos reais comentados nota máxima', color: 'text-pink-500' },
      { id: 'repertorios', name: 'Repertórios', icon: 'Library', description: 'Citações de filósofos, sociólogos, dados estatísticos e história', color: 'text-rose-500' },
      { id: 'temas-atuais', name: 'Temas Atuais', icon: 'Sparkles', description: 'Eixos temáticos quentes: tecnologia, saúde, meio ambiente e educação', color: 'text-amber-500' },
      { id: 'competencias-enem', name: 'Competências ENEM', icon: 'CheckCircle2', description: 'Critérios detalhados das 5 competências avaliadas pelos corretores', color: 'text-emerald-500' },
    ],
  },
  {
    id: 'ETEC',
    name: 'Vestibulinho ETEC',
    shortName: 'Vestibulinho ETEC',
    emoji: '📔',
    iconName: 'GraduationCap',
    gradient: 'from-teal-600 via-emerald-700 to-slate-900',
    badgeBg: 'bg-teal-600',
    badgeText: 'text-white',
    lightBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800/60',
    description: 'Preparação completa para o Centro Paula Souza: 6 matérias essenciais, provas anteriores e simulados comentados.',
    folders: [
      { id: 'etec-portugues', name: 'Português', icon: 'PenTool', description: 'Charges, tirinhas, leitura crítica, tipologia e coesão textual', color: 'text-teal-500' },
      { id: 'etec-matematica', name: 'Matemática', icon: 'Calculator', description: 'Geometria básica, regra de 3, porcentagem e gráficos', color: 'text-blue-500' },
      { id: 'etec-ciencias', name: 'Ciências', icon: 'Atom', description: 'Corpo humano, meio ambiente, energia e reações no cotidiano', color: 'text-emerald-500' },
      { id: 'etec-historia', name: 'História', icon: 'Compass', description: 'História de São Paulo, Brasil Contemporâneo e transformações sociais', color: 'text-amber-500' },
      { id: 'etec-geografia', name: 'Geografia', icon: 'Globe', description: 'Industrialização paulista, biomas brasileiros e cartografia', color: 'text-sky-500' },
      { id: 'etec-atualidades', name: 'Atualidades', icon: 'Sparkles', description: 'Meio ambiente, sustentabilidade e inovações científicas', color: 'text-purple-500' },
    ],
  },
];

export interface EnrichedMaterial extends DriveMaterial {
  areaId: LibraryAreaId;
  folderId: string;
  contentType: MaterialContentType;
  estimatedMinutes: number;
  description: string;
  cleanTitle: string;
}

// Classificador inteligente dos 428 materiais do Drive
export function classifyMaterial(m: DriveMaterial): EnrichedMaterial {
  const normTitle = m.title.toLowerCase();
  const normFile = m.fileName.toLowerCase();
  const normCat = (m.category || '').toLowerCase();
  const combined = `${normTitle} ${normFile} ${normCat}`;

  // 1. Determinar ContentType
  let contentType: MaterialContentType = 'APOSTILA';
  if (normFile.endsWith('.jpg') || normFile.endsWith('.png') || normFile.endsWith('.jpeg') || combined.includes('mapa mental')) {
    contentType = 'MAPA_MENTAL';
  } else if (normFile.endsWith('.mp3') || combined.includes('audio') || combined.includes('áudio') || m.type === 'AUDIO') {
    contentType = 'AUDIO';
  } else if (combined.includes('exercicio') || combined.includes('exercício') || combined.includes('lista') || combined.includes('questoes') || combined.includes('questões')) {
    contentType = 'EXERCICIO';
  } else if (combined.includes('simulado') || combined.includes('gabarito') || combined.includes('prova anterior') || normCat.includes('provas anteriores')) {
    contentType = 'SIMULADO';
  } else if (combined.includes('resumo') || combined.includes('aquecimento') || combined.includes('revisão') || combined.includes('dossiê') || combined.includes('esquema')) {
    contentType = 'RESUMO';
  }

  // 2. Determinar Área e Pasta
  let areaId: LibraryAreaId = 'LINGUAGENS';
  let folderId = 'portugues';

  if (normCat === 'artes' || combined.includes('artes')) {
    areaId = 'LINGUAGENS';
    folderId = 'artes';
  } else if (normCat === 'educação física' || combined.includes('educação física') || combined.includes('ed fisica')) {
    areaId = 'LINGUAGENS';
    folderId = 'educacao-fisica';
  } else if (normCat === 'espanhol' || combined.includes('espanhol')) {
    areaId = 'LINGUAGENS';
    folderId = 'espanhol';
  } else if (normCat === 'inglês' || combined.includes('inglês') || combined.includes('ingles')) {
    areaId = 'LINGUAGENS';
    folderId = 'ingles';
  } else if (normCat === 'literatura' || combined.includes('literatura') || combined.includes('poesia') || combined.includes('modernismo')) {
    areaId = 'LINGUAGENS';
    folderId = 'literatura';
  } else if (normCat === 'língua portuguesa' || combined.includes('portugues') || combined.includes('português') || combined.includes('gramática') || combined.includes('coesão')) {
    areaId = 'LINGUAGENS';
    folderId = 'portugues';
  } else if (normCat === 'história' || combined.includes('historia') || combined.includes('história') || combined.includes('vargas') || combined.includes('ditadura')) {
    areaId = 'CIENCIAS_HUMANAS';
    folderId = 'historia';
  } else if (normCat === 'geografia' || combined.includes('geografia') || combined.includes('relevo') || combined.includes('clima') || combined.includes('urbanização')) {
    areaId = 'CIENCIAS_HUMANAS';
    folderId = 'geografia';
  } else if (normCat === 'filosofia' || combined.includes('filosofia') || combined.includes('ética') || combined.includes('platao') || combined.includes('kant')) {
    areaId = 'CIENCIAS_HUMANAS';
    folderId = 'filosofia';
  } else if (normCat === 'sociologia' || combined.includes('sociologia') || combined.includes('marx') || combined.includes('durkheim') || combined.includes('weber')) {
    areaId = 'CIENCIAS_HUMANAS';
    folderId = 'sociologia';
  } else if (normCat === 'biologia' || combined.includes('biologia') || combined.includes('ecologia') || combined.includes('botanica') || combined.includes('genetica')) {
    areaId = 'CIENCIAS_DA_NATUREZA';
    folderId = 'biologia';
  } else if (normCat === 'química' || normCat === 'quimica' || combined.includes('quimica') || combined.includes('química') || combined.includes('termoquimica') || combined.includes('organica')) {
    areaId = 'CIENCIAS_DA_NATUREZA';
    folderId = 'quimica';
  } else if (normCat === 'física' || normCat === 'fisica' || combined.includes('fisica') || combined.includes('física') || combined.includes('mecanica') || combined.includes('eletricidade')) {
    areaId = 'CIENCIAS_DA_NATUREZA';
    folderId = 'fisica';
  } else if (normCat === 'matemática' || normCat === 'matematica' || combined.includes('matematica') || combined.includes('matemática')) {
    areaId = 'MATEMATICA';
    if (combined.includes('geometria') || combined.includes('trigonometria')) {
      folderId = 'geometria';
    } else if (combined.includes('algebra') || combined.includes('álgebra') || combined.includes('funcao') || combined.includes('funções') || combined.includes('progressao') || combined.includes('progressoes')) {
      folderId = 'algebra';
    } else if (combined.includes('estatistica') || combined.includes('estatstica') || combined.includes('media') || combined.includes('mediana')) {
      folderId = 'estatistica';
    } else if (combined.includes('probabilidade') || combined.includes('contagem') || combined.includes('combinatoria')) {
      folderId = 'probabilidade';
    } else {
      folderId = 'matematica-basica';
    }
  } else if (normCat === 'redação' || normCat === 'redacao' || combined.includes('redação') || combined.includes('redacao')) {
    areaId = 'REDACAO';
    if (combined.includes('1000') || combined.includes('1.000') || combined.includes('nota mil') || combined.includes('lucas felpi') || combined.includes('cartilha')) {
      folderId = 'modelos-nota-1000';
    } else if (combined.includes('c1') || combined.includes('c2') || combined.includes('c3') || combined.includes('c4') || combined.includes('c5') || combined.includes('competencia') || combined.includes('conclusao')) {
      folderId = 'competencias-enem';
    } else if (combined.includes('repertorio') || combined.includes('repertório') || combined.includes('aspectos')) {
      folderId = 'repertorios';
    } else if (combined.includes('tema') || combined.includes('desafio') || combined.includes('eixo')) {
      folderId = 'temas-atuais';
    } else {
      folderId = 'estrutura-redacao';
    }
  } else if (normCat.includes('etec') || combined.includes('etec') || combined.includes('vestibulinho')) {
    areaId = 'ETEC';
    if (combined.includes('matematica') || combined.includes('matemática')) folderId = 'etec-matematica';
    else if (combined.includes('ciencias') || combined.includes('ciências') || combined.includes('biologia')) folderId = 'etec-ciencias';
    else if (combined.includes('historia') || combined.includes('história')) folderId = 'etec-historia';
    else if (combined.includes('geografia')) folderId = 'etec-geografia';
    else if (combined.includes('atualidade')) folderId = 'etec-atualidades';
    else folderId = 'etec-portugues';
  } else if (normCat.includes('atualidades')) {
    areaId = 'ETEC';
    folderId = 'etec-atualidades';
  } else if (normCat.includes('gep') || normCat.includes('guia')) {
    if (combined.includes('natureza')) {
      areaId = 'CIENCIAS_DA_NATUREZA';
      folderId = 'biologia';
    } else if (combined.includes('humanas')) {
      areaId = 'CIENCIAS_HUMANAS';
      folderId = 'historia';
    } else if (combined.includes('linguagens')) {
      areaId = 'LINGUAGENS';
      folderId = 'portugues';
    } else {
      areaId = 'REDACAO';
      folderId = 'estrutura-redacao';
    }
  }

  // Limpeza do título para exibição elegante
  let cleanTitle = m.title
    .replace(/^Apostila[-_]/i, '')
    .replace(/^Biologia[-_]ENEM[-_]/i, 'Biologia: ')
    .replace(/^Matematica[-_]ENEM[-_]/i, 'Matemática: ')
    .replace(/^extensivo\s*enem\s*[-_]?/i, '')
    .replace(/^préenem[-_]?/i, '')
    .replace(/[-_][0-9a-f]{32}$/i, '')
    .replace(/[-_]\d{2}-\d{2}-\d{4}/g, '')
    .replace(/\.pdf$/i, '')
    .replace(/\+/g, ' ')
    .trim();

  if (!cleanTitle) cleanTitle = m.fileName;

  // Tempo estimado de estudo baseado no tipo
  let estimatedMinutes = 30;
  if (contentType === 'MAPA_MENTAL') estimatedMinutes = 15;
  else if (contentType === 'RESUMO') estimatedMinutes = 20;
  else if (contentType === 'EXERCICIO') estimatedMinutes = 45;
  else if (contentType === 'SIMULADO') estimatedMinutes = 60;
  else estimatedMinutes = 35;

  const description = `Material didático estruturado de ${m.subjectName || m.category} com conceitos fundamentais, teoria aprofundada e aplicações para vestibulares e ENEM 2026.`;

  return {
    ...m,
    areaId,
    folderId,
    contentType,
    estimatedMinutes,
    description,
    cleanTitle,
  };
}

// Materiais adicionais dedicados para enriquecer a pasta do Vestibulinho ETEC
export const ETEC_SPECIAL_MATERIALS: EnrichedMaterial[] = [
  {
    id: 'etec-mat-01',
    title: 'Apostila Oficial de Matemática — Vestibulinho ETEC 2026',
    cleanTitle: 'Apostila Oficial de Matemática — ETEC 2026',
    fileName: 'Apostila_ETEC_Matematica_2026.pdf',
    category: 'ETEC',
    subjectName: 'Matemática',
    subfolder: 'Matemática',
    mimeType: 'application/pdf',
    size: '4.2 MB',
    googleDriveId: '1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn',
    driveUrl: 'https://drive.google.com/file/d/1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-matematica',
    contentType: 'APOSTILA',
    estimatedMinutes: 40,
    description: 'Resolução passo a passo de geometria plana, razão, proporção, porcentagem e situações-problema típicas da ETEC.',
  },
  {
    id: 'etec-port-01',
    title: 'Guia de Interpretação de Textos, Charges e Linguagem ETEC',
    cleanTitle: 'Guia de Interpretação e Linguagem — ETEC',
    fileName: 'Guia_ETEC_Portugues.pdf',
    category: 'ETEC',
    subjectName: 'Português',
    subfolder: 'Português',
    mimeType: 'application/pdf',
    size: '3.8 MB',
    googleDriveId: '1JJ_HpFL0hKZTLGNonPPtmMJ9K_5h-Oeo',
    driveUrl: 'https://drive.google.com/file/d/1JJ_HpFL0hKZTLGNonPPtmMJ9K_5h-Oeo/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/1JJ_HpFL0hKZTLGNonPPtmMJ9K_5h-Oeo/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1JJ_HpFL0hKZTLGNonPPtmMJ9K_5h-Oeo',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-portugues',
    contentType: 'APOSTILA',
    estimatedMinutes: 35,
    description: 'Análise de textos narrativos, informativos, tirinhas, charges e recursos de coesão exigidos pelo Centro Paula Souza.',
  },
  {
    id: 'etec-cien-01',
    title: 'Caderno de Ciências da Natureza Integradas — ETEC',
    cleanTitle: 'Caderno de Ciências Integradas — ETEC',
    fileName: 'Ciencias_Integradas_ETEC.pdf',
    category: 'ETEC',
    subjectName: 'Ciências',
    subfolder: 'Ciências',
    mimeType: 'application/pdf',
    size: '5.1 MB',
    googleDriveId: '16JRUMr5n6NinIMlgFmO1mqJ-APkFddYM',
    driveUrl: 'https://drive.google.com/file/d/16JRUMr5n6NinIMlgFmO1mqJ-APkFddYM/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/16JRUMr5n6NinIMlgFmO1mqJ-APkFddYM/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=16JRUMr5n6NinIMlgFmO1mqJ-APkFddYM',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-ciencias',
    contentType: 'APOSTILA',
    estimatedMinutes: 45,
    description: 'Conceitos de ecologia, saúde, corpo humano, química cotidiana e física dos movimentos.',
  },
  {
    id: 'etec-hist-01',
    title: 'História do Brasil & Transformações Paulistas — ETEC',
    cleanTitle: 'História do Brasil e de SP — ETEC',
    fileName: 'Historia_ETEC.pdf',
    category: 'ETEC',
    subjectName: 'História',
    subfolder: 'História',
    mimeType: 'application/pdf',
    size: '3.2 MB',
    googleDriveId: '1HsvqiOk5S-EVxNYYPMcL3XEUAksC38rH',
    driveUrl: 'https://drive.google.com/file/d/1HsvqiOk5S-EVxNYYPMcL3XEUAksC38rH/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/1HsvqiOk5S-EVxNYYPMcL3XEUAksC38rH/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1HsvqiOk5S-EVxNYYPMcL3XEUAksC38rH',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-historia',
    contentType: 'RESUMO',
    estimatedMinutes: 30,
    description: 'Ciclo do café, imigração, industrialização e movimentos populares com foco no Vestibulinho.',
  },
  {
    id: 'etec-geo-01',
    title: 'Geografia do Estado de São Paulo e Brasil — ETEC',
    cleanTitle: 'Geografia Paulista e Brasileira — ETEC',
    fileName: 'Geografia_ETEC.pdf',
    category: 'ETEC',
    subjectName: 'Geografia',
    subfolder: 'Geografia',
    mimeType: 'application/pdf',
    size: '4.0 MB',
    googleDriveId: '150Uj64fkESDV3mU5Joy2_eziUQBkqmqJ',
    driveUrl: 'https://drive.google.com/file/d/150Uj64fkESDV3mU5Joy2_eziUQBkqmqJ/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/150Uj64fkESDV3mU5Joy2_eziUQBkqmqJ/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=150Uj64fkESDV3mU5Joy2_eziUQBkqmqJ',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-geografia',
    contentType: 'APOSTILA',
    estimatedMinutes: 35,
    description: 'Cartografia, macrometrópole paulista, clima, bacias hidrográficas e urbanização.',
  },
  {
    id: 'etec-atua-01',
    title: 'Guia de Atualidades & Meio Ambiente para a ETEC 2026',
    cleanTitle: 'Atualidades e Meio Ambiente — ETEC 2026',
    fileName: 'Atualidades_ETEC_2026.pdf',
    category: 'ETEC',
    subjectName: 'Atualidades',
    subfolder: 'Atualidades',
    mimeType: 'application/pdf',
    size: '2.9 MB',
    googleDriveId: '1IR3ZXDEp-kkxA8GyTmnrzft14I_Cc610',
    driveUrl: 'https://drive.google.com/file/d/1IR3ZXDEp-kkxA8GyTmnrzft14I_Cc610/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/1IR3ZXDEp-kkxA8GyTmnrzft14I_Cc610/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1IR3ZXDEp-kkxA8GyTmnrzft14I_Cc610',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-atualidades',
    contentType: 'RESUMO',
    estimatedMinutes: 25,
    description: 'Transição energética, inteligência artificial, conferências climáticas e cidadania.',
  },
  {
    id: 'etec-prova-01',
    title: 'Prova Oficial Vestibulinho ETEC 2024 — Com Gabarito Comentado',
    cleanTitle: 'Prova ETEC 2024 + Gabarito Comentado',
    fileName: 'Prova_ETEC_2024_Comentada.pdf',
    category: 'ETEC',
    subjectName: 'Provas Anteriores',
    subfolder: 'Provas',
    mimeType: 'application/pdf',
    size: '6.5 MB',
    googleDriveId: '1qdWA5u9NnuHkoB3MXJbJWwYoqYfvk0WH',
    driveUrl: 'https://drive.google.com/file/d/1qdWA5u9NnuHkoB3MXJbJWwYoqYfvk0WH/view?usp=sharing',
    embedUrl: 'https://drive.google.com/file/d/1qdWA5u9NnuHkoB3MXJbJWwYoqYfvk0WH/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qdWA5u9NnuHkoB3MXJbJWwYoqYfvk0WH',
    type: 'PDF',
    areaId: 'ETEC',
    folderId: 'etec-matematica',
    contentType: 'SIMULADO',
    estimatedMinutes: 60,
    description: 'As 40 questões integrais da prova com resolução comentada questão por questão.',
  },
];

// Carregador de todos os materiais (Drive + ETEC)
export function getAllEnrichedMaterials(): EnrichedMaterial[] {
  const driveEnriched = DRIVE_MATERIALS.map(classifyMaterial);
  return [...driveEnriched, ...ETEC_SPECIAL_MATERIALS];
}

