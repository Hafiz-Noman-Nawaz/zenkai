import apiClient from './client';

export const listApi = {
  getPublicLists: async (params = {}) => {
    return apiClient.get('/lists', { params });
  },

  getListById: async (id) => {
    return apiClient.get(`/lists/${id}`);
  },

  createList: async (listData) => {
    return apiClient.post('/lists', listData);
  },

  deleteList: async (id) => {
    return apiClient.delete(`/lists/${id}`);
  },
};
