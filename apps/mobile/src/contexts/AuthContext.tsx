import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthService, LoginRequest, RegisterRequest, Role } from '@automatch/api-client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest, role: Role) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        // Chaves corrigidas sem '@' e ':'
        const savedToken = await SecureStore.getItemAsync('automatch_token');
        const savedUser = await SecureStore.getItemAsync('automatch_user');
        if (savedToken && savedUser) setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao carregar sessão", error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (credentials: LoginRequest, selectedRole: Role) => {
    const response = await AuthService.login(credentials);
    const mockUser: User = {
      id: selectedRole === Role.MECHANIC ? "4fa85f64-5717-4562-b3fc-2c963f66afa7" : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      firstName: credentials.email.split('@')[0].toUpperCase(),
      lastName: selectedRole === Role.MECHANIC ? '(Oficina)' : '(Cliente)',
      email: credentials.email,
      role: selectedRole
    };

    // Chaves corrigidas sem '@' e ':'
    await SecureStore.setItemAsync('automatch_token', response.token);
    await SecureStore.setItemAsync('automatch_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = async (data: RegisterRequest) => {
    await AuthService.register(data);
    await login({ email: data.email, password: data.password }, data.role);
  };

  const logout = async () => {
    // Chaves corrigidas sem '@' e ':'
    await SecureStore.deleteItemAsync('automatch_token');
    await SecureStore.deleteItemAsync('automatch_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado com AuthProvider');
  return context;
}