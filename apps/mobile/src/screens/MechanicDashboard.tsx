// apps/mobile/src/screens/MechanicDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Animated
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ProfessionalService, UpdateProfessionalRequest } from '@automatch/api-client';
import Toast from 'react-native-toast-message';

export default function MechanicDashboard({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [specialty, setSpecialty] = useState('Mecânico Geral');
  const [services, setServices] = useState('Troca de Óleo, Freios');
  const [isUpdating, setIsUpdating] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

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
      
      Toast.show({
        type: 'success',
        text1: 'Catálogo Atualizado',
        text2: 'Seu perfil foi atualizado com sucesso!'
      });
    } catch (err: unknown) {
      const errResponse = err as { response?: { data?: { requestId?: string } } };
      const traceId = errResponse.response?.data?.requestId;
      const msg = traceId ? `(Trace ID: ${traceId})` : '';
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar',
        text2: `Não foi possível atualizar o perfil. ${msg}`
      });
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
             <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn} activeOpacity={0.7}>
               <Text style={styles.menuIcon}>☰</Text>
             </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>Olá, {user?.firstName}!</Text>
            <Text style={styles.role}>Mecânico / Oficina</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>Meu Perfil Profissional (Catálogo)</Text>
          <Text style={styles.cardDesc}>Atualize suas informações para que os clientes te encontrem nas buscas.</Text>
          
          <View style={styles.formGroup}>
             <Text style={styles.label}>Nome</Text>
             <TextInput 
                style={[
                  styles.input, 
                  focusedField === 'firstName' && styles.inputFocused,
                  isUpdating && { opacity: 0.5 }
                ]} 
                value={firstName} 
                onChangeText={setFirstName} 
                placeholderTextColor="#71717a" 
                editable={!isUpdating} 
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
             />
          </View>
          
          <View style={styles.formGroup}>
             <Text style={styles.label}>Sobrenome</Text>
             <TextInput 
                style={[
                  styles.input, 
                  focusedField === 'lastName' && styles.inputFocused,
                  isUpdating && { opacity: 0.5 }
                ]} 
                value={lastName} 
                onChangeText={setLastName} 
                placeholderTextColor="#71717a" 
                editable={!isUpdating} 
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
             />
          </View>

          <View style={styles.formGroup}>
             <Text style={styles.label}>Especialidade Principal</Text>
             <TextInput 
                style={[
                  styles.input, 
                  focusedField === 'specialty' && styles.inputFocused,
                  isUpdating && { opacity: 0.5 }
                ]} 
                value={specialty} 
                onChangeText={setSpecialty} 
                placeholder="Ex: Eletricista Automotivo" 
                placeholderTextColor="#71717a" 
                editable={!isUpdating} 
                onFocus={() => setFocusedField('specialty')}
                onBlur={() => setFocusedField(null)}
             />
          </View>

          <View style={styles.formGroup}>
             <Text style={styles.label}>Serviços Oferecidos (separados por vírgula)</Text>
             <TextInput 
                style={[
                  styles.input, 
                  focusedField === 'services' && styles.inputFocused,
                  isUpdating && { opacity: 0.5 }
                ]} 
                value={services} 
                onChangeText={setServices} 
                placeholder="Ex: Alinhamento, Balanceamento" 
                placeholderTextColor="#71717a" 
                editable={!isUpdating}
                onFocus={() => setFocusedField('services')}
                onBlur={() => setFocusedField(null)}
             />
          </View>

          <TouchableOpacity 
            style={[
              styles.updateBtn, 
              isUpdating && { opacity: 0.7 }, 
              { flexDirection: 'row', justifyContent: 'center', gap: 8 }
            ]} 
            onPress={handleUpdate} 
            disabled={isUpdating}
            activeOpacity={0.8}
          >
             {isUpdating ? (
               <ActivityIndicator size="small" color="#fff" />
             ) : (
               <Text style={styles.updateTxt}>Atualizar Catálogo</Text>
             )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: '#818cf8', 
    fontSize: 14, 
    fontWeight: '600' 
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
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
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
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  cardDesc: { 
    color: '#a1a1aa', 
    marginTop: 8, 
    fontSize: 14, 
    marginBottom: 24,
    lineHeight: 20
  },
  formGroup: { 
    marginBottom: 16 
  },
  label: { 
    color: '#a1a1aa', 
    fontSize: 13, 
    marginBottom: 8, 
    fontWeight: '600' 
  },
  input: { 
    backgroundColor: '#09090b', 
    borderWidth: 1, 
    borderColor: '#27272a', 
    borderRadius: 12, 
    padding: 14, 
    color: '#fff', 
    fontSize: 15,
    height: 52
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b'
  },
  updateBtn: { 
    marginTop: 12, 
    backgroundColor: '#4f46e5', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },
  updateTxt: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});