import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Client-side in-memory response cache for lightning-fast navigation
const clientCache = new Map();
const CACHE_TTL_MS = 60000; // 1 minute

// Request interceptor to attach JWT token & check cache
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zenkai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only cache GET requests that do not skip cache
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = clientCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to store cache and handle unified error messages
apiClient.interceptors.response.use(
  (response) => {
    // If it was a GET request, cache the normalized response data
    if (response.config?.method === 'get' && !response.config?.skipCache) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      clientCache.set(cacheKey, {
        data: response.data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    return response.data;
  },
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      raw: error,
    };
    return Promise.reject(customError);
  }
);

export const clearClientCache = () => {
  clientCache.clear();
};

export default apiClient;
