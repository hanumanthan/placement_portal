import api from './api';

export const authService = {
  // Student registration
  studentRegister: async (studentData) => {
    const response = await api.post('/auth/student/register', studentData);
    return response.data;
  },

  // Student login
  studentLogin: async ({ identifier, password }) => {
    const response = await api.post('/auth/student/login', { identifier, password });
    return response.data;
  },

  // Admin login
  adminLogin: async ({ email, password }) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user session
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
