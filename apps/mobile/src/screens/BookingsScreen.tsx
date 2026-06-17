// tela de listagem de agendamentos no app
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';
import { BookingService, ProfessionalService } from '@automatch/api-client';
import Toast from 'react-native-toast-message';

export default function BookingsScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
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
    async function loadBookings() {
      if (!user) return;
      try {
        setLoading(true);
        // busca agendamentos reais e catalogo de profissionais da api
        const [apiBookings, catalog] = await Promise.all([
          BookingService.list({ clientId: user.id }),
          ProfessionalService.search()
        ]);

        // mapeia profissionais por ID
        const catalogMap: Record<string, { name: string; specialty: string }> = {};
        catalog.forEach((prof: any) => {
          if (prof.id) {
            catalogMap[prof.id] = {
              name: `${prof.firstName} ${prof.lastName}`,
              specialty: prof.specialty
            };
          }
        });

        // fallback do cache local
        const stored = await SecureStore.getItemAsync('automatch_bookings');
        const localCache = stored ? JSON.parse(stored) : [];

        // mescla api com local
        const mergedBookings = apiBookings.map((apiBooking: any) => {
          const matchedLocal = localCache.find((lc: any) => lc.id === apiBooking.id);
          const matchedCatalog = catalogMap[apiBooking.professionalId];
          
          let formattedTime = apiBooking.appointmentTime;
          if (apiBooking.appointmentTime && apiBooking.appointmentTime.includes('T')) {
            const date = new Date(apiBooking.appointmentTime);
            formattedTime = date.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }

          return {
            id: apiBooking.id,
            professionalName: matchedCatalog?.name || matchedLocal?.professionalName || "Oficina Parceira",
            specialty: matchedCatalog?.specialty || matchedLocal?.specialty || "Serviço Mecânico",
            serviceName: apiBooking.serviceName || "Revisão Geral",
            appointmentTime: formattedTime,
            status: apiBooking.status || "PENDENTE"
          };
        });

        setBookings(mergedBookings);
      } catch (err: any) {
        console.error("Erro ao carregar agendamentos do mobile", err);
        const traceId = err.response?.data?.requestId;
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar agendamentos',
          text2: traceId ? `Trace ID: ${traceId}` : 'Por favor, tente novamente'
        });
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
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
          <Text style={styles.title}>Meus Agendamentos</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#4f46e5" style={{ flex: 1 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você não possui nenhum agendamento.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.professionalName}</Text>
                  <Text style={styles.cardTag}>{item.specialty}</Text>
                </View>
                <View style={[styles.statusTag, item.status === 'APROVADO' ? styles.statusApproved : item.status === 'REJEITADO' ? styles.statusRejected : styles.statusPending]}>
                  <Text style={[styles.statusText, item.status === 'APROVADO' ? styles.statusTextApproved : item.status === 'REJEITADO' ? styles.statusTextRejected : styles.statusTextPending]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.bodyText}>Serviço: <Text style={styles.bodyTextBold}>{item.serviceName}</Text></Text>
                <Text style={styles.bodyText}>Data/Hora: <Text style={styles.bodyTextBold}>{item.appointmentTime}</Text></Text>
              </View>
            </View>
          )}
        />
      )}
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
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 40
  },
  emptyText: { 
    color: '#71717a', 
    fontSize: 15,
    textAlign: 'center'
  },
  list: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  card: { 
    backgroundColor: '#18181b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    gap: 12
  },
  cardTitle: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
  cardTag: { 
    color: '#818cf8', 
    marginTop: 4, 
    fontSize: 13, 
    fontWeight: '600' 
  },
  statusTag: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8, 
    borderWidth: 1 
  },
  statusApproved: { 
    backgroundColor: '#22c55e10', 
    borderColor: '#22c55e30' 
  },
  statusRejected: { 
    backgroundColor: '#ef444410', 
    borderColor: '#ef444430' 
  },
  statusPending: { 
    backgroundColor: '#eab30810', 
    borderColor: '#eab30830' 
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  statusTextApproved: { 
    color: '#4ade80' 
  },
  statusTextRejected: { 
    color: '#f87171' 
  },
  statusTextPending: { 
    color: '#facc15' 
  },
  cardBody: { 
    marginTop: 16, 
    borderTopWidth: 1, 
    borderColor: '#27272a', 
    paddingTop: 12 
  },
  bodyText: { 
    color: '#a1a1aa', 
    fontSize: 13, 
    marginBottom: 6 
  },
  bodyTextBold: { 
    color: '#fff', 
    fontWeight: '500' 
  }
});
