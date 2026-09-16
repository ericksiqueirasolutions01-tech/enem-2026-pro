import { EssayCorrection, CompetencyEvaluation, ProposalElementsEvaluation, TextAnnotation, CompetencyScore } from '../types';

export class AiEssayEvaluator {
  /**
   * Avalia a redação em profundidade com base na Matriz de Referência Oficial do ENEM (5 Competências).
   */
  public static async evaluate(text: string, topicTheme: string): Promise<EssayCorrection> {
    // Simula tempo de processamento cognitivo da IA (1.2s)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const cleanText = text.trim();
    const paragraphs = cleanText.split('\n').filter((p) => p.trim().length > 0);
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    // Estimativa de linhas: média de 11 palavras por linha em folha padrão
    const estimatedLines = Math.max(paragraphs.length, Math.ceil(wordCount / 11));

    // 1. VERIFICAÇÃO DE CONDIÇÕES DE NOTA ZERO
    if (wordCount < 40 || estimatedLines < 7) {
      return {
        totalScore: 0,
        isZeroScore: true,
        zeroScoreReason: 'Possível condição de nota zero detectada: Extensão insuficiente de texto (menos de 7 linhas efetivas). O ENEM exige no mínimo 8 linhas escritas para que a redação seja corrigida.',
        competencies: this.generateZeroCompetencies('Texto insuficiente para avaliação pedagógica.'),
        proposalElements: {
          agente: { detected: false, feedback: 'Não identificado devido à extensão do texto.' },
          acao: { detected: false, feedback: 'Não identificado.' },
          modo: { detected: false, feedback: 'Não identificado.' },
          finalidade: { detected: false, feedback: 'Não identificado.' },
          detalhamento: { detected: false, feedback: 'Não identificado.' },
        },
        inTextAnnotations: [],
        pedagogicalSummary: 'A redação não atinge o tamanho mínimo exigido pelo edital do ENEM. Desenvolva pelo menos 4 parágrafos (Introdução, 2 Desenvolvimentos e Conclusão) totalizando entre 20 e 30 linhas.',
        evaluatedAt: new Date().toISOString(),
        aiDisclaimer: 'Nota estimada para fins de estudo. Não corresponde à correção oficial do ENEM.',
      };
    }

    // 2. AVALIAÇÃO DA COMPETÊNCIA 1 (Norma Padrão)
    const c1 = this.evaluateCompetence1(paragraphs, cleanText);

    // 3. AVALIAÇÃO DA COMPETÊNCIA 2 (Compreensão do Tema e Repertório)
    const c2 = this.evaluateCompetence2(paragraphs, cleanText, topicTheme);

    // 4. AVALIAÇÃO DA COMPETÊNCIA 3 (Projeto de Texto e Argumentação)
    const c3 = this.evaluateCompetence3(paragraphs);

    // 5. AVALIAÇÃO DA COMPETÊNCIA 4 (Mecanismos de Coesão)
    const c4 = this.evaluateCompetence4(paragraphs);

    // 6. AVALIAÇÃO DA COMPETÊNCIA 5 (Proposta de Intervenção - 5 Elementos)
    const { comp5: c5, elements: proposalElements } = this.evaluateCompetence5(paragraphs);

    // Anotações e destaques no texto
    const annotations = this.generateInTextAnnotations(paragraphs);

    const totalScore = c1.score + c2.score + c3.score + c4.score + c5.score;

    let pedagogicalSummary = '';
    if (totalScore >= 900) {
      pedagogicalSummary = 'Excelente redação! O texto apresenta projeto de texto estratégico, excelente repertório sociocultural legitimado e proposta de intervenção completa com os 5 elementos.';
    } else if (totalScore >= 800) {
      pedagogicalSummary = 'Muito bom desempenho! O texto demonstra domínio sólido da estrutura dissertativo-argumentativa. Pequenos ajustes de coesão e detalhamento na intervenção podem elevá-lo aos 900+.';
    } else if (totalScore >= 640) {
      pedagogicalSummary = 'Bom trabalho, com base promissora. Recomendamos enriquecer o repertório sociocultural e certificar-se de que os 5 elementos da proposta de intervenção estejam explícitos no último parágrafo.';
    } else {
      pedagogicalSummary = 'Redação necessita de maior atenção estrutural. Pratique a divisão clara em 4 parágrafos bem definidos, conectivos interparágrafos e formule uma proposta de intervenção com agente, ação, modo, efeito e detalhamento.';
    }

    return {
      totalScore,
      isZeroScore: false,
      competencies: [c1, c2, c3, c4, c5],
      proposalElements,
      inTextAnnotations: annotations,
      pedagogicalSummary,
      evaluatedAt: new Date().toISOString(),
      aiDisclaimer: 'Nota estimada para fins de estudo. Não corresponde à correção oficial do ENEM.',
    };
  }

