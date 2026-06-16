// apps/web/src/components/Navbar.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Mapeia caminhos amigáveis para títulos no Navbar
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/visao-geral':
        return 'Visão Geral';
      case '/buscar':
        return 'Buscar Profissionais';
      case '/agendamentos':
        return 'Meus Agendamentos';
      case '/catalogo':
        return 'Gerenciar Catálogo';
      case '/solicitacoes':
        return 'Serviços Solicitados';
      case '/configuracoes':
        return 'Configurações de Perfil';
      default:
        return 'Painel de Controle';
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar} 
          className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden focus:outline-none"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h2 className="text-zinc-400 font-medium text-sm hidden sm:block">
          Painel de Controle / <span className="text-white font-semibold">{getPageTitle(pathname)}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden xs:block">
          <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-zinc-400 capitalize">{user?.role === 'MECHANIC' ? 'Mecânico Parceiro' : 'Cliente'}</p>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
          {user?.firstName ? user.firstName[0] : 'U'}
        </div>

        <button 
          onClick={logout}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-all border border-zinc-700 font-semibold"
        >
          Sair
        </button>
      </div>
    </header>
  );
}