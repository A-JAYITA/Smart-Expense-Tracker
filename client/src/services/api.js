import axios from 'axios';

// Get API base URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token to requests
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

// Standardized Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract readable message from server error
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'Something went wrong';
    
    // Attach details and reject
    error.readableMessage = message;
    return Promise.reject(error);
  }
);

// API Endpoints Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const expenseService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/expenses/all', { params: filters });
    return response.data;
  },
  add: async (expenseData) => {
    const response = await api.post('/expenses/add', expenseData);
    return response.data;
  },
  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/update/${id}`, expenseData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/expenses/delete/${id}`);
    return response.data;
  },
  getByCategory: async (category) => {
    const response = await api.get(`/expenses/category/${category}`);
    return response.data;
  },
};

export const incomeService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/income/all', { params: filters });
    return response.data;
  },
  add: async (incomeData) => {
    const response = await api.post('/income/add', incomeData);
    return response.data;
  },
  update: async (id, incomeData) => {
    const response = await api.put(`/income/update/${id}`, incomeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/income/delete/${id}`);
    return response.data;
  },
};

export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
  getMonthlyTrends: async () => {
    const response = await api.get('/analytics/monthly');
    return response.data;
  },
  getCategoryBreakdown: async () => {
    const response = await api.get('/analytics/category-breakdown');
    return response.data;
  },
};

export default api;