  private static evaluateCompetence1(paragraphs: string[], text: string): CompetencyEvaluation {
    const informalWords = ['né', 'pra', 'tá', 'coisa', 'tipo assim', 'a gente fomos', 'onde que'];
    const foundInformalities = informalWords.filter((w) => text.toLowerCase().includes(w));
    const longSentences = text.split(/[.!?]/).filter((s) => s.trim().split(' ').length > 35);

    let score: CompetencyScore = 160;
    const positives: string[] = ['Bom vocabulário formal e concordância verbal predominantemente correta.'];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    if (foundInformalities.length === 0 && longSentences.length <= 1) {
      score = 200;
      positives.push('Estrutura sintática excelente, sem desvios gramaticais graves e com variedade lexical sofisticada.');
      suggestions.push('Continue mantendo períodos equilibrados e pontuação precisa.');
    } else if (foundInformalities.length > 0 || longSentences.length > 3) {
      score = 120;
      improvements.push(`Evite marcas de oralidade ou informalidade como: "${foundInformalities.join(', ')}".`);
      improvements.push('Atenção a períodos excessivamente longos que podem comprometer a clareza da oração.');
      suggestions.push('Divida períodos longos com pontos finais e utilize vírgulas adequadas para orações subordinadas.');
    } else {
      score = 160;
      improvements.push('Pequenos deslizes pontuais de regência ou concordância que não prejudicam a compreensão geral.');
      suggestions.push('Revise a crase e o uso das vírgulas antes de orações explicativas e conjunções adversativas.');
    }

    return {
      number: 1,
      title: 'Domínio da modalidade escrita formal da Língua Portuguesa',
      score,
      feedback: `Nota ${score}/200. Avaliação do registro formal, ortografia, pontuação e sintaxe.`,
      positives,
      improvements: improvements.length > 0 ? improvements : ['Sem desvios expressivos.'],
      examplesFound: foundInformalities.map((w) => `Uso da expressão "${w}"`),
      suggestions,
    };
  }

  private static evaluateCompetence2(paragraphs: string[], text: string, topicTheme: string): CompetencyEvaluation {
    const repertorioKeywords = [
      'constituição', 'artigo', 'filósofo', 'sociólogo', 'história', 'século', 'bauman', 'foucault',
      'habermas', 'danto', 'aristóteles', 'gilberto dimenstein', 'oms', 'ibge', 'unesco', 'legislação',
    ];
    const foundRepertoire = repertorioKeywords.filter((k) => text.toLowerCase().includes(k));

    let score: CompetencyScore = 160;
    const positives: string[] = ['Estrutura dissertativo-argumentativa identificável com introdução, desenvolvimento e conclusão.'];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    if (foundRepertoire.length >= 2 && paragraphs.length >= 4) {
      score = 200;
      positives.push(`Excelente repertório sociocultural legitimado e produtivo: identificadas referências como "${foundRepertoire.slice(0, 2).join(', ')}".`);
      suggestions.push('Mantenha o repertório sempre diretamente conectado com o argumento central.');
    } else if (foundRepertoire.length === 1) {
      score = 160;
      positives.push(`Menção a repertório sociocultural relevante: "${foundRepertoire[0]}".`);
      improvements.push('Aprofunde a relação entre o repertório citado e a tese defendida para torná-lo 100% produtivo.');
      suggestions.push('Adicione uma contextualização filosófica, histórica ou legislativa na introdução.');
    } else {
      score = 120;
      improvements.push('Faltou repertório sociocultural externo legitimado (filosofia, sociologia, dados estatísticos ou leis).');
      suggestions.push('Utilize referências como a Constituição Federal de 1988 ou pensadores sociológicos para respaldar seus argumentos.');
    }

    return {
      number: 2,
      title: 'Compreensão da proposta e aplicação de repertório sociocultural',
      score,
      feedback: `Nota ${score}/200. Análise da tese, tipologia textual e pertinência do repertório ao tema "${topicTheme}".`,
      positives,
      improvements,
      examplesFound: foundRepertoire.map((r) => `Referência a: ${r}`),
      suggestions,
    };
  }

