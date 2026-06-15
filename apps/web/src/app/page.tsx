'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalService, BookingService, UpdateProfessionalRequest } from '@automatch/api-client';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
          
          <div className="bg-gradient-to-r from-indigo-900/40 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Olá, {user.firstName}!</h1>
            <p className="text-zinc-400 mt-1 text-sm">Bem-vindo ao seu painel AutoMatch.</p>
          </div>

          {/* Renderização condicional baseada na aba ativa */}
          {activeTab === 'overview' && <OverviewTab user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'search' && user.role === 'CLIENT' && <ClientDashboard user={user} />}
          {activeTab === 'bookings' && user.role === 'CLIENT' && <BookingsTab user={user} />}
          {activeTab === 'catalog' && user.role === 'MECHANIC' && <MechanicDashboard user={user} />}
          {activeTab === 'requests' && user.role === 'MECHANIC' && <RequestsTab user={user} />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
          
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// 1. ABA DE VISÃO GERAL (AMBOS OS PERFIS)
// =========================================================================
function OverviewTab({ user, setActiveTab }: { user: any; setActiveTab: (tab: string) => void }) {
  const isClient = user.role === 'CLIENT';
  const [stats, setStats] = useState({ bookingsCount: 0, rating: '4.8 ★', status: 'Ativo' });

  useEffect(() => {
    if (isClient) {
      const bookings = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
      setStats({ bookingsCount: bookings.length, rating: '12 / 15', status: 'Excelente' });
    } else {
      const requests = JSON.parse(localStorage.getItem('@AutoMatch:requests') || '[]');
      const approved = requests.filter((r: any) => r.status === 'APROVADO').length;
      setStats({ 
        bookingsCount: requests.length, 
        rating: requests.length > 0 ? `${Math.min(5.0, 4.5 + (approved * 0.1)).toFixed(1)} ★` : '4.8 ★', 
        status: 'Visível' 
      });
    }
  }, [isClient]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <p className="text-zinc-400 text-sm font-medium">
            {isClient ? 'Agendamentos Ativos' : 'Serviços Solicitados'}
          </p>
          <p className="text-3xl font-black text-white mt-2">{stats.bookingsCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <p className="text-zinc-400 text-sm font-medium">
            {isClient ? 'Mecânicos Disponíveis' : 'Sua Avaliação'}
          </p>
          <p className="text-3xl font-black text-white mt-2">{stats.rating}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <p className="text-zinc-400 text-sm font-medium">Status do Perfil</p>
          <p className="text-3xl font-black text-indigo-400 mt-2">{stats.status}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          {isClient ? (
            <>
              <button 
                onClick={() => setActiveTab('search')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-all shadow-lg"
              >
                Buscar Oficina / Mecânico
              </button>
              <button 
                onClick={() => setActiveTab('bookings')} 
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 font-semibold rounded-xl text-sm transition-all"
              >
                Ver Meus Agendamentos
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('catalog')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-all shadow-lg"
              >
                Gerenciar Meu Catálogo
              </button>
              <button 
                onClick={() => setActiveTab('requests')} 
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 font-semibold rounded-xl text-sm transition-all"
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

// =========================================================================
// 2. ABA DO CLIENTE: Buscar Profissionais e Agendar Serviço (Endpoints 2 e 3)
// =========================================================================
function ClientDashboard({ user }: { user: any }) {
  const [specialty, setSpecialty] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingIds, setBookingIds] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await ProfessionalService.search(specialty);
      setProfessionals(results);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      toast.error(`Erro ao buscar profissionais. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = async (prof: any) => {
    setBookingIds(prev => ({ ...prev, [prof.id]: true }));
    try {
      const response = await BookingService.create({
        clientId: user.id,
        clientEmail: user.email,
        professionalId: prof.id,
        professionalEmail: "contato@oficina.com",
        serviceName: "Revisão Geral",
        appointmentTime: new Date().toISOString()
      });

      const newBooking = {
        id: response.id || Math.random().toString(),
        professionalName: `${prof.firstName} ${prof.lastName}`,
        specialty: prof.specialty,
        serviceName: "Revisão Geral",
        appointmentTime: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
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
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      toast.error(`Erro ao tentar agendar. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
    } finally {
      setBookingIds(prev => ({ ...prev, [prof.id]: false }));
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
            disabled={isSearching}
            className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 text-white"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
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

      {professionals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Resultados ({professionals.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((prof) => (
              <div key={prof.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between animate-fade-in">
                <div>
                  <h4 className="font-bold text-lg">{prof.firstName} {prof.lastName}</h4>
                  <span className="inline-block mt-1 bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-md border border-indigo-500/20">{prof.specialty}</span>
                  <p className="text-sm text-zinc-400 mt-3">Serviços: {prof.services?.join(', ')}</p>
                </div>
                <button 
                  onClick={() => handleBooking(prof)}
                  disabled={bookingIds[prof.id]}
                  className="mt-6 w-full bg-zinc-800 hover:bg-white hover:text-black py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingIds[prof.id] && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{bookingIds[prof.id] ? 'Agendando...' : 'Agendar Serviço'}</span>
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
// 3. ABA DO CLIENTE: Meus Agendamentos
// =========================================================================
function BookingsTab({ user }: { user: any }) {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('@AutoMatch:bookings');
    if (data) {
      setBookings(JSON.parse(data));
    } else {
      const defaultBookings: any[] = [];
      localStorage.setItem('@AutoMatch:bookings', JSON.stringify(defaultBookings));
      setBookings(defaultBookings);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Meus Agendamentos</h2>
      {bookings.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400">
          Você não possui agendamentos marcados no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg text-white">{booking.professionalName}</h4>
                <p className="text-sm text-indigo-400">{booking.specialty}</p>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>Serviço: <span className="text-white font-medium">{booking.serviceName}</span></p>
                  <p>Data: <span className="text-white font-medium">{booking.appointmentTime}</span></p>
                </div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  booking.status === 'APROVADO' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
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

// =========================================================================
// 4. ABA DO MECÂNICO: Atualizar Dados do Catálogo (Endpoint 2)
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
      await ProfessionalService.update(user.id, payload);
      toast.success("Perfil atualizado no catálogo!");
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      toast.error(`Erro ao atualizar perfil. ${traceId ? `(Trace ID: ${traceId})` : ''}`);
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
            <input type="text" required disabled={isUpdating} value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50" />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Sobrenome</label>
            <input type="text" required disabled={isUpdating} value={lastName} onChange={e => setLastName(e.target.value)} className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50" />
          </div>
        </div>
        
        <div>
          <label className="text-sm text-zinc-400">Especialidade Principal</label>
          <input type="text" required disabled={isUpdating} value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Mecânico de Motores" className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50" />
        </div>

        <div>
          <label className="text-sm text-zinc-400">Serviços Oferecidos (separados por vírgula)</label>
          <input type="text" required disabled={isUpdating} value={services} onChange={e => setServices(e.target.value)} placeholder="Ex: Alinhamento, Balanceamento, Troca de Óleo" className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-white disabled:opacity-50" />
        </div>

        <button type="submit" disabled={isUpdating} className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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

// =========================================================================
// 5. ABA DO MECÂNICO: Serviços Solicitados
// =========================================================================
function RequestsTab({ user }: { user: any }) {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('@AutoMatch:requests');
    if (data) {
      setRequests(JSON.parse(data));
    } else {
      const defaultRequests: any[] = [];
      localStorage.setItem('@AutoMatch:requests', JSON.stringify(defaultRequests));
      setRequests(defaultRequests);
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updated);
    localStorage.setItem('@AutoMatch:requests', JSON.stringify(updated));

    // Também atualiza na listagem de agendamentos (se houver correspondente)
    const bookings = JSON.parse(localStorage.getItem('@AutoMatch:bookings') || '[]');
    const updatedBookings = bookings.map((b: any) => b.id === id ? { ...b, status: newStatus } : b);
    localStorage.setItem('@AutoMatch:bookings', JSON.stringify(updatedBookings));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Serviços Solicitados</h2>
      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400">
          Nenhuma solicitação de serviço recebida até o momento.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg text-white">{req.clientName}</h4>
                <p className="text-sm text-zinc-400">{req.clientEmail}</p>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>Serviço solicitado: <span className="text-white font-medium">{req.serviceName}</span></p>
                  <p>Horário sugerido: <span className="text-indigo-400 font-medium">{req.appointmentTime}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {req.status === 'PENDENTE' ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange(req.id, 'APROVADO')}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleStatusChange(req.id, 'REJEITADO')}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-zinc-700"
                    >
                      Recusar
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
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

// =========================================================================
// 6. ABA DE CONFIGURAÇÕES (AMBOS OS PERFIS)
// =========================================================================
function SettingsTab({ user }: { user: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
      <h2 className="text-xl font-bold text-white">Configurações do Perfil</h2>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm text-zinc-400 block font-medium">Nome Completo</label>
          <p className="text-white font-semibold mt-1 text-base bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800">{user.firstName} {user.lastName}</p>
        </div>
        
        <div>
          <label className="text-sm text-zinc-400 block font-medium">Endereço de E-mail</label>
          <p className="text-white font-semibold mt-1 text-base bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800">{user.email}</p>
        </div>

        <div>
          <label className="text-sm text-zinc-400 block font-medium">Tipo de Conta</label>
          <div className="mt-2">
            <span className="bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/20 font-semibold uppercase tracking-wider">
              {user.role === 'MECHANIC' ? 'Mecânico / Oficina' : 'Cliente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}