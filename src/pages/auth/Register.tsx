import React, { useState } from 'react';
import { db } from '../../db/storage';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserTargetObjective } from '../../types';

import { authRepository } from '../../services/repositories/authRepository';

interface RegisterProps {
  onNavigate: (route: string) => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    objective: 'ENEM' as UserTargetObjective,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres para sua segurança.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const res = await authRepository.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        objective: formData.objective,
      });

      setLoading(false);
      if (res.success) {
        onRegisterSuccess();
        onNavigate('pending-approval');
      } else {
        setError(res.error || 'Erro ao realizar cadastro.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Falha na conexão ao realizar cadastro.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Glow elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto my-6 bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 backdrop-blur-md relative z-10 space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Login
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-600/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Criar sua Conta no ENEM 2026 PRO
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Preencha os dados abaixo. Após o envio, seu cadastro será analisado pela coordenação para liberação do acesso.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="text-xs font-black uppercase text-slate-300 block mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mariana Costa Ribeiro"
              className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Documento & Data Nascimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                CPF ou Documento (Opcional)
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email & Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu.email@exemplo.com"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Telefone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Senha & Confirmar Senha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Senha *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Crie sua senha"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Confirmar Senha *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repita a senha"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Cidade & Estado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: São Paulo"
                className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-300 block mb-1">
                Estado *
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="SP"
                className="w-full text-xs font-bold text-center uppercase text-white bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Objetivo do Aluno */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-black uppercase text-slate-300 block">
              Seu Objetivo Principal: *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'ENEM', label: 'ENEM 2026', desc: 'Exame Nacional' },
                { id: 'ETEC', label: 'ETEC', desc: 'Vestibulinho' },
                { id: 'VESTIBULAR', label: 'Vestibular', desc: 'USP / Unicamp / Gerais' },
              ].map((obj) => (
                <button
                  type="button"
                  key={obj.id}
                  onClick={() => setFormData({ ...formData, objective: obj.id as UserTargetObjective })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    formData.objective === obj.id
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                      : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{obj.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        formData.objective === obj.id
                          ? 'border-brand-400 bg-brand-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {formData.objective === obj.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight">{obj.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Information box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="leading-relaxed">
              Ao clicar em <strong>CRIAR CONTA</strong>, seu cadastro será registrado como <strong>Pendente de Aprovação</strong> para análise da equipe pedagógica antes da liberação dos simulados e apostilas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer mt-2"
          >
            {loading ? 'Processando Cadastro...' : 'CRIAR CONTA'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Já possui uma conta cadastrada? <strong className="text-brand-400 underline">Fazer login</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
