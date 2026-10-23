import api from './api';

export const questionService = {
  // Get questions list with filters and pagination
  getQuestions: async (params = {}) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get single question by ID
  getQuestionById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Get filter dropdown options
  getFilterOptions: async () => {
    const response = await api.get('/questions/filters');
    return response.data;
  },

  // Admin: Create question
  createQuestion: async (data) => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  // Admin: Update question
  updateQuestion: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  // Admin: Delete question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

export default questionService;
