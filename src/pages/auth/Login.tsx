import React, { useState } from 'react';
import { db } from '../../db/storage';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface LoginProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = db.login(email, password);
      setLoading(false);

      if (res.user && (res.status === 'PENDENTE_APROVACAO' || res.status === 'REPROVADO')) {
        onNavigate('pending-approval');
        return;
      }

      if (res.success && res.user) {
        onLoginSuccess();
        if (res.user.role === 'ADMINISTRADOR') {
          onNavigate('admin');
        } else {
          onNavigate('dashboard');
        }
      } else {
        setError(res.error || 'Credenciais inválidas.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto my-6 bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 backdrop-blur-md relative z-10 space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Página Inicial
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            ENEM 2026 <span className="text-brand-400">PRO</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Acesse seu ambiente de estudos e simulados.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-slate-300 block mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-300 block mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-brand-600"
              />
              <span>Lembrar de mim</span>
            </label>

            <button
              type="button"
              onClick={() => alert('Para redefinir sua senha, entre em contato com o suporte institucional ou a coordenação pedagógica.')}
              className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
            >
              Esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            {loading ? 'Validando Acesso...' : 'Entrar na Plataforma'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Ainda não tem acesso?{' '}
            <button
              type="button"
              onClick={() => onNavigate('cadastro')}
              className="text-brand-400 font-bold hover:underline cursor-pointer"
            >
              Criar Conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
