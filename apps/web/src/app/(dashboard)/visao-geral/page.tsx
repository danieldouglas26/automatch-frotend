// apps/web/src/app/(dashboard)/overview/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isClient = user?.role === 'CLIENT';
  const [stats] = useState(() => {
    if (typeof window !== 'undefined' && user) {
      if (user.role === 'CLIENT') {
        const bookings = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
        return { bookingsCount: bookings.length, rating: '12 / 15', status: 'Excelente' };
      } else {
        const requests = JSON.parse(localStorage.getItem('@AutoMatch:requests') || '[]');
        const approved = requests.filter((r: { status: string }) => r.status === 'APROVADO').length;
        return { 
          bookingsCount: requests.length, 
          rating: requests.length > 0 ? `${Math.min(5.0, 4.5 + (approved * 0.1)).toFixed(1)} ★` : '4.8 ★', 
          status: 'Visível' 
        };
      }
    }
    return { bookingsCount: 0, rating: '4.8 ★', status: 'Ativo' };
  });

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">
            {isClient ? 'Agendamentos Ativos' : 'Serviços Solicitados'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.bookingsCount}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">
            {isClient ? 'Mecânicos Disponíveis' : 'Sua Avaliação'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.rating}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm sm:col-span-2 md:col-span-1">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">Status do Perfil</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2">{stats.status}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-white">Ações Rápidas</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {isClient ? (
            <>
              <button 
                onClick={() => router.push('/buscar')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-all shadow-lg text-center"
              >
                Buscar Oficina / Mecânico
              </button>
              <button 
                onClick={() => router.push('/agendamentos')} 
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 font-semibold rounded-xl text-sm transition-all text-center"
              >
                Ver Meus Agendamentos
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => router.push('/catalogo')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-all shadow-lg text-center"
              >
                Gerenciar Meu Catálogo
              </button>
              <button 
                onClick={() => router.push('/solicitacoes')} 
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 font-semibold rounded-xl text-sm transition-all text-center"
              >
                Ver Serviços Solicitados
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
