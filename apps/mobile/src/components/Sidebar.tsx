// apps/mobile/src/components/Sidebar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export default function Sidebar({ isOpen, onClose, onNavigate, currentRoute }: SidebarProps) {
  const { user, logout } = useAuth();
  
  // Local state to keep drawer mounted during animation out
  const [visible, setVisible] = useState(isOpen);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const navItem = (title: string, route: string) => {
    const isActive = currentRoute === route;
    return (
      <TouchableOpacity 
        style={[styles.navItem, isActive && styles.navItemActive]} 
        onPress={() => { onNavigate(route); onClose(); }}
        activeOpacity={0.7}
      >
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Semi-transparent backdrop with fade animation */}
      <Animated.View style={[styles.backdropContainer, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.backdropPressable} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      
      {/* Sliding Drawer Menu */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.logo}>AUTO<Text style={styles.logoWhite}>MATCH</Text></Text>
          
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{user?.firstName?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userRole}>
                {user?.role === 'MECHANIC' ? 'Mecânico Parceiro' : 'Cliente'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.navContainer}>
          {navItem('Visão Geral', 'Dashboard')}
          
          {user?.role === 'CLIENT' ? (
            <>
              {navItem('Buscar Profissionais', 'Search')}
              {navItem('Meus Agendamentos', 'Bookings')}
            </>
          ) : (
            <>
               {navItem('Meu Catálogo', 'Catalog')}
               {navItem('Serviços Solicitados', 'Requests')}
            </>
          )}

          {navItem('Configurações', 'Settings')}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutTxt}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    zIndex: 100, 
    flexDirection: 'row' 
  },
  backdropContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.65)' 
  },
  backdropPressable: { 
    flex: 1 
  },
  drawer: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: DRAWER_WIDTH, 
    backgroundColor: '#09090b', 
    borderRightWidth: 1, 
    borderColor: '#27272a', 
    paddingTop: 60,
    paddingBottom: 40,
    flexDirection: 'column'
  },
  header: { 
    paddingHorizontal: 24, 
    paddingBottom: 24, 
    borderBottomWidth: 1, 
    borderColor: '#18181b' 
  },
  logo: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#6366f1', 
    letterSpacing: 2, 
    marginBottom: 24 
  },
  logoWhite: { 
    color: '#ffffff' 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a'
  },
  avatar: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#4f46e5', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  avatarText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  userName: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  userRole: { 
    color: '#a1a1aa', 
    fontSize: 11,
    marginTop: 2
  },
  navContainer: { 
    padding: 16, 
    flex: 1,
    marginTop: 12
  },
  navItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  navItemActive: { 
    backgroundColor: '#4f46e510', 
    borderColor: '#4f46e525', 
    borderWidth: 1 
  },
  navIcon: { 
    fontSize: 18, 
    marginRight: 12 
  },
  navText: { 
    color: '#a1a1aa', 
    fontWeight: '600', 
    fontSize: 15 
  },
  navTextActive: { 
    color: '#818cf8',
    fontWeight: '700'
  },
  footer: { 
    paddingHorizontal: 24, 
    paddingTop: 16,
    borderTopWidth: 1, 
    borderColor: '#18181b' 
  },
  logoutBtn: { 
    backgroundColor: '#18181b', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#27272a' 
  },
  logoutTxt: { 
    color: '#ef4444', 
    fontWeight: '700',
    fontSize: 14
  }
});