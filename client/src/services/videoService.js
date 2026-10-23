import api from './api';

export const videoService = {
  // Get videos list with filters and watch progress
  getVideos: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  // Get video categories
  getCategories: async () => {
    const response = await api.get('/videos/categories');
    return response.data;
  },

  // Get single video by ID
  getVideoById: async (id) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  // Toggle watch progress
  toggleProgress: async (id) => {
    const response = await api.post(`/videos/${id}/progress`);
    return response.data;
  },

  // Admin: Create video
  createVideo: async (data) => {
    const response = await api.post('/videos', data);
    return response.data;
  },

  // Admin: Update video
  updateVideo: async (id, data) => {
    const response = await api.put(`/videos/${id}`, data);
    return response.data;
  },

  // Admin: Delete video
  deleteVideo: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },
};

export default videoService;
