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
import { BookingService } from '@automatch/api-client';

export default function OverviewScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user } = useAuth();
  const [bookingsCount, setBookingsCount] = useState<number>(0);
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
      if (!user) return;
      try {
        setLoading(true);
        let count = 0;
        if (user.role === 'CLIENT') {
          const apiBookings = await BookingService.list({ clientId: user.id });
          count = apiBookings.length;
        } else {
          const apiBookings = await BookingService.list({ professionalId: user.id });
          count = apiBookings.length;
        }
        setBookingsCount(count);
      } catch (err) {
        console.error("Erro ao carregar estatísticas no mobile", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>{user?.role === 'MECHANIC' ? 'Mecânico / Oficina' : 'Cliente AutoMatch'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Bem-vindo ao AutoMatch!</Text>
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
            <View style={[styles.statCard, { flex: 0, width: '100%', maxWidth: 200, alignSelf: 'flex-start' }]}>
              <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{user?.role === 'CLIENT' ? 'Agendamentos' : 'Serviços'}</Text>
              <Text style={styles.statVal}>{bookingsCount}</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instruções do Projeto</Text>
          <Text style={styles.cardText}>
            • Use o menu lateral (☰) no canto superior esquerdo para navegar pelas abas.{'\n\n'}
            • Qualquer agendamento criado no perfil de Cliente ficará disponível imediatamente em "Meus Agendamentos" e também aparecerá para os Mecânicos.
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
    fontSize: 11, 
    fontWeight: '600',
    textAlign: 'center'
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
