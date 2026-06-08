// packages/api-client/src/api.ts
import axios from 'axios';

// A URL base virá das variáveis de ambiente de cada App (Web ou Mobile)
const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor de Request (Aqui injetaremos o JWT do IAM Service no futuro)
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Buscar token do Zustand/Storage
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response (Ideal para lidar com refresh token e erros globais)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: Lógica de logout ou Refresh Token automático
      console.warn('Usuário não autorizado ou token expirado');
    }
    return Promise.reject(error);
  }
);