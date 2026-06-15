// apps/mobile/src/screens/ClientDashboard.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ProfessionalService, BookingService } from '@automatch/api-client';

export default function ClientDashboard({ onOpenMenu }: { onOpenMenu?: () => void }) {
  // CORREÇÃO: Adicionamos o 'logout' aqui
  const { user, logout } = useAuth(); 
  const [specialty, setSpecialty] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const results = await ProfessionalService.search(specialty);
      setProfessionals(results);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Alert.alert('Erro', `Não foi possível buscar profissionais ${msg}`);
    }
  };

  const handleBooking = async (prof: any) => {
    try {
      await BookingService.create({
        clientId: user!.id,
        clientEmail: user!.email,
        professionalId: prof.id,
        professionalEmail: "contato@oficina.com",
        serviceName: "Agendamento via App",
        appointmentTime: new Date().toISOString()
      });
      Alert.alert('Sucesso', `✅ Agendamento com ${prof.firstName} solicitado!`);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Alert.alert('Erro', `Falha ao agendar serviço. ${msg}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER CORRIGIDO */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
             <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn}>
               <Text style={styles.menuIcon}>☰</Text>
             </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>Cliente AutoMatch</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Buscar por ex: Mecânico..." 
          placeholderTextColor="#71717a" 
          value={specialty} 
          onChangeText={setSpecialty} 
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchTxt}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={professionals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.cardTag}>{item.specialty}</Text>
            <Text style={styles.cardDesc}>Serviços: {item.services?.join(', ')}</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => handleBooking(item)}>
              <Text style={styles.bookTxt}>Agendar Serviço</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  role: { color: '#a1a1aa', fontSize: 14 },
  logoutBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  logoutTxt: { color: '#f87171', fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  input: { flex: 1, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 12, padding: 16, color: '#fff' },
  searchBtn: { backgroundColor: '#4f46e5', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12 },
  searchTxt: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardTag: { color: '#818cf8', marginTop: 4, fontSize: 14, fontWeight: '600' },
  cardDesc: { color: '#a1a1aa', marginTop: 8, fontSize: 14 },
  bookBtn: { marginTop: 16, backgroundColor: '#27272a', padding: 12, borderRadius: 8, alignItems: 'center' },
  bookTxt: { color: '#fff', fontWeight: 'bold' }, // CORREÇÃO: Adicionada a vírgula aqui
  menuBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  menuIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});