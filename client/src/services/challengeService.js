import api from './api';

export const challengeService = {
  // Student: Get today's challenge & student streak info
  getTodayChallenge: async () => {
    const response = await api.get('/challenges/today');
    return response.data;
  },

  // Student: Submit answer
  submitChallenge: async (challengeId, selectedOption) => {
    const response = await api.post(`/challenges/${challengeId}/submit`, {
      selected_option: selectedOption,
    });
    return response.data;
  },

  // Student & Admin: Top 10 leaderboard
  getLeaderboard: async () => {
    const response = await api.get('/challenges/leaderboard');
    return response.data;
  },

  // Admin: Get all challenges
  getAllChallengesAdmin: async () => {
    const response = await api.get('/challenges/admin/all');
    return response.data;
  },

  // Admin: Create challenge
  createChallengeAdmin: async (data) => {
    const response = await api.post('/challenges/admin', data);
    return response.data;
  },

  // Admin: Delete challenge
  deleteChallengeAdmin: async (id) => {
    const response = await api.delete(`/challenges/admin/${id}`);
    return response.data;
  },
};

export default challengeService;
