import { create } from 'zustand';
import type { Movie } from '../types';
import { movieGraphQLService } from '../services/movieGraphQLService';
import { localStorageUtils } from '../utils';

interface MovieGraphQLStore {
  // State
  movies: Movie[];
  searchResults: Movie[];
  currentMovie: Movie | null;
  favoriteIds: number[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  hasSearched: boolean;

  // Search filters
  filters: {
    genre?: string;
    year?: string;
    rating?: string;
    sortBy: string;
    sortOrder: string;
  };

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMovies: (movies: Movie[]) => void;
  setCurrentMovie: (movie: Movie | null) => void;
  setFavoriteIds: (ids: number[]) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasSearched: (searched: boolean) => void;
  setFilters: (filters: Partial<MovieGraphQLStore['filters']>) => void;
  
  // GraphQL API Actions
  fetchMovies: (page?: number) => Promise<void>;
  searchMovies: (query: string, page?: number) => Promise<void>;
  fetchMovieById: (id: string) => Promise<void>;
  toggleFavorite: (imdbID: string) => void;
  isFavorited: (imdbID: string) => boolean;
  loadFavoritesFromStorage: () => void;
  clearSearch: () => void;
  resetFilters: () => void;
  testGraphQLConnection: () => Promise<any>;
}

export const useMovieGraphQLStore = create<MovieGraphQLStore>((set, get) => ({
  // Initial state
  movies: [],
  searchResults: [],
  currentMovie: null,
  favoriteIds: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  hasSearched: false,

  filters: {
    sortBy: 'created_at',
    sortOrder: 'desc',
  },

  // Basic setters
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setMovies: (movies) => set({ movies }),
  setCurrentMovie: (movie) => set({ currentMovie: movie }),
  setFavoriteIds: (ids) => set({ favoriteIds: ids }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setHasSearched: (searched) => set({ hasSearched: searched }),
  setFilters: (newFilters) => set(state => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

  // Fetch movies from GraphQL API
  fetchMovies: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await movieGraphQLService.getMovies(page, {
        limit: 12,
        genre: filters.genre,
        year: filters.year,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      
      set({
        movies: response.data,
        currentPage: response.current_page,
        totalPages: response.last_page,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch movies',
        isLoading: false,
      });
    }
  },

  // Search movies using GraphQL
  searchMovies: async (query, page = 1) => {
    // If query is empty, fetch all movies and put them in searchResults
    if (!query.trim()) {
      set({ 
        isLoading: true,
        searchQuery: '',
        hasSearched: true,
        error: null
      });
      
      try {
        const { filters } = get();
        const response = await movieGraphQLService.getMovies(page, {
          limit: 12,
          genre: filters.genre,
          year: filters.year,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });
        
        set({
          searchResults: response.data, // Put all movies in searchResults for consistent display
          currentPage: response.current_page,
          totalPages: response.last_page,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch movies',
          isLoading: false,
          searchResults: [],
          currentPage: 1,
          totalPages: 1,
        });
      }
      return;
    }

    // Frontend validation
    const cleanQuery = query.trim().toLowerCase();
    
    if (cleanQuery.length < 2) {
      set({
        searchResults: [],
        error: 'Search query must be at least 2 characters long',
        isLoading: false,
        hasSearched: true,
        searchQuery: query,
        currentPage: 1,
        totalPages: 1,
      });
      return;
    }

    // Reject purely symbol queries
    if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]+$/.test(cleanQuery)) {
      set({
        searchResults: [],
        error: 'Please use meaningful search terms like movie titles, actor names, or keywords.',
        isLoading: false,
        hasSearched: true,
        searchQuery: query,
        currentPage: 1,
        totalPages: 1,
      });
      return;
    }

    set({ 
      isLoading: true, 
      error: null, 
      searchQuery: query, 
      hasSearched: true,
      searchResults: [] // Clear old results when starting new search
    });
    
    try {
      const { filters } = get();
      const response = await movieGraphQLService.searchMovies(query, page, {
        limit: 12,
        genre: filters.genre,
        year: filters.year,
        rating: filters.rating,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      set({
        searchResults: response.data,
        currentPage: response.current_page,
        totalPages: response.last_page,
        isLoading: false,
      });
    } catch (error) {
      let errorMessage = 'Failed to search movies';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({
        searchResults: [], // Clear old results on error
        error: errorMessage,
        isLoading: false,
        currentPage: 1,
        totalPages: 1,
      });
    }
  },

  // Fetch movie details
  fetchMovieById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const movie = await movieGraphQLService.getMovieById(id);
      set({
        currentMovie: movie,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch movie details',
        isLoading: false,
      });
    }
  },

  // Toggle favorite status (still using localStorage for now)
  toggleFavorite: (imdbID: string) => {
    const movieId = parseInt(imdbID.replace('tt', ''), 10);
    const { favoriteIds } = get();
    const newFavoriteIds = favoriteIds.includes(movieId)
      ? favoriteIds.filter(id => id !== movieId)
      : [...favoriteIds, movieId];

    set({ favoriteIds: newFavoriteIds });
    localStorageUtils.setFavoriteIds(newFavoriteIds);
  },

  // Check if movie is favorited
  isFavorited: (imdbID: string) => {
    const movieId = parseInt(imdbID.replace('tt', ''), 10);
    return get().favoriteIds.includes(movieId);
  },

  // Load favorites from localStorage
  loadFavoritesFromStorage: () => {
    const favoriteIds = localStorageUtils.getFavoriteIds();
    set({ favoriteIds });
  },

  // Clear search and return to movies list
  clearSearch: () => {
    set({
      searchResults: [],
      searchQuery: '',
      hasSearched: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
    });
    // Load default movies if not already loaded
    const { movies, fetchMovies } = get();
    if (movies.length === 0) {
      fetchMovies(1);
    }
  },

  // Reset all filters
  resetFilters: () => {
    set({
      filters: {
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
    });
  },

  // Test function for GraphQL connectivity
  testGraphQLConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await movieGraphQLService.getMovies(1, { limit: 5 });
      set({ isLoading: false });
      return response;
    } catch (error) {
      console.error('❌ GraphQL connection test failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'GraphQL connection test failed',
        isLoading: false 
      });
      throw error;
    }
  },
}));

// Export test function globally for easy browser console testing
if (typeof window !== 'undefined') {
  (window as any).testGraphQLConnection = () => {
    return useMovieGraphQLStore.getState().testGraphQLConnection();
  };
  (window as any).testGraphQLSearch = (query: string) => {
    return useMovieGraphQLStore.getState().searchMovies(query, 1);
  };
}