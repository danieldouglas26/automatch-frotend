// apps/mobile/src/screens/SettingsScreen.tsx
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Configurações</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados da Conta</Text>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <Text style={styles.value}>{user?.firstName} {user?.lastName}</Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Endereço de E-mail</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Tipo de Conta</Text>
            <View style={styles.tag}>
              <Text style={styles.tagTxt}>{user?.role === 'MECHANIC' ? 'Mecânico / Oficina' : 'Cliente'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#09090b', 
    paddingTop: 60 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    paddingHorizontal: 20 
  },
  title: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  menuBtn: { 
    padding: 10, 
    backgroundColor: '#18181b', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#27272a' 
  },
  menuIcon: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  scroll: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  card: { 
    backgroundColor: '#18181b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24 
  },
  cardTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  infoGroup: { 
    marginBottom: 18 
  },
  label: { 
    color: '#a1a1aa', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  value: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '500', 
    backgroundColor: '#09090b', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#27272a' 
  },
  tag: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#4f46e515', 
    borderWidth: 1, 
    borderColor: '#4f46e535', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginTop: 4 
  },
  tagTxt: { 
    color: '#818cf8', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  logoutBtn: { 
    backgroundColor: '#ef444410', 
    borderColor: '#ef444425', 
    borderWidth: 1, 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  logoutTxt: { 
    color: '#f87171', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});
