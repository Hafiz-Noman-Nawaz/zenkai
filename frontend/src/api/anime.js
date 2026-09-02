import apiClient from './client';

export const animeApi = {
  getAnimeList: async (params = {}) => {
    return apiClient.get('/anime', { params });
  },

  searchAnime: async (q, limit = 20) => {
    return apiClient.get('/anime/search', { params: { q, limit } });
  },

  getAnimeById: async (id) => {
    return apiClient.get(`/anime/${id}`);
  },

  getAnimeGenres: async (id) => {
    return apiClient.get(`/anime/${id}/genres`);
  },

  getAnimeStats: async (id) => {
    return apiClient.get(`/anime/${id}/stats`);
  },

  getAllGenres: async () => {
    return apiClient.get('/genres');
  },

  getWeeklySchedule: async () => {
    return apiClient.get('/anime/schedule');
  },

  getRecommendations: async (limit = 12) => {
    return apiClient.get('/anime/recommendations', { params: { limit } });
  },

  getAnimeReviews: async (animeId, params = {}) => {
    return apiClient.get(`/anime/${animeId}/reviews`, { params });
  },

  createReview: async (animeId, reviewData) => {
    return apiClient.post(`/anime/${animeId}/reviews`, reviewData);
  },

  getFranchiseRelations: async (id) => {
    return apiClient.get(`/anime/${id}/relations`);
  },
};
