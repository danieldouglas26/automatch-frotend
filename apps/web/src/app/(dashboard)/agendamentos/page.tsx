// apps/web/src/app/(dashboard)/bookings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LocalBooking {
  id: string;
  professionalName: string;
  specialty: string;
  serviceName: string;
  appointmentTime: string;
  status: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [bookings] = useState<LocalBooking[]>(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('@AutoMatch:bookings');
      return data ? JSON.parse(data) : [];
    }
    return [];
  });

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-white">Meus Agendamentos</h2>
      {bookings.length === 0 ? (
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
