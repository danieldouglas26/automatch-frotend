// apps/web/src/app/(dashboard)/catalog/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalService, UpdateProfessionalRequest } from '@automatch/api-client';
import { toast } from 'react-hot-toast';

export default function CatalogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [specialty, setSpecialty] = useState('Mecânico Geral');
  const [services, setServices] = useState('Troca de Óleo, Freios');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'MECHANIC') {
      router.replace('/visao-geral');
    }
  }, [user, router]);

  if (!user || user.role !== 'MECHANIC') return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload: UpdateProfessionalRequest = {
        firstName,
        lastName,
        specialty,
        services: services.split(',').map(s => s.trim()),
        active: true
      };
      await ProfessionalService.update(user.id, payload);
      toast.success("Perfil atualizado no catálogo!");
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { requestId?: string } } };
      const traceId = errorResponse.response?.data?.requestId;
      toast.error(`Erro ao atualizar perfil. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm max-w-2xl animate-fade-in">
      <h2 className="text-base sm:text-lg font-semibold mb-6 text-white">Meu Perfil Profissional (Catálogo)</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm text-zinc-400">Nome</label>
            <input 
              type="text" 
              required 
              disabled={isUpdating} 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50 text-sm animate-pulse-once" 
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm text-zinc-400">Sobrenome</label>
            <input 
              type="text" 
              required 
              disabled={isUpdating} 
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
              className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50 text-sm" 
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs sm:text-sm text-zinc-400">Especialidade Principal</label>
          <input 
            type="text" 
            required 
            disabled={isUpdating} 
            value={specialty} 
            onChange={e => setSpecialty(e.target.value)} 
            placeholder="Ex: Mecânico de Motores" 
            className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50 text-sm" 
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm text-zinc-400">Serviços Oferecidos (separados por vírgula)</label>
          <input 
            type="text" 
            required 
            disabled={isUpdating} 
            value={services} 
            onChange={e => setServices(e.target.value)} 
            placeholder="Ex: Alinhamento, Balanceamento, Troca de Óleo" 
            className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50 text-sm" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isUpdating} 
          className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm text-white"
        >
          {isUpdating && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{isUpdating ? 'Salvando...' : 'Atualizar Catálogo'}</span>
        </button>
      </form>
    </div>
  );
}
