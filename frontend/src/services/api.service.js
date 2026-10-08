import api from '../utils/api';

/**
 * Centralized API Service Layer
 * Wraps base axios client driven by REACT_APP_API_URL
 */

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  updateCredentials: (data) => api.put('/auth/update-credentials', data),
};

export const membersService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const plansService = {
  getAll: (params) => api.get('/plans', { params }),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

export const paymentsService = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  verify: (data) => api.post('/payments/verify', data),
};

export const exercisesService = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

export const dietService = {
  getAll: (params) => api.get('/diet', { params }),
  getMy: () => api.get('/diet/my'),
  getById: (id) => api.get(`/diet/${id}`),
  create: (data) => api.post('/diet', data),
  update: (id, data) => api.put(`/diet/${id}`, data),
  delete: (id) => api.delete(`/diet/${id}`),
};

export const storeService = {
  getProducts: (params) => api.get('/store/products', { params }),
  getProductById: (id) => api.get(`/store/products/${id}`),
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
};

export const enquiriesService = {
  create: (data) => api.post('/enquiries', data),
  getAll: (params) => api.get('/enquiries', { params }),
  update: (id, data) => api.put(`/enquiries/${id}`, data),
  reply: (id, data) => api.post(`/enquiries/${id}/reply`, data),
};

export default {
  auth: authService,
  members: membersService,
  plans: plansService,
  payments: paymentsService,
  exercises: exercisesService,
  diet: dietService,
  store: storeService,
  enquiries: enquiriesService,
};
