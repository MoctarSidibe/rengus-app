import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const schoolsAPI = {
  getAll: () => api.get('/schools'),
  getById: (id) => api.get(`/schools/${id}`),
  create: (schoolData) => api.post('/schools', schoolData),
  update: (id, schoolData) => api.put(`/schools/${id}`, schoolData),
  delete: (id) => api.delete(`/schools/${id}`),
  getStats: (id) => api.get(`/schools/${id}/stats`),
  getRecentActivity: (id) => api.get(`/schools/${id}/recent-activity`),
};

export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
  getDossierProgress: (id) => api.get(`/students/${id}/dossier-progress`),
  getBySchool: (schoolId) => api.get(`/students?school_id=${schoolId}`),
};

export const dossiersAPI = {
  getAll: () => api.get('/dossiers'),
  getById: (id) => api.get(`/dossiers/${id}`),
  create: (dossierData) => api.post('/dossiers', dossierData),
  update: (id, dossierData) => api.put(`/dossiers/${id}`, dossierData),
  delete: (id) => api.delete(`/dossiers/${id}`),
  getBySchool: (schoolId) => api.get(`/dossiers?school_id=${schoolId}`),
};

export const examCentersAPI = {
  getAll: () => api.get('/exam-centers'),
  getById: (id) => api.get(`/exam-centers/${id}`),
  create: (centerData) => api.post('/exam-centers', centerData),
  update: (id, centerData) => api.put(`/exam-centers/${id}`, centerData),
  delete: (id) => api.delete(`/exam-centers/${id}`),
};

export default api;