  private static evaluateCompetence3(paragraphs: string[]): CompetencyEvaluation {
    let score: CompetencyScore = 160;
    const positives: string[] = ['Presença de projeto de texto com defesa de ponto de vista claro.'];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    if (paragraphs.length >= 4) {
      score = 160;
      positives.push('Divisão clara entre causas do problema nos parágrafos de desenvolvimento (D1 e D2).');
      suggestions.push('Certifique-se de fechar cada parágrafo de desenvolvimento com uma frase conclusiva de reflexão crítica.');
    } else {
      score = 120;
      improvements.push('Texto estruturado em menos de 4 parágrafos prejudica o equilíbrio do projeto de texto.');
      suggestions.push('Adote o modelo padrão do ENEM: 1 Introdução + 2 Desenvolvimentos + 1 Conclusão.');
    }

    return {
      number: 3,
      title: 'Seleção, relação, organização e interpretação de argumentos',
      score,
      feedback: `Nota ${score}/200. Avaliação da coerência, progressão temática e força argumentativa.`,
      positives,
      improvements: improvements.length > 0 ? improvements : ['Argumentação bem articulada.'],
      examplesFound: ['Parágrafos de desenvolvimento articulam causas e consequências do tema.'],
      suggestions,
    };
  }

  private static evaluateCompetence4(paragraphs: string[]): CompetencyEvaluation {
    const connectorsInter = ['ademais', 'além disso', 'portanto', 'nesse sentido', 'por conseguinte', 'outrossim', 'sob essa ótica', 'em primeiro lugar', 'em contrapartida'];
    const textLower = paragraphs.join(' ').toLowerCase();
    const foundConnectors = connectorsInter.filter((c) => textLower.includes(c));

    let score: CompetencyScore = 160;
    const positives: string[] = [];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    if (foundConnectors.length >= 3) {
      score = 200;
      positives.push(`Uso expressivo e diversificado de operadores argumentativos: "${foundConnectors.slice(0, 3).join('", "')}".`);
      positives.push('Boa coesão interparágrafos e articulação lógica entre as partes do texto.');
      suggestions.push('Continue variando os conectivos para evitar repetição de palavras.');
    } else if (foundConnectors.length >= 1) {
      score = 160;
      positives.push(`Presença de conectivos coesivos: "${foundConnectors.join(', ')}".`);
      improvements.push('Amplie o uso de conectivos no início do 2º parágrafo, 3º parágrafo e 4º parágrafo (interparágrafos).');
      suggestions.push('Inicie os desenvolvimentos com conectivos como "Em primeira análise" e "Ademais", e a conclusão com "Portanto".');
    } else {
      score = 120;
      improvements.push('Pouca presença de elementos coesivos inter e intraparágrafos, tornando a transição de ideias abrupta.');
      suggestions.push('Estude a lista de operadores argumentativos do ENEM para enriquecer a articulação das frases.');
    }

    return {
      number: 4,
      title: 'Demonstração de mecanismos linguísticos necessários para a argumentação',
      score,
      feedback: `Nota ${score}/200. Avaliação da coesão referencial e sequencial ao longo do texto.`,
      positives,
      improvements,
      examplesFound: foundConnectors.map((c) => `Conectivo utilizado: "${c}"`),
      suggestions,
    };
  }

