'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterRequest, Role } from '@automatch/api-client';

export default function LoginPage() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Register
  const [role, setRole] = useState<Role>(Role.CLIENT);
  
  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login({ email, password }, role);
      } else {
        const payload: RegisterRequest = { email, password, firstName, lastName, role };
        await register(payload);
        setSuccess('Conta criada com sucesso! Digite sua senha para entrar.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const baseError = isLogin ? 'Credenciais inválidas.' : 'Erro ao criar conta. Tente novamente.';
      setError(traceId ? `${baseError} (Trace ID: ${traceId})` : baseError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-zinc-950 font-sans">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white border-r border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider text-indigo-400">AUTO<span className="text-white">MATCH</span></span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Encontre o mecânico certo para o seu veículo em minutos.</h1>
          <p className="text-zinc-400">Agendamentos inteligentes, orçamentos transparentes e profissionais homologados na palma da sua mão.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="text-sm text-zinc-400">Escolha seu tipo de perfil abaixo.</p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button type="button" onClick={() => setRole(Role.CLIENT)} className={`py-2.5 text-sm font-medium rounded-lg transition-all ${role === Role.CLIENT ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>Usuário Comum</button>
            <button type="button" onClick={() => setRole(Role.MECHANIC)} className={`py-2.5 text-sm font-medium rounded-lg transition-all ${role === Role.MECHANIC ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>Mecânico / Oficina</button>
          </div>

          {error && <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg">{error}</div>}
          {success && <div className="p-3 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Nome</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Sobrenome</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@dominio.com" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50">
              {submitting ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-400 pt-4">
            {isLogin ? "Não possui uma conta? " : "Já possui uma conta? "}
            <button onClick={handleSwitchMode} className="font-medium text-indigo-400 hover:underline">
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}