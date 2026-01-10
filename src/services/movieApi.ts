import axios from 'axios';
import type { Movie, MovieSearchResponse, Favorite, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const movieApi = {
  // Tìm kiếm phim
  searchMovies: async (query: string, page = 1): Promise<MovieSearchResponse> => {
    const response = await api.get(`/movies/search`, {
      params: { q: query, page }
    });
    return response.data;
  },

  // Lấy danh sách phim
  getMovies: async (page = 1): Promise<MovieSearchResponse> => {
    const response = await api.get(`/movies`, {
      params: { page }
    });
    return response.data;
  },

  // Lấy chi tiết phim
  getMovieById: async (id: string): Promise<ApiResponse<Movie>> => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  // Lấy danh sách phim yêu thích
  getFavorites: async (): Promise<ApiResponse<Favorite[]>> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Thêm phim vào yêu thích
  addToFavorites: async (movieId: number): Promise<ApiResponse<Favorite>> => {
    const response = await api.post('/favorites', { movie_id: movieId });
    return response.data;
  },

  // Xóa phim khỏi yêu thích
  removeFromFavorites: async (movieId: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/favorites/${movieId}`);
    return response.data;
  },
};

export default api;