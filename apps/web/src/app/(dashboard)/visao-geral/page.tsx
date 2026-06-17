// apps/web/src/app/(dashboard)/visao-geral/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@automatch/api-client';

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isClient = user?.role === 'CLIENT';
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        setLoading(true);
        let count = 0;
        if (user.role === 'CLIENT') {
          const apiBookings = await BookingService.list({ clientId: user.id });
          count = apiBookings.length;
        } else {
          const apiBookings = await BookingService.list({ professionalId: user.id });
          count = apiBookings.length;
        }
        setBookingsCount(count);
      } catch (err) {
        console.error("Erro ao obter estatísticas da API", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">
            {isClient ? 'Agendamentos Ativos' : 'Serviços Solicitados'}
          </p>
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mt-3"></div>
          ) : (
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">{bookingsCount}</p>
          )}
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
