import { create } from 'zustand';
import type { Movie } from '../types';
import { movieApi } from '../services';
import { movieGraphQLService } from '../services/movieGraphQLService';
import { localStorageUtils } from '../utils';
import type { AxiosError } from 'axios';

interface MovieStore {
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
  
  // API Actions
  fetchMovies: (page?: number) => Promise<void>;
  searchMovies: (query: string, page?: number) => Promise<void>;
  searchLocalMovies: (query: string, movies: Movie[]) => Movie[];
  fetchMovieById: (id: string) => Promise<void>;
  toggleFavorite: (movieId: number) => void;
  loadFavoritesFromStorage: () => void;
  clearSearch: () => void;
}

export const useMovieStore = create<MovieStore>((set, get) => ({
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

  // Fetch movies from API using GraphQL
  fetchMovies: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await movieGraphQLService.getMovies(page);
      set({
        movies: response.data,
        currentPage: response.current_page,
        totalPages: response.last_page,
        isLoading: false,
      });
    } catch (error) {
      // Fallback to REST API if GraphQL fails
      try {
        const restResponse = await movieApi.getMovies(page);
        set({
          movies: restResponse.data,
          currentPage: restResponse.current_page,
          totalPages: restResponse.last_page,
          isLoading: false,
        });
      } catch (restError) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch movies',
          isLoading: false,
        });
      }
    }
  },

  // Full-text search in local movies
  searchLocalMovies: (query: string, movies: Movie[]) => {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    return movies.filter(movie => {
      const searchableText = [
        movie.title,
        movie.year,
        movie.genre,
        movie.director, 
        movie.actors,
        movie.plot,
        movie.country,
        movie.language,
        movie.type
      ].filter(Boolean).join(' ').toLowerCase();
      
      // Check if all search terms are found in the searchable text
      return searchTerms.every(term => 
        searchableText.includes(term) || 
        searchableText.includes(term.substring(0, 3)) // Partial match for 3+ char terms
      );
    });
  },

  // Search movies
  searchMovies: async (query, page = 1) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }

    // Frontend validation - prepare for full-text search
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

    // Allow numbers and mixed content for full-text search
    // Only reject purely symbol queries
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
      // Temporary: Skip GraphQL and use REST API directly for debugging
      
      const [apiResponse, localResults] = await Promise.allSettled([
        movieApi.searchMovies(query, page),
        Promise.resolve(get().searchLocalMovies(query, get().movies))
      ]);
      
      let searchData = [];
      let currentPage = 1;
      let totalPages = 1;
      
      // Process API results
      if (apiResponse.status === 'fulfilled') {
        const response = apiResponse.value;
        
        // Transform OMDb format to frontend format
        const transformSearchResult = (movie: any) => ({
          id: null,
          imdbID: movie.imdbID || movie.imdbId,
          title: movie.title || movie.Title,
          year: movie.year || movie.Year,
          poster: movie.poster || movie.Poster,
          type: movie.type || movie.Type || 'movie',
          genre: movie.genre,
          director: movie.director,
          plot: movie.plot,
          imdbRating: movie.imdbRating,
          runtime: movie.runtime,
          language: movie.language,
          country: movie.country,
          rated: movie.rated,
          favorited_by_count: 0,
        });
        
        if (response.data && Array.isArray(response.data)) {
          searchData = response.data.map(transformSearchResult);
          currentPage = response.current_page || 1;
          totalPages = response.last_page || Math.ceil((response.total_results || 0) / 10);
        }
      }
      
      // Add local search results (from database movies) at the beginning
      if (localResults.status === 'fulfilled' && localResults.value.length > 0) {
        // Mark local results and prepend them
        const localMovies = localResults.value.map(movie => ({
          ...movie,
          isLocal: true, // Flag to identify local results
        }));
        searchData = [...localMovies, ...searchData];
      }
      
      // Remove duplicates based on imdbID
      const uniqueResults = searchData.reduce((acc, movie) => {
        const key = movie.imdbID || movie.title + movie.year;
        if (!acc.some(m => (m.imdbID === movie.imdbID && movie.imdbID) || (m.title === movie.title && m.year === movie.year))) {
          acc.push(movie);
        }
        return acc;
      }, []);
      
      set({
        searchResults: uniqueResults,
        currentPage: currentPage,
        totalPages: totalPages,
        isLoading: false,
      });
    } catch (error) {
      let errorMessage = 'Failed to search movies';
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 400) {
        errorMessage = 'Search query too short or invalid. Please use at least 3 characters.';
      } else if (axiosError.response?.status === 422) {
        errorMessage = 'Invalid search query. Please try with different keywords.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({
        searchResults: [],
        error: errorMessage,
        isLoading: false,
        currentPage: 1,
        totalPages: 1,
      });
    }
  },

  // Fetch movie details
  fetchMovieById: async (id) => {
    set({ isLoading: true, error: null, currentMovie: null });
    try {
      const response = await movieApi.getMovieById(id);
      set({
        currentMovie: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch movie details',
        isLoading: false,
      });
    }
  },

  // Toggle favorite status
  toggleFavorite: (movieId) => {
    const { favoriteIds } = get();
    const isFavorite = favoriteIds.includes(movieId);

    if (isFavorite) {
      localStorageUtils.removeFromFavorites(movieId);
      set({ favoriteIds: favoriteIds.filter(id => id !== movieId) });
    } else {
      localStorageUtils.addToFavorites(movieId);
      set({ favoriteIds: [...favoriteIds, movieId] });
    }
  },

  // Load favorites from localStorage
  loadFavoritesFromStorage: () => {
    const favoriteIds = localStorageUtils.getFavoriteIds();
    set({ favoriteIds });
  },

  // Clear search results and return to default movies
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
}));