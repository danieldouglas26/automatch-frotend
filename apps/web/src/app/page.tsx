'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalService, BookingService, UpdateProfessionalRequest } from '@automatch/api-client';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
          
          <div className="bg-gradient-to-r from-indigo-900/40 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Olá, {user.firstName}!</h1>
            <p className="text-zinc-400 mt-1 text-sm">Bem-vindo ao seu painel AutoMatch.</p>
          </div>

          {/* Renderiza a visão correspondente ao papel do usuário */}
          {user.role === 'CLIENT' ? <ClientDashboard user={user} /> : <MechanicDashboard user={user} />}
          
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// VISÃO DO CLIENTE: Buscar Profissionais e Agendar Serviço (Endpoints 2 e 3)
// =========================================================================
function ClientDashboard({ user }: { user: any }) {
  const [specialty, setSpecialty] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await ProfessionalService.search(specialty);
      setProfessionals(results);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      alert(`Erro ao buscar profissionais. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = async (prof: any) => {
    try {
      await BookingService.create({
        clientId: user.id,
        clientEmail: user.email,
        professionalId: prof.id,
        professionalEmail: "contato@oficina.com", // Mockado
        serviceName: "Revisão Geral",
        appointmentTime: new Date().toISOString()
      });
      alert(`✅ Agendamento com ${prof.firstName} solicitado com sucesso!`);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      alert(`Erro ao tentar agendar. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Buscar Profissionais</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Ex: Mecânico, Eletricista, Borracharia..." 
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-medium transition-all"
          >
            {isSearching ? 'Buscando...' : 'Pesquisar'}
          </button>
        </div>
      </div>

      {professionals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Resultados ({professionals.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((prof) => (
              <div key={prof.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg">{prof.firstName} {prof.lastName}</h4>
                  <span className="inline-block mt-1 bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-md border border-indigo-500/20">{prof.specialty}</span>
                  <p className="text-sm text-zinc-400 mt-3">Serviços: {prof.services?.join(', ')}</p>
                </div>
                <button 
                  onClick={() => handleBooking(prof)}
                  className="mt-6 w-full bg-zinc-800 hover:bg-white hover:text-black py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  Agendar Serviço
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// VISÃO DO MECÂNICO: Atualizar Dados do Catálogo (Endpoint 2)
// =========================================================================
function MechanicDashboard({ user }: { user: any }) {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [specialty, setSpecialty] = useState('Mecânico Geral');
  const [services, setServices] = useState('Troca de Óleo, Freios');
  const [isUpdating, setIsUpdating] = useState(false);

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
      // Usamos o user.id (que para Mecânico estamos fixando igual ao do mock Python no Login)
      await ProfessionalService.update(user.id, payload);
      alert("✅ Perfil atualizado no catálogo com sucesso!");
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      alert(`Erro ao atualizar perfil. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h2 className="text-lg font-semibold mb-6">Meu Perfil Profissional (Catálogo)</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400">Nome</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Sobrenome</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>
        
        <div>
          <label className="text-sm text-zinc-400">Especialidade Principal</label>
          <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Mecânico de Motores" className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm text-zinc-400">Serviços Oferecidos (separados por vírgula)</label>
          <input type="text" value={services} onChange={e => setServices(e.target.value)} placeholder="Ex: Alinhamento, Balanceamento, Troca de Óleo" className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>

        <button type="submit" disabled={isUpdating} className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition-all">
          {isUpdating ? 'Salvando...' : 'Atualizar Catálogo'}
        </button>
      </form>
    </div>
  );
}