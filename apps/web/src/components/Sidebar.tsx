// apps/web/src/components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
      isActive 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 font-semibold shadow-sm' 
        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
    }`;
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 h-screen transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-xl font-black tracking-wider text-indigo-400">
            AUTO<span className="text-white">MATCH</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          <Link 
            href="/visao-geral"
            onClick={onClose}
            className={getLinkClass('/visao-geral')}
          >
            Visão Geral
          </Link>

          {user?.role === 'CLIENT' ? (
            <>
              <Link 
                href="/buscar"
                onClick={onClose}
                className={getLinkClass('/buscar')}
              >
                Buscar Profissionais
              </Link>
              <Link 
                href="/agendamentos"
                onClick={onClose}
                className={getLinkClass('/agendamentos')}
              >
                Meus Agendamentos
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/catalogo"
                onClick={onClose}
                className={getLinkClass('/catalogo')}
              >
                Meu Catálogo
              </Link>
              <Link 
                href="/solicitacoes"
                onClick={onClose}
                className={getLinkClass('/solicitacoes')}
              >
                Serviços Solicitados
              </Link>
            </>
          )}

          <Link 
            href="/configuracoes"
            onClick={onClose}
            className={getLinkClass('/configuracoes')}
          >
            Configurações
          </Link>
        </nav>
      </div>

      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
        <p className="text-xs text-zinc-400">Precisando de suporte?</p>
        <a href="#" className="text-xs text-indigo-400 font-semibold hover:underline block mt-1">Falar com Central</a>
      </div>
    </aside>
  );
}