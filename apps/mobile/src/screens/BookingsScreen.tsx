import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function BookingsScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const stored = await SecureStore.getItemAsync('automatch_bookings');
        if (stored) {
          setBookings(JSON.parse(stored));
        } else {
          const defaultBookings = [
            {
              id: '1',
              professionalName: 'Carlos Silva (Mecânico)',
              specialty: 'Mecânica Geral',
              serviceName: 'Troca de Óleo e Filtro',
              appointmentTime: '18/06/2026 às 14:00',
              status: 'APROVADO'
            },
            {
              id: '2',
              professionalName: 'Oficina Roda Livre',
              specialty: 'Freios & Suspensão',
              serviceName: 'Revisão do Sistema de Freio',
              appointmentTime: '20/06/2026 às 09:30',
              status: 'PENDENTE'
            }
          ];
          await SecureStore.setItemAsync('automatch_bookings', JSON.stringify(defaultBookings));
          setBookings(defaultBookings);
        }
      } catch (err) {
        console.error("Erro ao obter agendamentos", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn}>
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
          <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{item.professionalName}</Text>
                  <Text style={styles.cardTag}>{item.specialty}</Text>
                </View>
                <View style={[styles.statusTag, item.status === 'APROVADO' ? styles.statusApproved : styles.statusPending]}>
                  <Text style={[styles.statusText, item.status === 'APROVADO' ? styles.statusTextApproved : styles.statusTextPending]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  menuBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  menuIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#a1a1aa', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardTag: { color: '#818cf8', marginTop: 4, fontSize: 13, fontWeight: '600' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusApproved: { backgroundColor: '#22c55e10', borderColor: '#22c55e30' },
  statusPending: { backgroundColor: '#eab30810', borderColor: '#eab30830' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextApproved: { color: '#4ade80' },
  statusTextPending: { color: '#facc15' },
  cardBody: { marginTop: 16, borderTopWidth: 1, borderColor: '#27272a', paddingTop: 12 },
  bodyText: { color: '#a1a1aa', fontSize: 13, marginBottom: 4 },
  bodyTextBold: { color: '#fff', fontWeight: '500' }
});
