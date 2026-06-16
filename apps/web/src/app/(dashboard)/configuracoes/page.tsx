// apps/web/src/app/(dashboard)/settings/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl space-y-6 shadow-sm max-w-xl animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-white">Configurações do Perfil</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs sm:text-sm text-zinc-400 block font-medium">Nome Completo</label>
          <p className="text-white font-semibold mt-1 text-sm sm:text-base bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800">
            {user.firstName} {user.lastName}
          </p>
        </div>
        
        <div>
          <label className="text-xs sm:text-sm text-zinc-400 block font-medium">Endereço de E-mail</label>
          <p className="text-white font-semibold mt-1 text-sm sm:text-base bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 break-all">
            {user.email}
          </p>
        </div>

        <div>
          <label className="text-xs sm:text-sm text-zinc-400 block font-medium">Tipo de Conta</label>
          <div className="mt-2">
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-indigo-500/20 font-bold uppercase tracking-wider">
              {user.role === 'MECHANIC' ? 'Mecânico / Oficina' : 'Cliente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
