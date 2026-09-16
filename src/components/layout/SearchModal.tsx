import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { Search, X, HelpCircle, FileCheck2, PenTool, BookOpen, ArrowRight, Sparkles, FolderDown } from 'lucide-react';
import { searchDriveMaterials } from '../../db/driveMaterialsData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subjectsMatched = query.trim()
    ? ENEM_CURRICULUM.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()) ||
          s.topics.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 4)
    : [];

  const driveMaterialsMatched = query.trim() ? searchDriveMaterials(query).slice(0, 4) : [];

  const questions = db.getQuestions({ search: query }).slice(0, 5);
  const simulados = db.getSimulados().filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);
  const essayTopics = db.getEssayTopics().filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.theme.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const hasResults =
    subjectsMatched.length > 0 ||
    driveMaterialsMatched.length > 0 ||
    questions.length > 0 ||
    simulados.length > 0 ||
    essayTopics.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar questões, matérias, simulados ou temas..."
            className="flex-1 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Digite uma palavra-chave como <strong className="text-brand-600">"Funções"</strong>, <strong className="text-brand-600">"Redação"</strong> ou <strong className="text-brand-600">"Era Vargas"</strong>.
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            <>
              {/* Matérias e Tópicos */}
              {subjectsMatched.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Matérias & Conteúdos de Estudo ({subjectsMatched.length})
                  </h5>
                  <div className="space-y-1.5">
                    {subjectsMatched.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onClose();
                          onNavigate('materia-detalhe', { subjectId: s.id });
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {s.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-extrabold">
                              {s.topics.length} tópicos
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {s.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-600 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Apostilas e Materiais das Matérias */}
              {driveMaterialsMatched.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Matérias e Apostilas Didáticas ({driveMaterialsMatched.length})
                  </h5>
                  <div className="space-y-1.5">
                    {driveMaterialsMatched.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          onClose();
                          onNavigate('materias', { category: mat.category });
                        }}
                        className="w-full text-left p-2.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition-all group cursor-pointer"
                      >
                        <div className="flex-1 pr-3 truncate">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                              {mat.category}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {mat.type}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {mat.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulados */}
              {simulados.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" /> Simulados
                  </h5>
                  <div className="space-y-1">
                    {simulados.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onClose();
                          onNavigate('simulado_run', { simuladoId: s.id });
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{s.title}</p>
                          <p className="text-[11px] text-slate-500">{s.totalQuestions} questões • {s.timeLimitMinutes} min</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Temas de Redação */}
              {essayTopics.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase text-purple-500 tracking-wider mb-2 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" /> Temas de Redação
                  </h5>
                  <div className="space-y-1">
                    {essayTopics.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onClose();
                          onNavigate('redacao_write', { topicId: t.id });
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 truncate max-w-md">{t.theme}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questões */}
              {questions.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase text-brand-500 tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Questões do Banco
                  </h5>
                  <div className="space-y-1">
                    {questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          onClose();
                          onNavigate('questoes', { questionId: q.id });
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-950/30 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <div className="flex-1 pr-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-2">
                            {q.discipline}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{q.statement}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

