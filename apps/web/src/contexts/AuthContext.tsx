'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, LoginRequest, RegisterUserRequest } from '@automatch/api-client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'MECHANIC';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest, role: 'CLIENT' | 'MECHANIC') => Promise<void>;
  register: (data: RegisterUserRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('@AutoMatch:token');
    const savedUser = localStorage.getItem('@AutoMatch:user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest, selectedRole: 'CLIENT' | 'MECHANIC') => {
    const response = await AuthService.login(credentials);
    
    // Mockamos os dados do usuário para refletir no frontend
    const mockUser: User = {
      // Usamos o ID fixo do mock Python para o Mecânico para permitir o update depois
      id: selectedRole === 'MECHANIC' ? "4fa85f64-5717-4562-b3fc-2c963f66afa7" : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      firstName: credentials.email.split('@')[0].toUpperCase(),
      lastName: selectedRole === 'MECHANIC' ? '(Oficina)' : '(Cliente)',
      email: credentials.email,
      role: selectedRole
    };

    localStorage.setItem('@AutoMatch:token', response.token);
    localStorage.setItem('@AutoMatch:user', JSON.stringify(mockUser));
    
    setToken(response.token);
    setUser(mockUser);
    router.push('/');
  };

  const register = async (data: RegisterUserRequest) => {
    // 1. Chama o endpoint de registro
    await AuthService.register(data);
    // 2. Faz o login automático após o cadastro
    await login({ email: data.email, password: data.password }, data.role);
  };

  const logout = () => {
    localStorage.removeItem('@AutoMatch:token');
    localStorage.removeItem('@AutoMatch:user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}