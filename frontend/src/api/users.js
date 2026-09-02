import apiClient from './client';

export const usersApi = {
  getProfile: async (username) => {
    return apiClient.get(`/users/${username}`);
  },

  updateProfile: async (profileData) => {
    return apiClient.patch('/users/me', profileData);
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
