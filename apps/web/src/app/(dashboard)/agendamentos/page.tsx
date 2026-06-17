// view de agendamentos do cliente
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@automatch/api-client';
import { toast } from 'react-hot-toast';

interface LocalBooking {
  id: string;
  professionalName: string;
  specialty: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

interface LocalCacheBooking {
  id: string;
  professionalName: string;
  specialty: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

import { BookingResponse } from '@automatch/api-client';

interface ApiBookingItem extends BookingResponse {
  serviceName?: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // redireciona se nao for cliente
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  useEffect(() => {
    async function loadBookings() {
      if (!user || user.role !== 'CLIENT') return;
      try {
        setLoading(true);
        // get agendamentos do backend
        const apiBookings = await BookingService.list({ clientId: user.id });
        
        // pega nomes/detalhes salvos localmente
        const localCache: LocalCacheBooking[] = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
        
        // mescla api com dados locais
        const mergedBookings = apiBookings.map((apiBooking: ApiBookingItem) => {
          const matchedLocal = localCache.find((lc: LocalCacheBooking) => lc.id === apiBooking.id);
          
          // converte data iso
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
            professionalName: matchedLocal?.professionalName || `Oficina Parceira (Ref: ${apiBooking.professionalId.substring(0, 8)})`,
            specialty: matchedLocal?.specialty || "Serviço Mecânico",
            serviceName: apiBooking.serviceName || "Revisão Geral",
            appointmentTime: formattedTime,
            status: apiBooking.status || "PENDENTE"
          };
        });

        setBookings(mergedBookings);
      } catch (err: unknown) {
        console.error("Erro ao carregar agendamentos", err);
        const errorResponse = err as { response?: { data?: { requestId?: string } } };
        const traceId = errorResponse.response?.data?.requestId;
        toast.error(`Erro ao carregar agendamentos da API. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [user]);

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-white">Meus Agendamentos</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-sm">
          Você não possui agendamentos marcados no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="font-bold text-base sm:text-lg text-white">{booking.professionalName}</h4>
                <p className="text-sm text-indigo-400 font-semibold">{booking.specialty}</p>
                <div className="mt-2 text-xs sm:text-sm text-zinc-400 space-y-0.5">
                  <p>Serviço: <span className="text-white font-medium">{booking.serviceName}</span></p>
                  <p>Data: <span className="text-white font-medium">{booking.appointmentTime}</span></p>
                </div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  booking.status === 'APROVADO' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : booking.status === 'REJEITADO'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
