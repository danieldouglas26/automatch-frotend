import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onOpenMenu && (
            <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Configurações</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
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

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  menuBtn: { padding: 8, backgroundColor: '#18181b', borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  menuIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 16, padding: 20, marginBottom: 24 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  infoGroup: { marginBottom: 16 },
  label: { color: '#a1a1aa', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  value: { color: '#fff', fontSize: 16, fontWeight: '500', backgroundColor: '#09090b', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  tag: { alignSelf: 'flex-start', backgroundColor: '#4f46e520', borderWidth: 1, borderColor: '#4f46e550', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  tagTxt: { color: '#818cf8', fontWeight: 'bold', fontSize: 12 },
  logoutBtn: { backgroundColor: '#ef444415', borderColor: '#ef444430', borderWidth: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutTxt: { color: '#f87171', fontWeight: 'bold', fontSize: 16 }
});
