'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterRequest, Role } from '@automatch/api-client';
import { toast } from 'react-hot-toast';

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
        toast.success('Login realizado com sucesso!');
      } else {
        const payload: RegisterRequest = { email, password, firstName, lastName, role };
        await register(payload);
        setSuccess('Conta criada com sucesso! Digite sua senha para entrar.');
        toast.success('Conta criada com sucesso! Faça login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const baseError = isLogin ? 'Credenciais inválidas.' : 'Erro ao criar conta. Tente novamente.';
      const fullError = traceId ? `${baseError} (Trace ID: ${traceId})` : baseError;
      setError(fullError);
      toast.error(fullError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-zinc-950 font-sans">
      <div 
        className="hidden lg:flex flex-col justify-between p-12 relative text-white border-r border-zinc-800 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/login_bg.png')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-zinc-950/80 z-0" />
        
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider text-indigo-400">AUTO<span className="text-white">MATCH</span></span>
        </div>
        
        <div className="relative z-10 space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-indigo-200">
            Encontre o mecânico certo para o seu veículo em minutos.
          </h1>
          <p className="text-zinc-300 text-sm">
            Agendamentos inteligentes, orçamentos transparentes e profissionais homologados na palma da sua mão.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center sm:items-start gap-4">
            <img 
              src="/logo.png" 
              alt="AutoMatch Logo" 
              className="h-16 w-16 object-contain rounded-2xl border border-zinc-800 p-1 bg-zinc-900 shadow-md animate-fade-in" 
            />
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
              </h2>
              <p className="text-sm text-zinc-400">Escolha seu tipo de perfil abaixo.</p>
            </div>
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
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Sobrenome</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@dominio.com" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50 hover:-translate-y-[1px] active:translate-y-0">
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