import api from './api';

export const codingService = {
  // Get all coding questions
  getQuestions: async (params = {}) => {
    const response = await api.get('/coding/questions', { params });
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/coding/categories');
    return response.data;
  },

  // Get single question by ID
  getQuestionById: async (id) => {
    const response = await api.get(`/coding/questions/${id}`);
    return response.data;
  },

  // Run code against input
  runCode: async (data) => {
    const response = await api.post('/coding/run', data);
    return response.data;
  },

  // Submit code for full evaluation
  submitCode: async (id, data) => {
    const response = await api.post(`/coding/questions/${id}/submit`, data);
    return response.data;
  },

  // Get student's previous submissions for a question
  getSubmissions: async (id) => {
    const response = await api.get(`/coding/questions/${id}/submissions`);
    return response.data;
  },

  // Admin: Create coding question
  createQuestion: async (data) => {
    const response = await api.post('/coding/questions', data);
    return response.data;
  },

  // Admin: Update coding question
  updateQuestion: async (id, data) => {
    const response = await api.put(`/coding/questions/${id}`, data);
    return response.data;
  },

  // Admin: Delete coding question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/coding/questions/${id}`);
    return response.data;
  },

  // Admin: Get all submissions
  getAllSubmissions: async (params = {}) => {
    const response = await api.get('/coding/admin/submissions', { params });
    return response.data;
  },
};

export default codingService;
