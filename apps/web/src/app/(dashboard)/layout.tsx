// apps/web/src/app/(dashboard)/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans overflow-hidden">
      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Shared Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Shared Responsive Navbar */}
        <Navbar onOpenSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6 md:space-y-8">
          <div className="bg-gradient-to-r from-indigo-900/40 to-zinc-900 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold">Olá, {user.firstName}!</h1>
            <p className="text-zinc-400 mt-1 text-xs sm:text-sm">Bem-vindo ao seu painel AutoMatch.</p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
