import axios from 'axios';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  Professional, 
  UpdateProfessionalRequest, 
  BookingRequest, 
  BookingResponse 
} from '@automatch/core';
export * from '@automatch/core';

// ==========================================
// 1. CONFIGURAÇÃO BASE (api.ts)
// ==========================================
const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para enviar o token JWT
api.interceptors.request.use(
  async (config) => {
    // Lógica para pegar o token (ex: localStorage na Web ou AsyncStorage no Mobile)
    // const token = await getToken(); 
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 3. SERVIÇOS 
// ==========================================

export const AuthService = {
  // Equivalente a AuthController.register
  register: async (data: RegisterRequest): Promise<void> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  // Equivalente a AuthController.login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  }
};

export const ProfessionalService = {
  // Equivalente a ProfessionalController.search
  search: async (specialty?: string): Promise<Professional[]> => {
    const response = await api.get('/professionals/search', {
      params: specialty ? { specialty } : {}
    });
    return response.data;
  },
  
  // Equivalente a ProfessionalController.update
  update: async (id: string, data: UpdateProfessionalRequest): Promise<Professional> => {
    const response = await api.put(`/professionals/${id}`, data);
    return response.data;
  }
};

export const BookingService = {
  // Equivalente a BookingController.create
  create: async (data: BookingRequest): Promise<BookingResponse> => {
    const response = await api.post('/bookings', data);
    return response.data;
  }
};