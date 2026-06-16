// apps/web/src/app/(dashboard)/search/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalService, BookingService, Professional } from '@automatch/api-client';
import { toast } from 'react-hot-toast';

// Helper functions declared outside component to remain pure during render
function generateTempId(responseId?: string): string {
  return responseId || 'temp-' + Math.random().toString(36).substring(2, 9);
}

function getCurrentISOTime(): string {
  return new Date().toISOString();
}

function getFormattedAppointmentTime(): string {
  return new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [specialty, setSpecialty] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingIds, setBookingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  if (!user || user.role !== 'CLIENT') return null;

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await ProfessionalService.search(specialty);
      setProfessionals(results);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { requestId?: string } } };
      const traceId = errorResponse.response?.data?.requestId;
      toast.error(`Erro ao buscar profissionais. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = async (prof: Professional) => {
    if (!prof.id) return;
    setBookingIds(prev => ({ ...prev, [prof.id!]: true }));
    try {
      const response = await BookingService.create({
        clientId: user.id,
        clientEmail: user.email,
        professionalId: prof.id,
        professionalEmail: "contato@oficina.com",
        serviceName: "Revisão Geral",
        appointmentTime: getCurrentISOTime()
      });

      const newBooking = {
        id: generateTempId(response.id),
        professionalName: `${prof.firstName} ${prof.lastName}`,
        specialty: prof.specialty,
        serviceName: "Revisão Geral",
        appointmentTime: getFormattedAppointmentTime(),
        status: response.status || "PENDENTE"
      };

      const existingBookings = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
      existingBookings.unshift(newBooking);
      localStorage.setItem('@AutoMatch:bookings', JSON.stringify(existingBookings));

      const newRequest = {
        id: newBooking.id,
        clientName: `${user.firstName} ${user.lastName}`,
        clientEmail: user.email,
        serviceName: "Revisão Geral",
        appointmentTime: newBooking.appointmentTime,
        status: "PENDENTE"
      };
      const existingRequests = JSON.parse(localStorage.getItem('@AutoMatch:requests') || '[]');
      existingRequests.unshift(newRequest);
      localStorage.setItem('@AutoMatch:requests', JSON.stringify(existingRequests));

      toast.success(`Agendamento com ${prof.firstName} solicitado!`);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { requestId?: string } } };
      const traceId = errorResponse.response?.data?.requestId;
      toast.error(`Erro ao tentar agendar. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setBookingIds(prev => ({ ...prev, [prof.id!]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-white">Buscar Profissionais</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Ex: Mecânico, Eletricista, Borracharia..." 
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            disabled={isSearching}
            className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50 text-white text-sm"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm text-white"
          >
            {isSearching && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSearching ? 'Buscando...' : 'Pesquisar'}</span>
          </button>
        </div>
      </div>

      {professionals.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resultados ({professionals.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {professionals.map((prof) => (
              <div key={prof.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-white">{prof.firstName} {prof.lastName}</h4>
                  <span className="inline-block mt-1 bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/20 font-semibold">{prof.specialty}</span>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-3">Serviços: {prof.services?.join(', ')}</p>
                </div>
                <button 
                  onClick={() => handleBooking(prof)}
                  disabled={bookingIds[prof.id!]}
                  className="mt-6 w-full bg-zinc-800 hover:bg-white hover:text-black py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white hover:border-white"
                >
                  {bookingIds[prof.id!] && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{bookingIds[prof.id!] ? 'Agendando...' : 'Agendar Serviço'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        specialty && !isSearching && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-sm">
            Nenhum profissional encontrado para a especialidade digitada.
          </div>
        )
      )}
    </div>
  );
}
