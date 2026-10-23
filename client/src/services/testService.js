import api from './api';

export const testService = {
  // Get all tests (with query filters)
  getAllTests: async (params = {}) => {
    const response = await api.get('/tests', { params });
    return response.data;
  },

  // Get single test metadata & questions
  getTestById: async (id) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  // Start or resume test
  startTest: async (id) => {
    const response = await api.post(`/tests/${id}/start`);
    return response.data;
  },

  // Submit test answers
  submitTest: async (attemptId, answers) => {
    const response = await api.post(`/tests/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  // Get attempt result and detailed review
  getAttemptResult: async (attemptId) => {
    const response = await api.get(`/tests/attempts/${attemptId}/result`);
    return response.data;
  },

  // Get student's past attempts
  getMyAttempts: async () => {
    const response = await api.get('/tests/my-attempts');
    return response.data;
  },

  // Get test stats and leaderboard
  getTestStats: async (id) => {
    const response = await api.get(`/tests/${id}/stats`);
    return response.data;
  },

  // Admin: Create test
  createTest: async (data) => {
    const response = await api.post('/tests', data);
    return response.data;
  },

  // Admin: Update test
  updateTest: async (id, data) => {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
  },

  // Admin: Delete test
  deleteTest: async (id) => {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
  },

  // Admin: Add question
  addQuestion: async (testId, data) => {
    const response = await api.post(`/tests/${testId}/questions`, data);
    return response.data;
  },

  // Admin: Update question
  updateQuestion: async (questionId, data) => {
    const response = await api.put(`/tests/questions/${questionId}`, data);
    return response.data;
  },

  // Admin: Delete question
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/tests/questions/${questionId}`);
    return response.data;
  },
};

export default testService;
