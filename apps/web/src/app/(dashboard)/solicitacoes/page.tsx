// apps/web/src/app/(dashboard)/solicitacoes/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@automatch/api-client';
import { toast } from 'sonner';

interface LocalRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

interface LocalCacheRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

import { BookingResponse } from '@automatch/api-client';

interface ApiBookingItem extends BookingResponse {
  serviceName?: string;
  clientEmail?: string;
}

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<LocalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'MECHANIC') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  useEffect(() => {
    async function loadRequests() {
      if (!user || user.role !== 'MECHANIC') return;
      try {
        setLoading(true);
        // Busca todas as solicitações deste profissional na API
        const apiBookings = await BookingService.list({ professionalId: user.id });
        
        // Obtém o cache local para mesclar detalhes visuais adicionais
        const localCache: LocalCacheRequest[] = JSON.parse(localStorage.getItem('@AutoMatch:requests') || '[]');
        
        const mergedRequests = apiBookings.map((apiBooking: ApiBookingItem) => {
          const matchedLocal = localCache.find((lc: LocalCacheRequest) => lc.id === apiBooking.id);
          
          let formattedTime = apiBooking.appointmentTime;
          if (apiBooking.appointmentTime && apiBooking.appointmentTime.includes('T')) {
            const date = new Date(apiBooking.appointmentTime);
            formattedTime = date.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }

          return {
            id: apiBooking.id || '',
            clientName: matchedLocal?.clientName || "Cliente AutoMatch",
            clientEmail: matchedLocal?.clientEmail || apiBooking.clientEmail || "cliente@automatch.com",
            serviceName: apiBooking.serviceName || "Revisão Geral",
            appointmentTime: formattedTime,
            status: apiBooking.status || "PENDENTE"
          };
        });

        setRequests(mergedRequests);
      } catch (err: unknown) {
        console.error("Erro ao carregar solicitações", err);
        const errorResponse = err as { response?: { data?: { requestId?: string } } };
        const traceId = errorResponse.response?.data?.requestId;
        toast.error(`Erro ao carregar solicitações da API. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [user]);

  if (!user || user.role !== 'MECHANIC') return null;

  const handleStatusChange = async (id: string, newStatus: string, clientEmail: string) => {
    try {
      // Chama a API PATCH para atualizar o status do agendamento
      await BookingService.updateStatus(id, { status: newStatus, clientEmail });
      
      // Atualiza o estado na UI
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Solicitação ${newStatus === 'APROVADO' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (err: unknown) {
      console.error("Erro ao atualizar status", err);
      const errorResponse = err as { response?: { data?: { requestId?: string } } };
      const traceId = errorResponse.response?.data?.requestId;
      toast.error(`Erro ao atualizar status do agendamento. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-white">Serviços Solicitados</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : requests.length === 0 ? (
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
                      onClick={() => handleStatusChange(req.id, 'APROVADO', req.clientEmail)}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex-1 sm:flex-initial text-center cursor-pointer"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleStatusChange(req.id, 'REJEITADO', req.clientEmail)}
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
