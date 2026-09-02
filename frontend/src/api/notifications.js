import apiClient from './client';

export const notificationApi = {
  getUserRadar: async () => {
    return apiClient.get('/notifications/radar');
  },
  dispatchRadarAlerts: async () => {
    return apiClient.post('/notifications/dispatch-radar-alerts');
  },
  sendTestAiringEmail: async () => {
    return apiClient.post('/notifications/test-airing-email');
  },
  sendTestAnnouncementEmail: async () => {
    return apiClient.post('/notifications/test-announcement-email');
  },
  sendTestEmail: async () => {
    return apiClient.post('/notifications/test-email');
  },
};
