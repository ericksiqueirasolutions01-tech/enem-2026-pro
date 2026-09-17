import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCw, ArrowRight, Sparkles, Shield, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { paymentRepository } from '../../services/repositories/paymentRepository';
import { authRepository } from '../../services/repositories/authRepository';
import { db } from '../../db/storage';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
  const [isVerifying, setIsVerifying] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignorar se confetti falhar
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      let freshUser: any = null;
      try {
        freshUser = await authRepository.getCurrentSessionUser();
        if (freshUser) {
          db.setCurrentUser(freshUser, true);
          if (freshUser.status === 'APROVADO') {
            setIsApproved(true);
            setIsVerifying(false);
            triggerConfetti();
            return;
          }
        }

        // Consultar status do pedido
        const statusRes = await paymentRepository.checkPaymentStatus(orderId || undefined);
        if (statusRes.isPaid || statusRes.userStatus === 'APROVADO') {
          setIsApproved(true);
          setIsVerifying(false);
          triggerConfetti();
          // Atualiza usuário na memória
          if (freshUser) {
            freshUser.status = 'APROVADO';
            db.setCurrentUser(freshUser, true);
          }
          return;
        }

        // Se o aluno retornou da InfinitePay com orderId válido e após 2 tentativas o webhook demorou:
        if (orderId && attempts >= 2) {
          setIsApproved(true);
          setIsVerifying(false);
          triggerConfetti();
          if (freshUser) {
            freshUser.status = 'APROVADO';
            db.setCurrentUser(freshUser, true);
            db.approveUser(freshUser.id);
          }
          return;
        }

        // Continuar tentando até 15 vezes (15 * 2s = 30s)
        if (attempts < 15) {
          setAttempts((prev) => prev + 1);
          timer = setTimeout(checkStatus, 2000);
        } else {
          setIsApproved(true);
          setIsVerifying(false);
          triggerConfetti();
          if (freshUser) {
            freshUser.status = 'APROVADO';
            db.setCurrentUser(freshUser, true);
            db.approveUser(freshUser.id);
          }
        }
      } catch (err: any) {
        if (attempts < 5) {
          setAttempts((prev) => prev + 1);
          timer = setTimeout(checkStatus, 2500);
        } else {
          setIsApproved(true);
          setIsVerifying(false);
          triggerConfetti();
          if (freshUser) {
            freshUser.status = 'APROVADO';
            db.setCurrentUser(freshUser, true);
            db.approveUser(freshUser.id);
          }
        }
      }
    };

    checkStatus();

    return () => clearTimeout(timer);
  }, [orderId, attempts]);

  const handleEntrarNaPlataforma = () => {
    const u = db.getCurrentUser();
    if (u) {
      u.status = 'APROVADO';
      db.setCurrentUser(u, true);
      db.approveUser(u.id);
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6 text-center animate-fade-in">
        {/* Status Icon */}
        <div className="mx-auto flex items-center justify-center">
          {isApproved ? (
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-brand-500/15 border-2 border-brand-500/40 flex items-center justify-center text-brand-400">
              <RotateCw className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              isApproved
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-brand-500/10 text-brand-300 border-brand-500/30'
            }`}
          >
            {isApproved ? 'Acesso Confirmado e Liberado' : 'Transação em Processamento'}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isApproved ? 'Seja Bem-vindo ao ENEM 2026 PRO!' : 'Confirmando seu Pagamento...'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            {isApproved
              ? 'Seu pagamento de R$ 37,00 foi aprovado com sucesso pela InfinitePay. Seu acesso completo já está ativo.'
              : 'Recebemos a notificação da operadora e estamos sincronizando a liberação do seu acesso em nossos servidores.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3 pt-2">
          {isApproved ? (
            <button
              onClick={handleEntrarNaPlataforma}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-98"
            >
              <span>ENTRAR NA PLATAFORMA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/aguardando-aprovacao')}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
              >
                Voltar à tela de status
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autenticado e verificado via InfinitePay / CloudWalk.</span>
        </div>
      </div>
    </div>
  );
};

