import apiClient from './client';

export const notificationApi = {
  sendTestEmail: async () => {
    return apiClient.post('/notifications/test-email');
  },
};
