// apps/web/src/components/Sidebar.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 h-screen sticky top-0">
      <div className="space-y-8">
        <div className="text-xl font-black tracking-wider text-indigo-400">
          AUTO<span className="text-white">MATCH</span>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 transition-all">
            Visão Geral
          </a>

          {/* Renderização Condicional baseada na Role do Usuário */}
          {user?.role === 'CLIENT' ? (
            <>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                Buscar Profissionais
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                Meus Agendamentos
              </a>
            </>
          ) : (
            <>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                Meu Catálogo
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                Serviços Solicitados
              </a>
            </>
          )}

          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
            Configurações
          </a>
        </nav>
      </div>

      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
        <p className="text-xs text-zinc-400">Precisando de suporte?</p>
        <a href="#" className="text-xs text-indigo-400 font-semibold hover:underline block mt-1">Falar com Central</a>
      </div>
    </aside>
  );
}