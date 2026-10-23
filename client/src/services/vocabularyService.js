import api from './api';

export const vocabularyService = {
  // Student & Public: Word of the day
  getWordOfTheDay: async () => {
    const response = await api.get('/vocabulary/today');
    return response.data;
  },

  // Student & Public: Get vocabulary list
  getVocabularyList: async (params = {}) => {
    const response = await api.get('/vocabulary', { params });
    return response.data;
  },

  // Student: Update learning status ('known' or 'practice_again')
  updateStatus: async (vocabId, status) => {
    const response = await api.post(`/vocabulary/${vocabId}/status`, { status });
    return response.data;
  },

  // Admin: Create word
  createVocabAdmin: async (data) => {
    const response = await api.post('/vocabulary/admin', data);
    return response.data;
  },

  // Admin: Update word
  updateVocabAdmin: async (id, data) => {
    const response = await api.put(`/vocabulary/admin/${id}`, data);
    return response.data;
  },

  // Admin: Delete word
  deleteVocabAdmin: async (id) => {
    const response = await api.delete(`/vocabulary/admin/${id}`);
    return response.data;
  },
};

export default vocabularyService;
