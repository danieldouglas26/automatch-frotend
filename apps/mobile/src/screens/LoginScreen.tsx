// apps/mobile/src/screens/LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Animated, 
  LayoutAnimation, 
  UIManager 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RegisterRequest, Role, RegisterRequestSchema, LoginRequestSchema } from '@automatch/api-client';
import Toast from 'react-native-toast-message';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen() {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLogin(prev => !prev);
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});
    setSubmitting(true);
    
    try {
      if (isLogin) {
        // Zod validation for Login
        const valResult = LoginRequestSchema.safeParse({ email, password });
        if (!valResult.success) {
          const fieldErrors: Record<string, string> = {};
          valResult.error.issues.forEach(issue => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setSubmitting(false);
          return;
        }

        await login({ email, password }, role);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Login realizado com sucesso!'
        });
      } else {
        // Zod validation for Register
        const valResult = RegisterRequestSchema.safeParse({ email, password, firstName, lastName, role });
        if (!valResult.success) {
          const fieldErrors: Record<string, string> = {};
          valResult.error.issues.forEach(issue => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setSubmitting(false);
          return;
        }

        const payload: RegisterRequest = { email, password, firstName, lastName, role };
        await register(payload);
        
        Toast.show({
          type: 'success',
          text1: 'Cadastro Concluído',
          text2: 'Digite sua senha para entrar no aplicativo.'
        });
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      const traceId = err.response?.data?.requestId;
      const baseMessage = isLogin ? 'Credenciais inválidas.' : 'Erro ao criar conta.';
      const errorMessage = traceId ? `${baseMessage}\nTrace ID: ${traceId}` : baseMessage;
      
      console.log('\n❌ --- ERRO DE AUTENTICAÇÃO ---');
      console.log('Mensagem:', err.message);
      if (err.response) {
        console.log('Backend response:', err.response.data);
      }
      console.log('-------------------------------\n');

      Toast.show({
        type: 'error',
        text1: 'Erro ao autenticar',
        text2: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImage} 
            />
            <Text style={styles.logoText}>AUTO<Text style={styles.logoWhite}>MATCH</Text></Text>
            <Text style={styles.subtitle}>{isLogin ? 'Acesse sua conta' : 'Crie sua conta de usuário'}</Text>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === Role.CLIENT && styles.roleActive]} 
              onPress={() => setRole(Role.CLIENT)} 
              disabled={submitting}
            >
              <Text style={[styles.roleText, role === Role.CLIENT && styles.roleTextActive]}>Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === Role.MECHANIC && styles.roleActive]} 
              onPress={() => setRole(Role.MECHANIC)} 
              disabled={submitting}
            >
              <Text style={[styles.roleText, role === Role.MECHANIC && styles.roleTextActive]}>Oficina</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput 
                  style={[
                    styles.input, 
                    focusedField === 'firstName' && styles.inputFocused,
                    errors.firstName && styles.inputError,
                    submitting && { opacity: 0.5 }
                  ]} 
                  placeholder="Nome" 
                  placeholderTextColor="#71717a" 
                  value={firstName} 
                  onChangeText={setFirstName} 
                  editable={!submitting}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              
              <View style={{ flex: 1 }}>
                <TextInput 
                  style={[
                    styles.input, 
                    focusedField === 'lastName' && styles.inputFocused,
                    errors.lastName && styles.inputError,
                    submitting && { opacity: 0.5 }
                  ]} 
                  placeholder="Sobrenome" 
                  placeholderTextColor="#71717a" 
                  value={lastName} 
                  onChangeText={setLastName} 
                  editable={!submitting}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput 
              style={[
                styles.input, 
                focusedField === 'email' && styles.inputFocused,
                errors.email && styles.inputError,
                submitting && { opacity: 0.5 }
              ]} 
              placeholder="E-mail" 
              placeholderTextColor="#71717a" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              editable={!submitting}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput 
              style={[
                styles.input, 
                focusedField === 'password' && styles.inputFocused,
                errors.password && styles.inputError,
                submitting && { opacity: 0.5 }
              ]} 
              placeholder="Senha" 
              placeholderTextColor="#71717a" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              editable={!submitting}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={toggleMode} disabled={submitting}>
            <Text style={[styles.switchText, submitting && { opacity: 0.5 }]}>
              {isLogin ? 'Não possui conta? Cadastre-se' : 'Já possui conta? Faça Login'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#09090b' 
  },
  scroll: { 
    padding: 24, 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  innerContainer: {
    width: '100%',
  },
  header: { 
    marginBottom: 32, 
    alignItems: 'center' 
  },
  logoImage: { 
    width: 90, 
    height: 90, 
    resizeMode: 'contain', 
    marginBottom: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#27272a',
    backgroundColor: '#18181b'
  },
  logoText: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: '#6366f1', 
    letterSpacing: 3 
  },
  logoWhite: { 
    color: '#ffffff' 
  },
  subtitle: { 
    color: '#a1a1aa', 
    marginTop: 8, 
    fontSize: 15,
    fontWeight: '500'
  },
  roleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#18181b', 
    borderRadius: 14, 
    padding: 4, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a'
  },
  roleButton: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10 
  },
  roleActive: { 
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },
  roleText: { 
    color: '#a1a1aa', 
    fontWeight: '600',
    fontSize: 14
  },
  roleTextActive: { 
    color: '#ffffff' 
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: 16 
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%'
  },
  input: { 
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
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500'
  },
  submitButton: { 
    backgroundColor: '#4f46e5', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    height: 56,
    justifyContent: 'center'
  },
  submitText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 0.5
  },
  switchButton: { 
    marginTop: 28, 
    alignItems: 'center' 
  },
  switchText: { 
    color: '#818cf8', 
    fontWeight: '600',
    fontSize: 14
  }
});