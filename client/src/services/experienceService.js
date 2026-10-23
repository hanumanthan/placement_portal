import api from './api';

export const experienceService = {
  // Get experiences list with filters and pagination
  getExperiences: async (params = {}) => {
    const response = await api.get('/experiences', { params });
    return response.data;
  },

  // Get single experience by ID
  getExperienceById: async (id) => {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  },

  // Get filter dropdown options
  getFilterOptions: async () => {
    const response = await api.get('/experiences/filters');
    return response.data;
  },

  // Admin: Create experience
  createExperience: async (data) => {
    const response = await api.post('/experiences', data);
    return response.data;
  },

  // Admin: Update experience
  updateExperience: async (id, data) => {
    const response = await api.put(`/experiences/${id}`, data);
    return response.data;
  },

  // Admin: Delete experience
  deleteExperience: async (id) => {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  },
};

export default experienceService;
