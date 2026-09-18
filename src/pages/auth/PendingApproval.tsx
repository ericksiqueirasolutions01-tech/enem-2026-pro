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
  Tag,
} from 'lucide-react';
import { db } from '../../db/storage';
import { User, CouponValidationResult } from '../../types';
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

  // Estados do Cupom de Desconto
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(true);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user && user.status === 'APROVADO') {
      onNavigate('dashboard');
      return;
    }

    return db.subscribe(() => {
      const u = db.getCurrentUser();
      setCurrentUser(u);
      if (u && u.status === 'APROVADO') {
        onNavigate('dashboard');
      }
    });
  }, [onNavigate]);

  const handleApplyCoupon = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const codeToValidate = (directCode || couponCodeInput || '').trim();
    if (!codeToValidate) {
      setCouponFeedback('Digite o código do seu cupom.');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponFeedback(null);
    try {
      const result = await paymentRepository.validateCoupon(codeToValidate);
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponCodeInput(result.coupon?.code || codeToValidate.toUpperCase());
        setCouponFeedback(null);
        setCheckoutError(null);
      } else {
        setAppliedCoupon(null);
        setCouponFeedback(result.error || 'Cupom inválido.');
      }
    } catch {
      setAppliedCoupon(null);
      setCouponFeedback('Falha de comunicação ao validar cupom.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponFeedback(null);
  };

  const handleLiberarAcessoInfinitePay = async () => {
    setIsGeneratingCheckout(true);
    setCheckoutError(null);

    try {
      const res = await paymentRepository.createCheckoutLink({
        couponCode: appliedCoupon?.coupon?.code,
        discountCents: appliedCoupon?.discountCents,
        finalPriceCents: appliedCoupon?.finalPriceCents,
      });

      if (res.isFreeCoupon || (res.success && (res as any).alreadyActive)) {
        setCheckedMessage('Parabéns! Sua bolsa/cupom foi ativado com sucesso! Redirecionando...');
        setTimeout(() => onNavigate('dashboard'), 1200);
        return;
      }

      if (res.success && res.checkoutUrl) {
        if (res.orderId) {
          try {
            localStorage.setItem('enem2026_last_order_id', res.orderId);
          } catch {
            // ignore
          }
        }
        // Redireciona o aluno diretamente para o checkout hospedado oficial da InfinitePay
        window.location.href = res.checkoutUrl;
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
      const lastOrderId = localStorage.getItem('enem2026_last_order_id') || undefined;

      // 1. Tenta verificar o status ativo do pagamento via API oficial do backend
      let paymentConfirmed = false;
      try {
        const payStatus = await paymentRepository.checkPaymentStatus(lastOrderId);
        if (payStatus.isPaid || payStatus.userStatus === 'APROVADO') {
          paymentConfirmed = true;
        }
      } catch (payErr) {
        console.warn('[PendingApproval] Erro ao consultar status do pagamento:', payErr);
      }

      // 2. Consulta a sessão atualizada do usuário no backend
      const freshUser = await authRepository.getCurrentSessionUser();
      setIsChecking(false);

      if (!freshUser) {
        onNavigate('login');
        return;
      }

      // Fail-closed absoluto: NUNCA usar flags locais ou localStorage para conceder aprovação!
      // Apenas liberar se o backend confirmou o pagamento ou se o perfil no Supabase está APROVADO
      if (paymentConfirmed || freshUser.status === 'APROVADO') {
        freshUser.status = 'APROVADO';
        db.setCurrentUser(freshUser, true);
        setCurrentUser(freshUser);
        setCheckedMessage('Parabéns! Seu pagamento foi confirmado e seu acesso está liberado!');
        setTimeout(() => onNavigate('dashboard'), 800);
        return;
      }

      db.setCurrentUser(freshUser, true);
      setCurrentUser(freshUser);

      if (freshUser.status === 'REPROVADO') {
        setCheckedMessage('Seu cadastro não foi aprovado pela administração.');
      } else {
        setCheckedMessage('Pagamento ainda não confirmado. Se você já efetuou o pagamento, aguarde alguns instantes para a compensação bancária e clique novamente em Verificar Status.');
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
                <span className="text-[11px] text-slate-400 line-through block">
                  {appliedCoupon ? 'de R$ 37,00' : 'de R$ 197,00'}
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {appliedCoupon?.finalPriceCents === 0
                    ? 'GRÁTIS (100% OFF)'
                    : `R$ ${(appliedCoupon ? appliedCoupon.finalPriceCents / 100 : 37).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </span>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">
                  {appliedCoupon
                    ? `Desconto de R$ ${(appliedCoupon.discountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Pagamento Único'}
                </span>
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

            {/* Seção de Cupom de Desconto */}
            <div className="pt-2 border-t border-slate-700/60">
              {!appliedCoupon ? (
                !showCouponInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Possui um cupom de desconto?</span>
                  </button>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-400" />
                      <span>Inserir Cupom de Desconto:</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite o código do cupom"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingCoupon}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponFeedback && (
                      <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold">
                        <span>{couponFeedback}</span>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="text-brand-400 hover:text-brand-300 underline cursor-pointer text-[10px]"
                        >
                          Recarregar página
                        </button>
                      </div>
                    )}
                  </form>
                )
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300">
                      Cupom <strong className="font-mono text-white">{appliedCoupon.coupon?.code}</strong> aplicado! (-
                      {appliedCoupon.coupon?.discountType === 'PERCENTAGE'
                        ? `${appliedCoupon.coupon.discountValue}%`
                        : `R$ ${(appliedCoupon.discountCents / 100).toFixed(2)}`}
                      )
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-400 cursor-pointer underline"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            {/* Botão Principal de Compra */}
            <button
              onClick={handleLiberarAcessoInfinitePay}
              disabled={isGeneratingCheckout}
              className={`w-full py-3.5 px-5 rounded-2xl ${
                appliedCoupon?.finalPriceCents === 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 shadow-brand-600/30'
              } hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50`}
            >
              {isGeneratingCheckout ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>
                    {appliedCoupon?.finalPriceCents === 0
                      ? 'Ativando Acesso Gratuito...'
                      : 'Gerando Checkout Seguro...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {appliedCoupon?.finalPriceCents === 0
                      ? 'ATIVAR ACESSO GRATUITO AGORA'
                      : `LIBERAR MEU ACESSO (R$ ${(appliedCoupon ? appliedCoupon.finalPriceCents / 100 : 37).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`}
                  </span>
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
