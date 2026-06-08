import axios from 'axios';

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
// 2. INTERFACES (Espelhando os DTOs do Java)
// ==========================================

export interface RegisterUserRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'MECHANIC';
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UpdateProfessionalRequest {
  firstName: string;
  lastName: string;
  specialty: string;
  services: string[];
  active: boolean;
}

export interface CreateBookingRequest {
  clientId: string;
  clientEmail: string;
  professionalId: string;
  professionalEmail: string;
  serviceName: string;
  appointmentTime: string; // ISO 8601 ex: 2026-07-15T14:30:00
}

// ==========================================
// 3. SERVIÇOS 
// ==========================================

export const AuthService = {
  // Equivalente a AuthController.register
  register: async (data: RegisterUserRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  // Equivalente a AuthController.login
  login: async (data: LoginRequest) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  }
};

export const ProfessionalService = {
  // Equivalente a ProfessionalController.search
  search: async (specialty?: string) => {
    const response = await api.get('/professionals/search', {
      params: specialty ? { specialty } : {}
    });
    return response.data;
  },
  
  // Equivalente a ProfessionalController.update
  update: async (id: string, data: UpdateProfessionalRequest) => {
    const response = await api.put(`/professionals/${id}`, data);
    return response.data;
  }
};

export const BookingService = {
  // Equivalente a BookingController.create
  create: async (data: CreateBookingRequest) => {
    const response = await api.post('/bookings', data);
    return response.data;
  }
};