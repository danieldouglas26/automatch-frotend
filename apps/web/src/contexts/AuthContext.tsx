'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, LoginRequest, RegisterRequest, Role, setAuthToken } from '@automatch/api-client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest, role: Role) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function base64Decode(str: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let encoded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (encoded.length % 4) {
    encoded += '=';
  }
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    const idx = chars.indexOf(char);
    if (idx === -1 || char === '=') continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const decoded = base64Decode(parts[1]);
    const utf8Decoded = decodeURIComponent(
      decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(utf8Decoded);
  } catch (e) {
    try {
      return JSON.parse(base64Decode(token.split('.')[1]));
    } catch (err) {
      return null;
    }
  }
}

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
      setAuthToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest, selectedRole: Role) => {
    const response = await AuthService.login(credentials);
    const payload = decodeJWT(response.token) || {};
    
    let fName = payload.firstName || payload.given_name || '';
    let lName = payload.lastName || payload.family_name || '';
    if (!fName && payload.name) {
      const parts = payload.name.split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ');
    }
    if (!fName) {
      fName = credentials.email.split('@')[0].toUpperCase();
    }

    const mockUser: User = {
      id: payload.userId || payload.id || (selectedRole === Role.MECHANIC ? "4fa85f64-5717-4562-b3fc-2c963f66afa7" : "3fa85f64-5717-4562-b3fc-2c963f66afa6"),
      firstName: fName,
      lastName: lName,
      email: payload.sub || credentials.email,
      role: selectedRole
    };

    localStorage.setItem('@AutoMatch:token', response.token);
    localStorage.setItem('@AutoMatch:user', JSON.stringify(mockUser));
    
    setToken(response.token);
    setAuthToken(response.token);
    setUser(mockUser);
    router.push('/');
  };

  const register = async (data: RegisterRequest) => {
    // Apenas cadastra o usuário no backend, sem logar automaticamente
    await AuthService.register(data);
  };

  const logout = () => {
    localStorage.removeItem('@AutoMatch:token');
    localStorage.removeItem('@AutoMatch:user');
    setToken(null);
    setAuthToken(null);
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