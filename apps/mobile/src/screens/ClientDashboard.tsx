// apps/mobile/src/screens/ClientDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ProfessionalService, BookingService } from '@automatch/api-client';
import * as SecureStore from 'expo-secure-store';

export default function ClientDashboard({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth(); 
  const [specialty, setSpecialty] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingIds, setBookingIds] = useState<Record<string, boolean>>({});
  const [isFocused, setIsFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await ProfessionalService.search(specialty);
      setProfessionals(results);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Alert.alert('Erro', `Não foi possível buscar profissionais ${msg}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = async (prof: any) => {
    setBookingIds(prev => ({ ...prev, [prof.id]: true }));
    try {
      const response = await BookingService.create({
        clientId: user!.id,
        clientEmail: user!.email,
        professionalId: prof.id,
        professionalEmail: "contato@oficina.com",
        serviceName: "Agendamento via App",
        appointmentTime: new Date().toISOString()
      });

      const newBooking = {
        id: response.id || Math.random().toString(),
        professionalName: `${prof.firstName} ${prof.lastName}`,
        specialty: prof.specialty,
        serviceName: "Agendamento via App",
        appointmentTime: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: response.status || "PENDENTE"
      };

      const stored = await SecureStore.getItemAsync('automatch_bookings');
      const existingBookings = stored ? JSON.parse(stored) : [];
      existingBookings.unshift(newBooking);
      await SecureStore.setItemAsync('automatch_bookings', JSON.stringify(existingBookings));

      const newRequest = {
        id: newBooking.id,
        clientName: `${user?.firstName} ${user?.lastName}`,
        clientEmail: user?.email,
        serviceName: "Agendamento via App",
        appointmentTime: newBooking.appointmentTime,
        status: "PENDENTE"
      };
      const storedRequests = await SecureStore.getItemAsync('automatch_requests');
      const existingRequests = storedRequests ? JSON.parse(storedRequests) : [];
      existingRequests.unshift(newRequest);
      await SecureStore.setItemAsync('automatch_requests', JSON.stringify(existingRequests));

      Alert.alert('Sucesso', `✅ Agendamento com ${prof.firstName} solicitado!`);
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Alert.alert('Erro', `Falha ao agendar serviço. ${msg}`);
    } finally {
      setBookingIds(prev => ({ ...prev, [prof.id]: false }));
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
             <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
               <Text style={styles.menuIcon}>☰</Text>
             </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>Cliente AutoMatch</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH INPUT */}
      <View style={styles.searchBox}>
        <TextInput 
          style={[
            styles.input, 
            isFocused && styles.inputFocused,
            isSearching && { opacity: 0.5 }
          ]} 
          placeholder="Buscar por ex: Mecânico..." 
          placeholderTextColor="#71717a" 
          value={specialty} 
          onChangeText={setSpecialty} 
          editable={!isSearching}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity 
          style={[styles.searchBtn, isSearching && { opacity: 0.5 }]} 
          onPress={handleSearch} 
          disabled={isSearching}
          activeOpacity={0.8}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchTxt}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PROFESSIONALS LIST */}
      <FlatList
        data={professionals}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.specialty}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>Serviços: {item.services?.join(', ')}</Text>
            
            <TouchableOpacity 
              style={[
                styles.bookBtn, 
                bookingIds[item.id] && { opacity: 0.5 }, 
                { flexDirection: 'row', justifyContent: 'center', gap: 8 }
              ]} 
              onPress={() => handleBooking(item)}
              disabled={bookingIds[item.id]}
              activeOpacity={0.8}
            >
              {bookingIds[item.id] && <ActivityIndicator size="small" color="#fff" />}
              <Text style={styles.bookTxt}>{bookingIds[item.id] ? 'Agendando...' : 'Agendar Serviço'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          specialty && !isSearching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum profissional encontrado para "{specialty}"</Text>
            </View>
          ) : null
        }
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#09090b', 
    padding: 20, 
    paddingTop: 60 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
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
  logoutBtn: { 
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#18181b', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#27272a' 
  },
  logoutTxt: { 
    color: '#ef4444', 
    fontWeight: 'bold',
    fontSize: 13
  },
  searchBox: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#18181b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 14, 
    padding: 16, 
    color: '#fff',
    fontSize: 15,
    height: 56
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b'
  },
  searchBtn: { 
    backgroundColor: '#4f46e5', 
    justifyContent: 'center', 
    paddingHorizontal: 22, 
    borderRadius: 14,
    height: 56,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  searchTxt: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 15
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
    flexWrap: 'wrap',
    gap: 8
  },
  cardTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  badge: {
    backgroundColor: '#4f46e520',
    borderWidth: 1,
    borderColor: '#4f46e540',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  badgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  cardDesc: { 
    color: '#a1a1aa', 
    marginTop: 12, 
    fontSize: 14,
    lineHeight: 20 
  },
  bookBtn: { 
    marginTop: 20, 
    backgroundColor: '#27272a', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46'
  },
  bookTxt: { 
    color: '#fff', 
    fontWeight: 'bold',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center'
  }
});