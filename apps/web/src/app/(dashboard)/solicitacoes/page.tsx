// apps/web/src/app/(dashboard)/requests/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LocalRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

interface LocalBooking {
  id: string;
  professionalName: string;
  specialty: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<LocalRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('@AutoMatch:requests');
      return data ? JSON.parse(data) : [];
    }
    return [];
  });

  useEffect(() => {
    if (user && user.role !== 'MECHANIC') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  if (!user || user.role !== 'MECHANIC') return null;

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updated);
    localStorage.setItem('@AutoMatch:requests', JSON.stringify(updated));

    // Também atualiza na listagem de agendamentos (se houver correspondente)
    const bookings = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
    const updatedBookings = bookings.map((b: LocalBooking) => b.id === id ? { ...b, status: newStatus } : b);
    localStorage.setItem('@AutoMatch:bookings', JSON.stringify(updatedBookings));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-white">Serviços Solicitados</h2>
      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-sm">
          Nenhuma solicitação de serviço recebida até o momento.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="font-bold text-base sm:text-lg text-white">{req.clientName}</h4>
                <p className="text-xs sm:text-sm text-zinc-400">{req.clientEmail}</p>
                <div className="mt-2 text-xs sm:text-sm text-zinc-400 space-y-0.5">
                  <p>Serviço solicitado: <span className="text-white font-medium">{req.serviceName}</span></p>
                  <p>Horário sugerido: <span className="text-indigo-400 font-medium">{req.appointmentTime}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {req.status === 'PENDENTE' ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleStatusChange(req.id, 'APROVADO')}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex-1 sm:flex-initial text-center cursor-pointer"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleStatusChange(req.id, 'REJEITADO')}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-zinc-700 flex-1 sm:flex-initial text-center cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    req.status === 'APROVADO' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
