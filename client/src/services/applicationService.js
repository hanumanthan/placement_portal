import api from './api';

export const applicationService = {
  // Student: Get my applications
  getMyApplications: async (status = '') => {
    const response = await api.get('/applications/my', {
      params: { status: status !== 'All' ? status : '' },
    });
    return response.data;
  },

  // Student: Withdraw application
  withdrawApplication: async (id) => {
    const response = await api.put(`/applications/${id}/withdraw`);
    return response.data;
  },

  // Admin: Get all applications with search and filters
  getAdminApplications: async (params = {}) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  // Admin: Update single application status
  updateApplicationStatus: async (id, { status, notes }) => {
    const response = await api.put(`/applications/${id}/status`, { status, notes });
    return response.data;
  },

  // Admin: Bulk update application statuses
  bulkUpdateApplicationStatus: async ({ applicationIds, status, notes }) => {
    const response = await api.post('/applications/bulk-status', { applicationIds, status, notes });
    return response.data;
  },
};

export default applicationService;
