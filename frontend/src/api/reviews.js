import apiClient from './client';

export const reviewsApi = {
  getRecentReviews: async (params = {}) => {
    return apiClient.get('/reviews', { params });
  },

  updateReview: async (reviewId, reviewData) => {
    return apiClient.patch(`/reviews/${reviewId}`, reviewData);
  },

  deleteReview: async (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },

  voteHelpful: async (reviewId) => {
    return apiClient.post(`/reviews/${reviewId}/helpful`);
  },
};
