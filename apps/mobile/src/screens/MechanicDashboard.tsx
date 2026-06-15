import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ProfessionalService, UpdateProfessionalRequest } from '@automatch/api-client';

export default function MechanicDashboard({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [specialty, setSpecialty] = useState('Mecânico Geral');
  const [services, setServices] = useState('Troca de Óleo, Freios');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const payload: UpdateProfessionalRequest = {
        firstName,
        lastName,
        specialty,
        services: services.split(',').map(s => s.trim()),
        active: true
      };
      await ProfessionalService.update(user!.id, payload);
      Alert.alert('Sucesso', '✅ Seu perfil foi atualizado no catálogo!');
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Alert.alert('Erro', `Não foi possível atualizar o perfil. ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
             <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn}>
               <Text style={styles.menuIcon}>☰</Text>
             </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>Mecânico / Oficina</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meu Perfil Profissional (Catálogo)</Text>
          <Text style={styles.cardDesc}>Atualize suas informações para que os clientes te encontrem nas buscas.</Text>
          
          <View style={styles.formGroup}>
             <Text style={styles.label}>Nome</Text>
             <TextInput style={[styles.input, isUpdating && { opacity: 0.5 }]} value={firstName} onChangeText={setFirstName} placeholderTextColor="#71717a" editable={!isUpdating} />
          </View>
          
          <View style={styles.formGroup}>
             <Text style={styles.label}>Sobrenome</Text>
             <TextInput style={[styles.input, isUpdating && { opacity: 0.5 }]} value={lastName} onChangeText={setLastName} placeholderTextColor="#71717a" editable={!isUpdating} />
          </View>

          <View style={styles.formGroup}>
             <Text style={styles.label}>Especialidade Principal</Text>
             <TextInput style={[styles.input, isUpdating && { opacity: 0.5 }]} value={specialty} onChangeText={setSpecialty} placeholder="Ex: Eletricista Automotivo" placeholderTextColor="#71717a" editable={!isUpdating} />
          </View>

          <View style={styles.formGroup}>
             <Text style={styles.label}>Serviços Oferecidos (separados por vírgula)</Text>
             <TextInput 
                style={[styles.input, isUpdating && { opacity: 0.5 }]} 
                value={services} 
                onChangeText={setServices} 
                placeholder="Ex: Alinhamento, Balanceamento" 
                placeholderTextColor="#71717a" 
                editable={!isUpdating}
             />
          </View>

          <TouchableOpacity style={[styles.updateBtn, isUpdating && { opacity: 0.5 }, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={handleUpdate} disabled={isUpdating}>
             {isUpdating && <ActivityIndicator size="small" color="#fff" />}
             <Text style={styles.updateTxt}>{isUpdating ? 'Salvando...' : 'Atualizar Catálogo'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  role: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
  logoutBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  logoutTxt: { color: '#f87171', fontWeight: 'bold' },
  menuBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  menuIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 16, padding: 20 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardDesc: { color: '#a1a1aa', marginTop: 8, fontSize: 14, marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { color: '#a1a1aa', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15 },
  updateBtn: { marginTop: 8, backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center' },
  updateTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});