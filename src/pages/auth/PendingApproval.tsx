import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  RotateCw,
  Sparkles,
  Shield,
  CreditCard,
  QrCode,
  Zap,
} from 'lucide-react';
import { db } from '../../db/storage';
import { User } from '../../types';
import { authRepository } from '../../services/repositories/authRepository';
import { paymentRepository } from '../../services/repositories/paymentRepository';

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
  const [isGeneratingCheckout, setIsGeneratingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
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

  const handleLiberarAcessoInfinitePay = async () => {
    setIsGeneratingCheckout(true);
    setCheckoutError(null);

    try {
      const res = await paymentRepository.createCheckoutLink();

      if (res.success && res.checkoutUrl) {
        // Redireciona o aluno diretamente para o checkout hospedado oficial da InfinitePay
        window.location.href = res.checkoutUrl;
      } else if (res.success && (res as any).alreadyActive) {
        setCheckedMessage('Seu acesso já está liberado! Redirecionando...');
        setTimeout(() => onNavigate('dashboard'), 1000);
      } else {
        setCheckoutError(res.message || res.error || 'Não foi possível gerar o checkout. Tente novamente.');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Erro ao conectar ao serviço de pagamento.');
    } finally {
      setIsGeneratingCheckout(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setCheckedMessage(null);
    setCheckoutError(null);

    try {
      const freshUser = await authRepository.getCurrentSessionUser();
      setIsChecking(false);

      if (!freshUser) {
        onNavigate('login');
        return;
      }

      db.setCurrentUser(freshUser, true);
      setCurrentUser(freshUser);

      if (freshUser.status === 'APROVADO') {
        setCheckedMessage('Parabéns! Seu pagamento foi confirmado e seu acesso está liberado!');
        setTimeout(() => onNavigate('dashboard'), 1000);
      } else if (freshUser.status === 'REPROVADO') {
        setCheckedMessage('Seu cadastro não foi aprovado pela administração.');
      } else {
        setCheckedMessage('Pagamento ou aprovação ainda não identificados. Se já pagou, aguarde alguns instantes.');
      }
    } catch {
      setIsChecking(false);
      setCheckedMessage('Erro ao verificar status. Tente novamente em instantes.');
    }
  };

  const handleLogout = async () => {
    await authRepository.signOut();
    onNavigate('login');
  };

  const isRejected = currentUser?.status === 'REPROVADO';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6 animate-fade-in text-center">
        {/* Status Icon */}
        <div className="mx-auto flex items-center justify-center">
          {isRejected ? (
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 relative">
              <GraduationCap className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isRejected
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : 'bg-brand-500/10 text-brand-300 border-brand-500/20'
            }`}
          >
            {isRejected ? 'Cadastro Não Aprovado' : 'Sua Conta Foi Criada'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isRejected ? 'Cadastro Recusado' : 'Falta apenas liberar seu acesso'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {isRejected
              ? currentUser?.rejectionReason ||
                'Infelizmente seu cadastro não foi aprovado pela administração da plataforma.'
              : `Olá, ${currentUser?.name || 'Estudante'}! Conclua o pagamento único para desbloquear todos os recursos do ENEM 2026 PRO.`}
          </p>
        </div>

        {/* Card da Oferta de Acesso (GATE 9 — INFINITEPAY) */}
        {!isRejected && (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-2 border-brand-500/30 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest block">Plano Oficial</span>
                <h3 className="text-base font-black text-white">ENEM 2026 PRO</h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 line-through block">de R$ 197,00</span>
                <span className="text-xl font-black text-emerald-400">R$ 37,00</span>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Pagamento Único</span>
              </div>
            </div>

            {/* Benefícios */}
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Banco de 54+ questões oficiais calibradas com TRI</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulados completos (SAS, Poliedro, Bernoulli)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Corretor de Redação com IA e notas por competência</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Biblioteca de apostilas e cronograma personalizado</span>
              </li>
            </ul>

            {/* Badges de Meios de Pagamento */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <QrCode className="w-4 h-4 text-brand-400" /> Pix Instantâneo
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <CreditCard className="w-4 h-4 text-brand-400" /> Cartão até 12x
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5" /> Liberação Automática
              </div>
            </div>

            {/* Botão Principal de Compra */}
            <button
              onClick={handleLiberarAcessoInfinitePay}
              disabled={isGeneratingCheckout}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-brand-600/30 active:scale-98 disabled:opacity-50"
            >
              {isGeneratingCheckout ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Checkout Seguro...</span>
                </>
              ) : (
                <>
                  <span>LIBERAR MEU ACESSO (R$ 37,00)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {checkoutError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{checkoutError}</span>
          </div>
        )}

        {checkedMessage && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold ${
              checkedMessage.includes('Parabéns')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {checkedMessage}
          </div>
        )}

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
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Objetivo:</span>
              <span className="font-bold text-brand-400">{currentUser.objective || 'ENEM 2026'}</span>
            </div>
          </div>
        )}

        {/* Action Buttons Secundários */}
        <div className="space-y-2 pt-1">
          {!isRejected && (
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando...' : 'Já paguei, verificar meu acesso'}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>

        {/* Selo de Segurança InfinitePay */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pagamento 100% seguro processado por InfinitePay (CloudWalk).</span>
        </div>
      </div>
    </div>
  );
};
