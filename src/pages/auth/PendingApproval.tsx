import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { db } from '../../db/storage';
import { User } from '../../types';

interface PendingApprovalProps {
  onNavigate: (route: string) => void;
  currentUser?: User | null;
}

export const PendingApproval: React.FC<PendingApprovalProps> = ({
  onNavigate,
  currentUser: propUser,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(
    () => propUser || db.getCurrentUser()
  );
  const [isChecking, setIsChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  useEffect(() => {
    return db.subscribe(() => {
      const user = db.getCurrentUser();
      setCurrentUser(user);
      if (user && user.status === 'APROVADO') {
        onNavigate('dashboard');
      }
    });
  }, [onNavigate]);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setCheckedMessage(null);

    setTimeout(() => {
      setIsChecking(false);
      const user = db.getCurrentUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      // Check fresh from db
      const allUsers = db.getUsers();
      const freshUser = allUsers.find((u) => u.id === user.id) || user;
      db.setCurrentUser(freshUser, true);
      setCurrentUser(freshUser);

      if (freshUser.status === 'APROVADO') {
        setCheckedMessage('Parabéns! Seu cadastro foi APROVADO. Redirecionando...');
        setTimeout(() => onNavigate('dashboard'), 1000);
      } else if (freshUser.status === 'REPROVADO') {
        setCheckedMessage('Seu cadastro não foi aprovado pela administração.');
      } else {
        setCheckedMessage('Seu cadastro ainda está em análise pela coordenação.');
      }
    }, 600);
  };

  const handleSimulateApproval = () => {
    if (currentUser) {
      db.approveUser(currentUser.id);
      const allUsers = db.getUsers();
      const approved = allUsers.find((u) => u.id === currentUser.id);
      if (approved) {
        db.setCurrentUser(approved, true);
        setCurrentUser(approved);
        onNavigate('dashboard');
      }
    }
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    onNavigate('login');
  };

  const isRejected = currentUser?.status === 'REPROVADO';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6 animate-fade-in text-center">
        {/* Status Icon */}
        <div className="mx-auto flex items-center justify-center">
          {isRejected ? (
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 relative">
              <Clock className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isRejected
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
          >
            {isRejected ? 'Cadastro Não Aprovado' : 'Status: Pendente de Aprovação'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isRejected ? 'Cadastro Recusado' : 'Cadastro em Análise'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {isRejected
              ? currentUser?.rejectionReason ||
                'Infelizmente seu cadastro não foi aprovado pela administração da plataforma.'
              : `Olá, ${currentUser?.name || 'Estudante'}! Seu cadastro foi recebido com sucesso e está aguardando a liberação da coordenação pedagógica.`}
          </p>
        </div>

        {/* User Registration Details Card */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Aluno:</span>
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">E-mail:</span>
              <span className="font-mono text-slate-300">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Objetivo:</span>
              <span className="font-bold text-brand-400">{currentUser.objective || 'ENEM 2026'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cidade / Estado:</span>
              <span className="font-medium text-slate-300">
                {currentUser.city ? `${currentUser.city}/${currentUser.state || 'SP'}` : 'Não informado'}
              </span>
            </div>
          </div>
        )}

        {checkedMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold ${
              checkedMessage.includes('Parabéns')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {checkedMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {!isRejected && (
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-600/20"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando...' : 'Verificar se fui Aprovado'}</span>
            </button>
          )}

          {/* Test shortcut button for immediate review */}
          <button
            onClick={handleSimulateApproval}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprovar Imediatamente (Atalho para Testes)</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Sair e Voltar ao Início
          </button>
        </div>

        {/* Admin hint */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          <span>Administrador: aprove este usuário no Painel Administrativo.</span>
        </div>
      </div>
    </div>
  );
};
