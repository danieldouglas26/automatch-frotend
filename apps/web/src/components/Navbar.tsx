// apps/web/src/components/Navbar.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Placeholder para busca ou título da página interna */}
        <h2 className="text-zinc-400 font-medium text-sm hidden sm:block">Painel de Controle / Visão Geral</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-zinc-400 capitalize">{user?.role === 'MECHANIC' ? 'Mecânico Parceiro' : 'Cliente'}</p>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
          {user?.firstName ? user.firstName[0] : 'U'}
        </div>

        <button 
          onClick={logout}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-all border border-zinc-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
}