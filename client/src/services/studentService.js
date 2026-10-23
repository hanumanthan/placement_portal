import api from './api';

export const studentService = {
  // Get aggregated dashboard data
  getDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  // Get full student profile
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  // Update profile details
  updateProfile: async (profileData) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  // Add a skill
  addSkill: async (skill_name, proficiency = 'intermediate') => {
    const response = await api.post('/students/skills', { skill_name, proficiency });
    return response.data;
  },

  // Delete a skill
  deleteSkill: async (skillId) => {
    const response = await api.delete(`/students/skills/${skillId}`);
    return response.data;
  },

  // Upload Resume PDF
  uploadResume: async (formData) => {
    const response = await api.post('/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Profile Photo
  uploadPhoto: async (formData) => {
    const response = await api.post('/students/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default studentService;
