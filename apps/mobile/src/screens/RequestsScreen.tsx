// apps/mobile/src/screens/RequestsScreen.tsx
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

export default function RequestsScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
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
    async function loadRequests() {
      try {
        const stored = await SecureStore.getItemAsync('automatch_requests');
        if (stored) {
          setRequests(JSON.parse(stored));
        } else {
          const defaultRequests: any[] = [];
          await SecureStore.setItemAsync('automatch_requests', JSON.stringify(defaultRequests));
          setRequests(defaultRequests);
        }
      } catch (err) {
        console.error("Erro ao obter solicitações", err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updated);
    await SecureStore.setItemAsync('automatch_requests', JSON.stringify(updated));

    try {
      const storedBookings = await SecureStore.getItemAsync('automatch_bookings');
      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        const updatedBookings = bookings.map((b: any) => b.id === id ? { ...b, status: newStatus } : b);
        await SecureStore.setItemAsync('automatch_bookings', JSON.stringify(updatedBookings));
      }
    } catch (e) {
      console.log("Erro ao atualizar agendamentos pareados", e);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Serviços Solicitados</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#4f46e5" style={{ flex: 1 }} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.clientName}</Text>
                  <Text style={styles.cardTag}>{item.clientEmail}</Text>
                </View>
                {item.status !== 'PENDENTE' && (
                  <View style={[styles.statusTag, item.status === 'APROVADO' ? styles.statusApproved : styles.statusRejected]}>
                    <Text style={[styles.statusText, item.status === 'APROVADO' ? styles.statusTextApproved : styles.statusTextRejected]}>
                      {item.status}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.bodyText}>Serviço solicitado: <Text style={styles.bodyTextBold}>{item.serviceName}</Text></Text>
                <Text style={styles.bodyText}>Horário sugerido: <Text style={styles.bodyTextBold}>{item.appointmentTime}</Text></Text>
              </View>

              {item.status === 'PENDENTE' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.approveBtn} 
                    onPress={() => handleStatusChange(item.id, 'APROVADO')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.approveTxt}>Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectBtn} 
                    onPress={() => handleStatusChange(item.id, 'REJEITADO')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectTxt}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    color: '#a1a1aa', 
    marginTop: 2, 
    fontSize: 13 
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
  cardBody: { 
    marginTop: 14, 
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
  },
  actionRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 20 
  },
  approveBtn: { 
    flex: 1, 
    backgroundColor: '#16a34a', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  approveTxt: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  rejectBtn: { 
    flex: 1, 
    backgroundColor: '#27272a', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#3f3f46' 
  },
  rejectTxt: { 
    color: '#a1a1aa', 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});
