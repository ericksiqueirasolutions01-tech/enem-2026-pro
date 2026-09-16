import React, { useState } from 'react';
import { db } from '../../db/storage';
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  HelpCircle,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    route: string;
    params?: Record<string, string>;
  };
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const currentUser = db.getCurrentUser();
  const profile = currentUser ? db.getStudentProfile(currentUser.id) : null;
  const mistakes = currentUser ? db.getMistakes(currentUser.id) : [];

  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Olá, **${currentUser?.name.split(' ')[0] || 'Estudante'}**! Sou seu **Tutor de Inteligência Artificial para o ENEM 2026 & ETEC** 🎓.\n\nEstou calibrado com a matriz de referência do ENEM e os critérios da TRI. Como posso acelerar sua aprovação hoje? Você pode escolher uma das ações rápidas abaixo ou me fazer qualquer pergunta!`,
      timestamp: 'Agora',
    },
  ]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAction = (actionType: 'EXPLICAR' | 'RESUMO' | 'PLANO' | 'DUVIDAS' | 'REVISAO') => {
    let userPrompt = '';
    let aiResponse = '';
    let actionBtn: ChatMessage['action'] | undefined = undefined;

    switch (actionType) {
      case 'EXPLICAR':
        userPrompt = '💡 Explicar uma questão do ENEM passo a passo com resolução e pegadinhas.';
        aiResponse = `### 🔍 Como Resolver Qualquer Questão do ENEM com o Método TRI:\n\n1. **Identifique o Comando Primeiro**: Não leia o texto motivador de cara! Vá direto ao último parágrafo para saber o que a banca pede.\n2. **Elimine os Distratores**: O ENEM adora distratores de *extrapolação* (dizer mais do que o texto diz), *redução* (focar em detalhe secundário) e *oposição*.\n3. **Classificação TRI**: Se for Fácil, você NÃO pode errar (impacta sua nota TRI drasticamente). Se for Difícil, gaste no máximo 3 minutos e chute consciente se necessário.\n\n*Cole aqui o enunciado de qualquer questão para eu resolver linha por linha!*`;
        actionBtn = { label: 'Ir para o Banco de Questões', route: 'questoes' };
        break;

      case 'RESUMO':
        userPrompt = '📝 Criar um resumo inteligente com os tópicos mais recorrentes do ENEM.';
        aiResponse = `### 📌 Tópicos com Maior Recorrência Histórica no ENEM:\n\n- **Matemática**: Razão e Proporção, Regra de 3, Estatística (Média, Moda, Mediana), Geometria Plana/Espacial e Funções do 1º/2º grau.\n- **Ciências da Natureza**: Ecologia e Meio Ambiente (cadeias, ciclos biogeoquímicos), Termologia, Ondulatória, Circuitos Elétricos, Eletroquímica (pilhas) e Estequiometria.\n- **Ciências Humanas**: Cidadania e Democracia, Ditadura Militar, Era Vargas, Patrimônio Cultural, Globalização, Urbanização e Meio Ambiente.\n- **Linguagens**: Funções da Linguagem, Figuras de Linguagem, Variação Linguística, Gêneros Textuais e Arte Contemporânea.\n- **Redação**: Estrutura de 4 parágrafos (Introdução com tese + 2 Desenvolvimentos com repertório legitimado + Conclusão com Proposta de Intervenção de 5 elementos: Agente, Ação, Meio/Modo, Efeito e Detalhamento).`;
        actionBtn = { label: 'Ver Matérias & Apostilas', route: 'materias' };
        break;

      case 'PLANO':
        userPrompt = '📅 Criar um plano de estudo eficiente e adaptativo para o ENEM 2026.';
        aiResponse = `### 🎯 Seu Cronograma Recomendado de Alta Performance (ENEM 2026):\n\n- **Segunda**: Matemática (Álgebra) + Língua Portuguesa (Interpretação e Gramática) — *20 questões*\n- **Terça**: Biologia (Ecologia/Citologia) + História (Brasil República) — *20 questões*\n- **Quarta**: Redação (1 texto completo com rascunho de 30 linhas) + Química (Geral e Físico-Química)\n- **Quinta**: Física (Mecânica e Eletricidade) + Geografia (Geopolítica e Brasil)\n- **Sexta**: Filosofia/Sociologia + Literatura / Língua Estrangeira (Inglês ou Espanhol)\n- **Sábado**: Simulado completo (Alternando Dia 1 e Dia 2) + Correção do Caderno de Erros\n- **Domingo**: Descanso ativo e alinhamento das metas da próxima semana.`;
        actionBtn = { label: 'Abrir Plano de Estudos', route: 'plano' };
        break;

      case 'DUVIDAS':
        userPrompt = '❓ Tirar dúvidas sobre matérias, conceitos ou estratégias do ENEM.';
        aiResponse = `### 💬 Como posso te ajudar com sua dúvida agora?\n\nVocê pode digitar qualquer conceito que esteja difícil (ex: *Circuitos Elétricos, Estequiometria, Funções Trigonométricas, Revolução Francesa, Crase*) ou colar o texto de um enunciado.\n\nSou treinado para simplificar tópicos complexos com analogias didáticas e apontar como o ENEM cobra esse assunto na prática!`;
        actionBtn = { label: 'Ver Caderno de Erros', route: 'erros' };
        break;

      case 'REVISAO':
        userPrompt = '🔄 Sugerir protocolo de revisão espaçada para os próximos dias.';
        aiResponse = `### 🧠 Protocolo de Curva do Esquecimento (1d - 7d - 30d):\n\n1. **Revisão de 24 horas**: Faça 5 flashcards ou 3 questões rápidas do que você estudou ontem.\n2. **Revisão de 7 dias**: Resolva 10 questões do assunto sem reler a teoria.\n3. **Revisão de 30 dias**: Faça um mini-simulado misto de 15 questões combinando os tópicos do mês.\n\n*A revisão ativa através de questões é 3x mais eficaz que reler resumos prontos.*`;
        actionBtn = { label: 'Ir para Simulados', route: 'simulados' };
        break;
    }

    const newMsgs: ChatMessage[] = [
      ...messages,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: userPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionBtn,
      },
    ];

    setMessages(newMsgs);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsgs: ChatMessage[] = [
      ...messages,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMsgs);

    // Resposta inteligente baseada em palavras-chave
    setTimeout(() => {
      let reply = '';
      let action: ChatMessage['action'] | undefined = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('redação') || lower.includes('tema') || lower.includes('nota 1000')) {
        reply = `### ✍️ Dicas de Ouro para a Redação Nota 1000 no ENEM 2026:\n\n1. **Competência 1**: Cuidado com regência verbal, crase e paralelismo sintático.\n2. **Competência 2 & 3**: Utilize repertório sociocultural produtivo e legitimado (filósofos como Zygmunt Bauman, Constituição Federal de 1988, dados do IBGE).\n3. **Competência 4**: Use pelo menos 2 operadores argumentativos interparágrafos ("Ademais", "Por conseguinte", "Outrossim").\n4. **Competência 5**: Os 5 elementos da Proposta de Intervenção são obrigatórios: **Agente**, **Ação**, **Meio/Modo**, **Efeito** e **Detalhamento** de um deles!`;
        action = { label: 'Escrever Redação Agora', route: 'redacao' };
      } else if (lower.includes('etec') || lower.includes('vestibulinho')) {
        reply = `### 🏫 Preparação para o Vestibulinho ETEC:\n\nO vestibulinho da ETEC é composto por **40 a 50 questões** multidisciplinares com foco em raciocínio lógico, interpretação de textos, ciências e atualidades. Na nossa plataforma criamos a área exclusiva da ETEC com apostilas teóricas e o simulado interativo oficial!`;
        action = { label: 'Acessar Central ETEC', route: 'etec' };
      } else if (lower.includes('tri') || lower.includes('nota') || lower.includes('acertos')) {
        reply = `### 📈 Entendendo a TRI (Teoria de Resposta ao Item):\n\nA TRI do ENEM não considera apenas o número bruto de acertos, mas a **coerência pedagógica** das suas respostas.\n- Quem acerta questões difíceis mas erra as fáceis é penalizado (o sistema entende como chute).\n- Para garantir 750+ em Matemática e Natureza, garanta **100% de acerto nas questões fáceis e médias**.`;
      } else {
        reply = `Entendi perfeitamente sua dúvida sobre: *"${userText}"*.\n\nPara o ENEM 2026, a chave é aliar teoria concisa com prática massiva em questões estilo ENEM e vestibulares tradicionais (FUVEST, UNICAMP, ETEC).\n\nRecomendo que você pratique 15 questões desse assunto no nosso **Banco de Questões** ou consulte a apostila temática completa na **Área de Matérias**.`;
        action = { label: 'Ir para Matérias', route: 'materias' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">🤖 Tutor IA — ENEM 2026</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  Inteligência Pedagógica
                </span>
              </div>
              <p className="text-xs text-white/80">Tutor pedagógico inteligente focado na sua aprovação 24h</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar Assistente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Quick Actions Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 pl-1">
            Ferramentas Rápidas:
          </span>

          <button
            onClick={() => handleQuickAction('EXPLICAR')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-200 hover:text-brand-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>1. Explicar Questão</span>
          </button>

          <button
            onClick={() => handleQuickAction('RESUMO')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>2. Criar Resumo</span>
          </button>

          <button
            onClick={() => handleQuickAction('PLANO')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Criar Plano de Estudo</span>
          </button>

          <button
            onClick={() => handleQuickAction('DUVIDAS')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Tirar Dúvidas</span>
          </button>

          <button
            onClick={() => handleQuickAction('REVISAO')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>5. Sugerir Revisão</span>
          </button>
        </div>

        {/* Chat Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line prose prose-xs dark:prose-invert max-w-none">
                  {msg.text}
                </div>

                {/* Optional Action Button */}
                {msg.action && onNavigate && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate(msg.action!.route, msg.action!.params);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{msg.action.label}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      title="Copiar texto"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua dúvida sobre matéria, redação, simulado ou questão..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-md shadow-brand-500/20"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="pt-2 text-center text-[10px] text-slate-400">
            Estimativa Pedagógica Automatizada (Metodologia TRI) • Utilize como diagnóstico formativo para estudo individual, não como nota oficial do INEP.
          </div>
        </div>
      </div>
    </div>
  );
};