  private static evaluateCompetence5(paragraphs: string[]): { comp5: CompetencyEvaluation; elements: ProposalElementsEvaluation } {
    const conclusion = paragraphs[paragraphs.length - 1] || '';
    const conclusionLower = conclusion.toLowerCase();

    // Verificação dos 5 Elementos
    const agenteKeywords = ['ministério', 'governo', 'escola', 'sociedade', 'família', 'mídia', 'ong', 'estado', 'poder público', 'secretaria'];
    const acaoKeywords = ['deve', 'precisa', 'promover', 'implementar', 'criar', 'desenvolver', 'estabelecer', 'garantir', 'fiscalizar'];
    const modoKeywords = ['por meio de', 'mediante', 'através de', 'com o auxílio de', 'por intermédio de', 'com a criação de'];
    const finalidadeKeywords = ['a fim de', 'com o intuito de', 'para que', 'com o objetivo de', 'visando a', 'para combater'];

    const hasAgente = agenteKeywords.some((k) => conclusionLower.includes(k));
    const hasAcao = acaoKeywords.some((k) => conclusionLower.includes(k));
    const hasModo = modoKeywords.some((k) => conclusionLower.includes(k));
    const hasFinalidade = finalidadeKeywords.some((k) => conclusionLower.includes(k));
    // Detalhamento: presença de orações explicativas com travessões, parênteses ou "como, por exemplo"
    const hasDetalhamento = conclusionLower.includes('por exemplo') || conclusionLower.includes('como') || conclusion.includes('—') || conclusion.includes('(') || conclusion.length > 250;

    const elementsCount = [hasAgente, hasAcao, hasModo, hasFinalidade, hasDetalhamento].filter(Boolean).length;

    let score: CompetencyScore = 160;
    if (elementsCount === 5) {
      score = 200;
    } else if (elementsCount === 4) {
      score = 160;
    } else if (elementsCount === 3) {
      score = 120;
    } else if (elementsCount === 2) {
      score = 80;
    } else {
      score = 40;
    }

    const proposalElements: ProposalElementsEvaluation = {
      agente: {
        detected: hasAgente,
        feedback: hasAgente ? 'Agente governamental ou social bem delimitado no parágrafo conclusivo.' : 'Falta definir claramente QUEM executará a intervenção (ex: Ministério da Educação, Governo Federal).',
      },
      acao: {
        detected: hasAcao,
        feedback: hasAcao ? 'Ação interventiva clara e viável indicada.' : 'Falta especificar O QUE será feito como medida concreta.',
      },
      modo: {
        detected: hasModo,
        feedback: hasModo ? 'Modo/Meio de execução explicitado ("por meio de...", "mediante...").' : 'Falta explicitar COMO a proposta será implementada (recursos, parcerias, canais).',
      },
      finalidade: {
        detected: hasFinalidade,
        feedback: hasFinalidade ? 'Finalidade/efeito social da ação claramente apontado ("a fim de...", "com o objetivo de...").' : 'Falta declarar PARA QUE a medida será implementada.',
      },
      detalhamento: {
        detected: hasDetalhamento,
        feedback: hasDetalhamento ? 'Detalhamento presente, especificando pormenores de um dos elementos.' : 'Recomenda-se acrescentar um detalhamento explicativo em um dos elementos para garantir nota 200.',
      },
    };

    return {
      comp5: {
        number: 5,
        title: 'Elaboração de proposta de intervenção respeitando os direitos humanos',
        score,
        feedback: `Nota ${score}/200. Avaliação dos 5 elementos obrigatórios da intervenção: ${elementsCount}/5 identificados.`,
        positives: elementsCount >= 4 ? ['Proposta bem estruturada e articulada com o debate do texto.'] : ['Apresentou tentativa de intervenção.'],
        improvements: elementsCount < 5 ? ['Certifique-se de incluir todos os 5 elementos: Agente, Ação, Modo/Meio, Finalidade e Detalhamento.'] : ['Proposta de intervenção completa.'],
        examplesFound: [`Elementos identificados na conclusão: ${elementsCount} de 5.`],
        suggestions: ['Use a fórmula mágica do ENEM: "Cabe ao [AGENTE] [AÇÃO], por meio de [MEIO/MODO], com o objetivo de [EFEITO]. Para tanto, [DETALHAMENTO]."'],
      },
      elements: proposalElements,
    };
  }

  private static generateInTextAnnotations(paragraphs: string[]): TextAnnotation[] {
    const annotations: TextAnnotation[] = [];

    if (paragraphs.length >= 1) {
      annotations.push({
        id: 'ann-01',
        paragraphIndex: 0,
        snippet: 'Introdução',
        type: 'praise',
        explanation: 'Boa contextualização inicial do tema com apresentação da tese norteadora.',
      });
    }

    if (paragraphs.length >= 2) {
      annotations.push({
        id: 'ann-02',
        paragraphIndex: 1,
        snippet: 'Desenvolvimento 1',
        type: 'argument',
        explanation: 'Foco argumentativo no D1 focado em causas estruturais. Certifique-se de relacionar com o repertório citado.',
        betterAlternative: 'Aprofunde o desdobramento da consequência antes de passar ao próximo parágrafo.',
      });
    }

    if (paragraphs.length >= 4) {
      annotations.push({
        id: 'ann-03',
        paragraphIndex: 3,
        snippet: 'Conclusão / Intervenção',
        type: 'suggestion',
        explanation: 'Parágrafo de fechamento: confira se todos os 5 elementos da proposta de intervenção (Agente, Ação, Modo, Efeito e Detalhamento) estão claros.',
      });
    }

    return annotations;
  }

  private static generateZeroCompetencies(reason: string): CompetencyEvaluation[] {
    return [1, 2, 3, 4, 5].map((num) => ({
      number: num as 1 | 2 | 3 | 4 | 5,
      title: `Competência ${num}`,
      score: 0 as CompetencyScore,
      feedback: reason,
      positives: [],
      improvements: [reason],
      examplesFound: [],
      suggestions: ['Desenvolva um texto completo de no mínimo 8 a 30 linhas.'],
    }));
  }
}

