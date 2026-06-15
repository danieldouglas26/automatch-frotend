import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RegisterRequest, Role } from '@automatch/api-client';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(Role.CLIENT);
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
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Login realizado com sucesso!'
        });
      } else {
        const payload: RegisterRequest = { email, password, firstName, lastName, role };
        await register(payload);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Conta criada! Digite sua senha para entrar.'
        });
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const baseMessage = isLogin ? 'Credenciais inválidas.' : 'Erro ao criar conta.';
      const errorMessage = traceId ? `${baseMessage}\nTrace ID: ${traceId}` : baseMessage;
      
      // ==== LOGS PARA DEBUG NO TERMINAL DO EXPO ====
      console.log('\n❌ --- ERRO DE AUTENTICAÇÃO ---');
      console.log('Mensagem de erro:', err.message);
      
      if (err.response) {
        console.log('Status HTTP:', err.response.status);
        console.log('Resposta do Backend:', err.response.data);
      } else if (err.request) {
        console.log('⚠️ Nenhuma resposta do servidor. Erro de rede ou CORS.');
      } else {
        console.log('Erro desconhecido:', err);
      }
      console.log('-------------------------------\n');

      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: '#27272a' }} 
          />
          <Text style={styles.logo}>AUTO<Text style={styles.logoWhite}>MATCH</Text></Text>
          <Text style={styles.subtitle}>{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === Role.CLIENT && styles.roleActive]} onPress={() => setRole(Role.CLIENT)} disabled={submitting}>
            <Text style={[styles.roleText, role === Role.CLIENT && styles.roleTextActive]}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === Role.MECHANIC && styles.roleActive]} onPress={() => setRole(Role.MECHANIC)} disabled={submitting}>
            <Text style={[styles.roleText, role === Role.MECHANIC && styles.roleTextActive]}>Oficina</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }, submitting && { opacity: 0.5 }]} placeholder="Nome" placeholderTextColor="#71717a" value={firstName} onChangeText={setFirstName} editable={!submitting} />
            <TextInput style={[styles.input, { flex: 1 }, submitting && { opacity: 0.5 }]} placeholder="Sobrenome" placeholderTextColor="#71717a" value={lastName} onChangeText={setLastName} editable={!submitting} />
          </View>
        )}

        <TextInput style={[styles.input, submitting && { opacity: 0.5 }]} placeholder="E-mail" placeholderTextColor="#71717a" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!submitting} />
        <TextInput style={[styles.input, submitting && { opacity: 0.5 }]} placeholder="Senha" placeholderTextColor="#71717a" value={password} onChangeText={setPassword} secureTextEntry editable={!submitting} />

        <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.5 }, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={handleSubmit} disabled={submitting}>
          {submitting && <ActivityIndicator size="small" color="#fff" />}
          <Text style={styles.submitText}>{submitting ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)} disabled={submitting}>
          <Text style={[styles.switchText, submitting && { opacity: 0.5 }]}>{isLogin ? 'Não possui conta? Cadastre-se' : 'Já possui conta? Faça Login'}</Text>
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