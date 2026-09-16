import React, { useState } from 'react';
import { db } from '../../db/storage';
import { Question, AreaDoConhecimento, Disciplina } from '../../types';
import {
  HelpCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Bookmark,
  Share2,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BancoQuestoesProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  initialQuestionId?: string;
}

export const BancoQuestoes: React.FC<BancoQuestoesProps> = ({ onNavigate, initialQuestionId }) => {
  const currentUser = db.getCurrentUser();
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('TODAS');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado da resolução individual
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const allQuestions = db.getQuestions({
    area: selectedArea !== 'TODAS' ? (selectedArea as AreaDoConhecimento) : undefined,
    discipline: selectedDiscipline !== 'TODAS' ? (selectedDiscipline as Disciplina) : undefined,
    difficulty: selectedDifficulty !== 'TODAS' ? (selectedDifficulty as 'FACIL' | 'MEDIO' | 'DIFICIL') : undefined,
    search: searchTerm,
  });

  const handleSelectOption = (questionId: string, letter: string) => {
    if (revealed[questionId]) return;
    setSelectedAnswers({ ...selectedAnswers, [questionId]: letter });
  };

  const handleVerify = (q: Question) => {
    const userChoice = selectedAnswers[q.id];
    if (!userChoice) return;

    setRevealed({ ...revealed, [q.id]: true });

    const isCorrect = userChoice === q.correctOption;
    if (currentUser) {
      if (isCorrect) {
        db.addXp(currentUser.id, 20, `Acertou questão de ${q.discipline}`);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        db.logMistake(currentUser.id, q, userChoice as 'A' | 'B' | 'C' | 'D' | 'E');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-brand-600" />
            Banco de Questões ENEM
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mais de 2.000 questões categorizadas por área, disciplina e assunto com resolução comentada.
          </p>
        </div>

        <button
          onClick={() => onNavigate('erros')}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-black uppercase cursor-pointer"
        >
          Ver Caderno de Erros →
        </button>
      </div>

      {/* Filtros em Barra Superior */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Filtro de Área */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Área do Conhecimento
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="TODAS">Todas as Áreas</option>
              <option value="MATEMATICA">Matemática</option>
              <option value="CIENCIAS_DA_NATUREZA">Ciências da Natureza</option>
              <option value="CIENCIAS_HUMANAS">Ciências Humanas</option>
              <option value="LINGUAGENS">Linguagens e Códigos</option>
            </select>
          </div>

          {/* Filtro de Disciplina */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Disciplina
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="TODAS">Todas as Disciplinas</option>
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biologia">Biologia</option>
              <option value="História">História</option>
              <option value="Geografia">Geografia</option>
              <option value="Filosofia">Filosofia</option>
              <option value="Sociologia">Sociologia</option>
              <option value="Português">Português</option>
              <option value="Literatura">Literatura</option>
              <option value="Inglês">Inglês</option>
            </select>
          </div>

          {/* Filtro de Dificuldade */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Dificuldade
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="TODAS">Todas as Dificuldades</option>
              <option value="FACIL">Fácil</option>
              <option value="MEDIO">Médio</option>
              <option value="DIFICIL">Difícil</option>
            </select>
          </div>

          {/* Busca Textual */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Palavra-chave
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Cilindro, Vargas..."
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>{allQuestions.length} questões encontradas</span>
          <span>Resolva e receba feedback em tempo real</span>
        </div>
      </div>

      {/* Lista de Questões */}
      <div className="space-y-6">
        {allQuestions.map((q, idx) => {
          const userChoice = selectedAnswers[q.id];
          const isRevealed = !!revealed[q.id];
          const isCorrect = userChoice === q.correctOption;
          const isFav = currentUser ? db.isFavorite(currentUser.id, q.id) : false;

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Header da Questão */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {q.discipline}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {q.topic} ({q.source})
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      q.difficulty === 'FACIL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.difficulty === 'MEDIO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (currentUser) {
                      db.toggleFavorite(currentUser.id, {
                        targetId: q.id,
                        type: 'QUESTION',
                        title: q.discipline,
                        subtitle: q.statement.substring(0, 60),
                      });
                    }
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isFav
                      ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isFav ? 'Remover dos favoritos' : 'Favoritar questão'}
                >
                  <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                </button>
              </div>

              {/* Texto de Apoio se houver */}
              {q.supportText && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  {q.supportText}
                </div>
              )}

              {/* Enunciado */}
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {q.statement}
              </p>

              {/* Alternativas */}
              <div className="space-y-2 pt-2">
                {q.options.map((opt) => {
                  const isSelected = userChoice === opt.letter;
                  const isAnswerKey = q.correctOption === opt.letter;

                  let optionStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300';
                  if (isRevealed) {
                    if (isAnswerKey) {
                      optionStyle = 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-500 font-bold text-emerald-950 dark:text-emerald-100';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-100 dark:bg-rose-950/50 border-rose-400 font-bold text-rose-950 dark:text-rose-100';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-brand-50 dark:bg-brand-950/40 border-brand-600 font-bold';
                  }

                  return (
                    <button
                      key={opt.letter}
                      disabled={isRevealed}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.letter)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <span className="text-xs pt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Botão de Responder / Verificar */}
              {!isRevealed ? (
                <div className="pt-2 flex justify-end">
                  <button
                    disabled={!userChoice}
                    onClick={() => handleVerify(q)}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-black uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    Responder e Conferir
                  </button>
                </div>
              ) : (
                /* Resolução Comentada */
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Parabéns, você acertou! (+20 XP)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-black flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Você errou (salvo no Caderno de Erros)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    <strong>Gabarito Oficial ({q.correctOption}):</strong> {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

