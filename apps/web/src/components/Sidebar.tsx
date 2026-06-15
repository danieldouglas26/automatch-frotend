// apps/web/src/components/Sidebar.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 h-screen sticky top-0">
      <div className="space-y-8">
        <div className="text-xl font-black tracking-wider text-indigo-400">
          AUTO<span className="text-white">MATCH</span>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'overview' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
          >
            Visão Geral
          </button>

          {/* Renderização Condicional baseada na Role do Usuário */}
          {user?.role === 'CLIENT' ? (
            <>
              <button 
                onClick={() => setActiveTab('search')} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'search' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                Buscar Profissionais
              </button>
              <button 
                onClick={() => setActiveTab('bookings')} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'bookings' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                Meus Agendamentos
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('catalog')} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'catalog' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                Meu Catálogo
              </button>
              <button 
                onClick={() => setActiveTab('requests')} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'requests' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
              >
                Serviços Solicitados
              </button>
            </>
          )}

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
          >
            Configurações
          </button>
        </nav>
      </div>

      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
        <p className="text-xs text-zinc-400">Precisando de suporte?</p>
        <a href="#" className="text-xs text-indigo-400 font-semibold hover:underline block mt-1">Falar com Central</a>
      </div>
    </aside>
  );
}