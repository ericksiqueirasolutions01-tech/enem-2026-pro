import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Shield } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">
            Aguardando Pagamento
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pagamento em Análise
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            Assim que a InfinitePay confirmar a compensação do seu Pix ou Cartão, seu acesso será liberado automaticamente.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigate('/aguardando-aprovacao')}
            className="w-full py-3 px-5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-600/20"
          >
            <span>VER STATUS DA MINHA CONTA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>InfinitePay / CloudWalk Pagamentos.</span>
        </div>
      </div>
    </div>
  );
};

