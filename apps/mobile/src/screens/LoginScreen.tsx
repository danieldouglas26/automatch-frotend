import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RegisterUserRequest } from '@automatch/api-client';

export default function LoginScreen() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'CLIENT' | 'MECHANIC'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email, password }, role);
      } else {
        const payload: RegisterUserRequest = { email, password, firstName, lastName, role };
        await register(payload);
      }
    } catch (err: any) {
      // ==== LOGS PARA DEBUG NO TERMINAL DO EXPO ====
      console.log('\n❌ --- ERRO DE AUTENTICAÇÃO ---');
      console.log('Mensagem de erro:', err.message);
      
      if (err.response) {
        // O servidor respondeu com um status de erro (ex: 400, 401, 404, 500)
        console.log('Status HTTP:', err.response.status);
        console.log('Resposta do Backend:', err.response.data);
      } else if (err.request) {
        // A requisição foi feita, mas não houve resposta (Erro de Rede/CORS/IP errado)
        console.log('⚠️ Nenhuma resposta do servidor. Erro de rede ou CORS.');
        console.log('DICA: O seu app mobile está conseguindo acessar a URL do seu .env?');
      } else {
        // Algo aconteceu ao montar a requisição
        console.log('Erro desconhecido:', err);
      }
      console.log('-------------------------------\n');
      // =============================================

      Alert.alert('Erro', isLogin ? 'Credenciais inválidas.' : 'Erro ao criar conta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>AUTO<Text style={styles.logoWhite}>MATCH</Text></Text>
          <Text style={styles.subtitle}>{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === 'CLIENT' && styles.roleActive]} onPress={() => setRole('CLIENT')}>
            <Text style={[styles.roleText, role === 'CLIENT' && styles.roleTextActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'MECHANIC' && styles.roleActive]} onPress={() => setRole('MECHANIC')}>
            <Text style={[styles.roleText, role === 'MECHANIC' && styles.roleTextActive]}>Oficina</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Nome" placeholderTextColor="#71717a" value={firstName} onChangeText={setFirstName} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Sobrenome" placeholderTextColor="#71717a" value={lastName} onChangeText={setLastName} />
          </View>
        )}

        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#71717a" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#71717a" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>{isLogin ? 'Não possui conta? Cadastre-se' : 'Já possui conta? Faça Login'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 32, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '900', color: '#818cf8', letterSpacing: 2 },
  logoWhite: { color: '#ffffff' },
  subtitle: { color: '#a1a1aa', marginTop: 8, fontSize: 16 },
  roleContainer: { flexDirection: 'row', backgroundColor: '#18181b', borderRadius: 12, padding: 4, marginBottom: 24 },
  roleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  roleActive: { backgroundColor: '#4f46e5' },
  roleText: { color: '#a1a1aa', fontWeight: '600' },
  roleTextActive: { color: '#ffffff' },
  row: { flexDirection: 'row', marginBottom: 16 },
  input: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 12, padding: 16, color: '#fff', marginBottom: 16, fontSize: 16 },
  submitButton: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#818cf8', fontWeight: '600' }
});