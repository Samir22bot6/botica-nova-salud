import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nova_salud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo amigable de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje =
      error.response?.data?.message ||
      error.message ||
      'Ocurrió un error en la comunicación con el servidor';
    return Promise.reject(new Error(mensaje));
  }
);

export default api;

