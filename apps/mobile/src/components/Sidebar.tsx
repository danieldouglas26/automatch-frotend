// apps/mobile/src/components/Sidebar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export default function Sidebar({ isOpen, onClose, onNavigate, currentRoute }: SidebarProps) {
  const { user, logout } = useAuth();

  // Se não estiver aberto, não renderiza o overlay
  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose(); // Fecha o sidebar
    await logout(); // Limpa sessão
  };

  const navItem = (title: string, route: string, icon: string) => {
    const isActive = currentRoute === route;
    return (
      <TouchableOpacity 
        style={[styles.navItem, isActive && styles.navItemActive]} 
        onPress={() => { onNavigate(route); onClose(); }}
      >
        <Text style={styles.navIcon}>{icon}</Text>
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Fundo escuro clicável para fechar */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      
      {/* O Menu Lateral (Drawer) */}
      <Animated.View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.logo}>AUTO<Text style={styles.logoWhite}>MATCH</Text></Text>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{user?.firstName?.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.userRole}>{user?.role === 'MECHANIC' ? 'Oficina' : 'Cliente'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.navContainer}>
          {navItem('Visão Geral', 'Dashboard', '📊')}
          
          {user?.role === 'CLIENT' ? (
            <>
              {navItem('Buscar Profissionais', 'Search', '🔍')}
              {navItem('Meus Agendamentos', 'Bookings', '📅')}
            </>
          ) : (
            <>
               {navItem('Meu Catálogo', 'Catalog', '⚙️')}
               {navItem('Serviços Solicitados', 'Requests', '📋')}
            </>
          )}

          {navItem('Configurações', 'Settings', '🛠️')}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutTxt}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: '#09090b', borderRightWidth: 1, borderColor: '#27272a', paddingVertical: 40 },
  header: { paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderColor: '#27272a' },
  logo: { fontSize: 24, fontWeight: '900', color: '#818cf8', letterSpacing: 2, marginBottom: 24 },
  logoWhite: { color: '#ffffff' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userName: { color: '#fff', fontWeight: '600', fontSize: 16 },
  userRole: { color: '#a1a1aa', fontSize: 12 },
  navContainer: { padding: 16, flex: 1 },
  navItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  navItemActive: { backgroundColor: '#4f46e520', borderColor: '#4f46e550', borderWidth: 1 },
  navIcon: { fontSize: 18, marginRight: 12 },
  navText: { color: '#a1a1aa', fontWeight: '600', fontSize: 15 },
  navTextActive: { color: '#818cf8' },
  footer: { padding: 24, borderTopWidth: 1, borderColor: '#27272a' },
  logoutBtn: { backgroundColor: '#18181b', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#27272a' },
  logoutTxt: { color: '#ef4444', fontWeight: 'bold' }
});