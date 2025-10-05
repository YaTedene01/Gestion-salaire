import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, déconnexion
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      localStorage.removeItem('selectedCompanyId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const companyAPI = {
  create: (companyData) => {
    // Si c'est déjà un FormData, l'utiliser directement
    if (companyData instanceof FormData) {
      return api.post('/companies', companyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Sinon, construire un FormData
    const formData = new FormData();
    Object.keys(companyData).forEach(key => {
      if (companyData[key] !== null && companyData[key] !== undefined) {
        formData.append(key, companyData[key]);
      }
    });
    return api.post('/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
  setActive: (id, isActive) => api.patch(`/companies/${id}/active`, { isActive }),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const employeeAPI = {
  create: (employeeData) => api.post('/employees', employeeData),
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/employees?${params}`);
  },
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  setActive: (id, isActive) => api.patch(`/employees/${id}/active`, { isActive }),
};

export const paymentAPI = {
  create: (paymentData) => {
    const formData = new FormData();
    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== null && paymentData[key] !== undefined) {
        formData.append(key, paymentData[key]);
      }
    });
    return api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
};

export default api;