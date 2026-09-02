import apiClient from './client';

export const usersApi = {
  getProfile: async (username) => {
    return apiClient.get(`/users/${username}`);
  },

  updateProfile: async (profileData) => {
    return apiClient.patch('/users/me', profileData);
  },

  updatePins: async (animeIds) => {
    return apiClient.put('/users/me/pins', { animeIds });
  },
};

export const statsApi = {
  getMyStats: async () => {
    return apiClient.get('/statistics/me');
  },

  getUserStats: async (username) => {
    return apiClient.get(`/statistics/users/${username}`);
  },
};
