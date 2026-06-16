// apps/mobile/App.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ClientDashboard from './src/screens/ClientDashboard';
import Sidebar from './src/components/Sidebar';
import MechanicDashboard from './src/screens/MechanicDashboard';
import OverviewScreen from './src/screens/OverviewScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// O Layout principal que abriga o conteúdo e a Sidebar
function MainLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Iniciamos na tela de Visão Geral (Dashboard)
  const [currentRoute, setCurrentRoute] = useState('Dashboard');

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const renderScreen = () => {
    switch (currentRoute) {
      case 'Dashboard':
        return <OverviewScreen onOpenMenu={toggleSidebar} />;
      case 'Search':
        return <ClientDashboard onOpenMenu={toggleSidebar} />;
      case 'Bookings':
        return <BookingsScreen onOpenMenu={toggleSidebar} />;
      case 'Catalog':
        return <MechanicDashboard onOpenMenu={toggleSidebar} />;
      case 'Requests':
        return <RequestsScreen onOpenMenu={toggleSidebar} />;
      case 'Settings':
        return <SettingsScreen onOpenMenu={toggleSidebar} />;
      default:
        return <OverviewScreen onOpenMenu={toggleSidebar} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      {/* Tela Atual */}
      {renderScreen()}
      
      {/* Menu Lateral Sobreposto */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={setCurrentRoute}
        currentRoute={currentRoute}
      />
    </View>
  );
}

// Verifica Autenticação antes de exibir Layout
function AuthRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!user) return <LoginScreen />;
  return <MainLayout />;
}

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#4f46e5', 
        backgroundColor: '#18181b', 
        borderLeftWidth: 6, 
        height: 'auto', 
        paddingVertical: 12, 
        borderRadius: 12, 
        borderColor: '#27272a', 
        borderWidth: 1,
        width: '90%'
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 12,
        color: '#a1a1aa',
        marginTop: 2
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#ef4444', 
        backgroundColor: '#18181b', 
        borderLeftWidth: 6, 
        height: 'auto', 
        paddingVertical: 12, 
        borderRadius: 12, 
        borderColor: '#27272a', 
        borderWidth: 1,
        width: '90%'
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 12,
        color: '#a1a1aa',
        marginTop: 2
      }}
    />
  )
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthRouter />
      <Toast position="bottom" bottomOffset={40} config={toastConfig} />
    </AuthProvider>
  );
}