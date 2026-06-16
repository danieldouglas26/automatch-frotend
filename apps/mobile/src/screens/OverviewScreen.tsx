// apps/mobile/src/screens/OverviewScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function OverviewScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookingsCount: 0, rating: '4.8 ★', status: 'Ativo' });
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        if (user?.role === 'CLIENT') {
          const stored = await SecureStore.getItemAsync('automatch_bookings');
          const bookings = stored ? JSON.parse(stored) : [];
          setStats({ bookingsCount: bookings.length, rating: '12 / 15', status: 'Excelente' });
        } else {
          const stored = await SecureStore.getItemAsync('automatch_requests');
          const requests = stored ? JSON.parse(stored) : [];
          const approved = requests.filter((r: any) => r.status === 'APROVADO').length;
          setStats({
            bookingsCount: requests.length,
            rating: requests.length > 0 ? `${Math.min(5.0, 4.5 + (approved * 0.1)).toFixed(1)} ★` : '4.8 ★',
            status: 'Visível'
          });
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>{user?.role === 'MECHANIC' ? 'Mecânico / Oficina' : 'Cliente AutoMatch'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Bem-vindo ao AutoMatch!</Text>
          <Text style={styles.bannerDesc}>
            {user?.role === 'CLIENT'
              ? 'Encontre os melhores profissionais para o seu veículo com rapidez e segurança.'
              : 'Gerencie seu catálogo e receba solicitações de serviço de clientes próximos.'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#4f46e5" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{user?.role === 'CLIENT' ? 'Agendamentos' : 'Serviços'}</Text>
              <Text style={styles.statVal}>{stats.bookingsCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{user?.role === 'CLIENT' ? 'Oficinas' : 'Avaliação'}</Text>
              <Text style={styles.statVal}>{stats.rating}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[styles.statVal, { color: '#818cf8', fontSize: 16, marginTop: 12 }]}>{stats.status}</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instruções do Projeto</Text>
          <Text style={styles.cardText}>
            • Use o menu lateral (☰) no canto superior esquerdo para navegar pelas abas.{'\n\n'}
            • Qualquer agendamento criado no perfil de Cliente ficará disponível imediatamente em "Meus Agendamentos" e também aparecerá para os Mecânicos.{'\n\n'}
            • Todos os endpoints essenciais (autenticação, cadastro, busca de catálogo e criação de agendamento) chamam a VPS com rastreamento de Trace ID.
          </Text>
        </View>
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
  greeting: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  role: { 
    color: '#a1a1aa', 
    fontSize: 14 
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
  banner: { 
    backgroundColor: '#4f46e510', 
    borderWidth: 1, 
    borderColor: '#4f46e525', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24 
  },
  bannerTitle: { 
    color: '#818cf8', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  bannerDesc: { 
    color: '#a1a1aa', 
    fontSize: 14, 
    lineHeight: 20 
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: '#18181b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 14, 
    padding: 16, 
    alignItems: 'center' 
  },
  statLabel: { 
    color: '#a1a1aa', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  statVal: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 8 
  },
  card: { 
    backgroundColor: '#18181b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 16, 
    padding: 20 
  },
  cardTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  cardText: { 
    color: '#a1a1aa', 
    fontSize: 13, 
    lineHeight: 22 
  }
});
