import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const favoritesApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
favoritesApiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  return config;
});

// Handle 401 responses
favoritesApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth storage on 401
      localStorage.removeItem('auth-storage');
    }
    return Promise.reject(error);
  }
);

export interface FavoriteResponse {
  success: boolean;
  message?: string;
  data?: any;
  is_favorited?: boolean;
  movie_favorite_count?: number;
}

export const favoritesApi = {
  async toggle(movieId: number): Promise<FavoriteResponse> {
    const response = await favoritesApiClient.post('/favorites/toggle', {
      movie_id: movieId
    });
    return response.data;
  },

  async check(movieId: number): Promise<FavoriteResponse> {
    const response = await favoritesApiClient.get(`/favorites/check/${movieId}`);
    return response.data;
  },

  async getFavorites(page: number = 1): Promise<FavoriteResponse> {
    const response = await favoritesApiClient.get(`/favorites?page=${page}`);
    return response.data;
  },

  async remove(movieId: number): Promise<FavoriteResponse> {
    const response = await favoritesApiClient.delete(`/favorites/${movieId}`);
    return response.data;
  }
};