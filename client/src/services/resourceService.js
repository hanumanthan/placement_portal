import api from './api';

export const resourceService = {
  // Get resources list with filters
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  // Get resource categories
  getCategories: async () => {
    const response = await api.get('/resources/categories');
    return response.data;
  },

  // Get single resource by ID
  getResourceById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  // Admin: Create resource
  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },

  // Admin: Update resource
  updateResource: async (id, data) => {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  // Admin: Delete resource
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};

export default resourceService;
