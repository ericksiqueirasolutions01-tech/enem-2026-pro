import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { User, FavoriteItem } from '../../types';
import {
  Bookmark,
  Trash2,
  ArrowRight,
  HelpCircle,
  PenTool,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface FavoritosProps {
  currentUser: User | null;
  onNavigate: (route: string, params?: any) => void;
}

export const Favoritos: React.FC<FavoritosProps> = ({ currentUser, onNavigate }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() =>
    currentUser ? db.getFavorites(currentUser.id) : []
  );
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    return db.subscribe(() => {
      if (currentUser) {
        setFavorites(db.getFavorites(currentUser.id));
      }
    });
  }, [currentUser]);

  const handleRemove = (targetId: string, type: 'QUESTION' | 'ESSAY_TOPIC' | 'TOPIC') => {
    if (!currentUser) return;
    db.toggleFavorite(currentUser.id, {
      targetId,
      type,
      title: '',
      subtitle: '',
    });
  };

  const filteredList = favorites.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Sua Biblioteca Pessoal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Meus Favoritos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acesse rapidamente questões desafiadoras, temas de redação selecionados e tópicos importantes marcados para revisão.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `Todos (${favorites.length})` },
          { id: 'QUESTION', label: `Questões (${favorites.filter((f) => f.type === 'QUESTION').length})` },
          { id: 'ESSAY_TOPIC', label: `Temas de Redação (${favorites.filter((f) => f.type === 'ESSAY_TOPIC').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterType === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Favorites List */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhum item salvo nos favoritos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Quando você encontrar uma questão interessante no banco de questões ou um tema de redação que queira treinar mais tarde, clique no ícone de salvar.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('questoes')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Explorar Questões
            </button>
            <button
              onClick={() => onNavigate('redacao')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Ver Temas de Redação
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isQuestion = item.type === 'QUESTION';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        isQuestion
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      {isQuestion ? <HelpCircle className="w-3 h-3" /> : <PenTool className="w-3 h-3" />}
                      <span>{isQuestion ? 'Questão ENEM' : 'Tema de Redação'}</span>
                    </span>

                    <button
                      onClick={() => handleRemove(item.targetId, item.type)}
                      title="Remover dos favoritos"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Salvo em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>

                  {isQuestion ? (
                    <button
                      onClick={() => onNavigate('questoes', { questionId: item.targetId })}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Abrir Questão</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('redacao-editor', { topicId: item.targetId })}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Redigir Redação</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

