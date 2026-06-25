import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request Interceptor: Automatically attaches the PKI system JWT token
api.interceptors.request.use((config) => {
  // Prioritise the PKI system token; fall back to better-auth-jwt only if absent
  const token = localStorage.getItem('token') || localStorage.getItem('better-auth-jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
