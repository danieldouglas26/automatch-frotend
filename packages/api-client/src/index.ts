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

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptador para enviar o token JWT
api.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
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
  
  // Busca o perfil de um profissional específico por ID
  get: async (id: string): Promise<Professional> => {
    const response = await api.get(`/professionals/${id}`);
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
    // Gerador de UUID compatível com Web e Mobile
    const idempotencyKey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    const response = await api.post('/bookings', data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    return response.data;
  },

  // Listagem de agendamentos com filtros e paginação
  list: async (params?: {
    status?: string;
    clientId?: string;
    professionalId?: string;
    page?: number;
    size?: number;
  }): Promise<any> => {
    const queryParams: any = { ...params };
    
    // Traduz status do front (PT) para o back (EN)
    if (queryParams.status) {
      if (queryParams.status === 'PENDENTE') queryParams.status = 'PENDING';
      else if (queryParams.status === 'APROVADO') queryParams.status = 'APPROVED';
      else if (queryParams.status === 'REJEITADO') queryParams.status = 'REJECTED';
    }

    const response = await api.get('/bookings', { params: queryParams });
    const data = response.data;

    // Função interna para mapear os status vindos do back para o front
    const mapBooking = (b: any) => ({
      ...b,
      status: b.status === 'PENDING' ? 'PENDENTE' : 
              b.status === 'APPROVED' ? 'APROVADO' : 
              b.status === 'REJECTED' ? 'REJEITADO' : b.status
    });

    // Se o back retornar estrutura paginada (com campo content), retorna apenas o array
    if (data && Array.isArray(data.content)) {
      return data.content.map(mapBooking);
    }

    // Se retornar uma lista direta
    if (Array.isArray(data)) {
      return data.map(mapBooking);
    }

    return [];
  },

  // Atualização de status de agendamento (PATCH)
  updateStatus: async (
    id: string,
    data: { status: string; clientEmail: string }
  ): Promise<any> => {
    // Traduz status do front (PT) para o back (EN)
    let backendStatus = data.status;
    if (data.status === 'PENDENTE') backendStatus = 'PENDING';
    else if (data.status === 'APROVADO') backendStatus = 'APPROVED';
    else if (data.status === 'REJEITADO') backendStatus = 'REJECTED';

    const response = await api.patch(`/bookings/${id}/status`, {
      status: backendStatus,
      clientEmail: data.clientEmail
    });
    return response.data;
  }
};