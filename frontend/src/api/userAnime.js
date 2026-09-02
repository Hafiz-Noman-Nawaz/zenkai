import apiClient from './client';

export const userAnimeApi = {
  getMyList: async (params = {}) => {
    return apiClient.get('/my-anime', { params });
  },

  getUserLibrary: async (params = {}) => {
    return apiClient.get('/my-anime', { params });
  },

  getWatching: async (params = {}) => {
    return apiClient.get('/my-anime/watching', { params });
  },

  getCompleted: async (params = {}) => {
    return apiClient.get('/my-anime/completed', { params });
  },

  getPlanToWatch: async (params = {}) => {
    return apiClient.get('/my-anime/plan-to-watch', { params });
  },

  getOnHold: async (params = {}) => {
    return apiClient.get('/my-anime/on-hold', { params });
  },

  getDropped: async (params = {}) => {
    return apiClient.get('/my-anime/dropped', { params });
  },

  getFavorites: async (params = {}) => {
    return apiClient.get('/my-anime/favorites', { params });
  },

  getEntry: async (animeId) => {
    return apiClient.get(`/my-anime/${animeId}`);
  },

  upsertEntry: async (animeId, data = {}) => {
    const payload = typeof animeId === 'object' ? animeId : { animeId, ...data };
    return apiClient.post('/my-anime', payload);
  },

  addOrUpdateAnime: async (data) => {
    return apiClient.post('/my-anime', data);
  },

  addOrUpdate: async (data) => {
    return apiClient.post('/my-anime', data);
  },

  updateProgress: async (animeId, progress) => {
    return apiClient.patch(`/my-anime/${animeId}/progress`, { progress });
  },

  updateScore: async (animeId, score) => {
    return apiClient.patch(`/my-anime/${animeId}/score`, { score });
  },

  toggleFavorite: async (animeId, isFavorite) => {
    return apiClient.patch(`/my-anime/${animeId}/favorite`, { isFavorite });
  },

  removeEntry: async (animeId) => {
    return apiClient.delete(`/my-anime/${animeId}`);
  },
};
