import { apolloClient, SEARCH_MOVIES, GET_MOVIES, GET_MOVIE } from './apolloClient';
import { gql } from '@apollo/client';
import type { Movie, MovieSearchResponse } from '../types';

export interface GraphQLMovieSearchResult {
  searchMovies: {
    data: Movie[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      has_more_pages: boolean;
    };
    filters: {
      query?: string;
      genre?: string;
      year?: string;
      rating?: string;
      sort_by: string;
      sort_order: string;
    };
  };
}

export interface GraphQLMoviesResult {
  movies: {
    data: Movie[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      has_more_pages: boolean;
    };
    filters: {
      query?: string;
      genre?: string;
      year?: string;
      rating?: string;
      sort_by: string;
      sort_order: string;
    };
  };
}

export interface GraphQLMovieResult {
  movie: Movie;
}

export const movieGraphQLService = {
  // Search movies using GraphQL
  searchMovies: async (
    query: string, 
    page = 1, 
    options: {
      limit?: number;
      genre?: string;
      year?: string;
      rating?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ): Promise<MovieSearchResponse> => {
    try {
      const result = await apolloClient.query<GraphQLMovieSearchResult>({
        query: gql(SEARCH_MOVIES),
        variables: {
          query,
          page,
          limit: options.limit || 12,
          genre: options.genre,
          year: options.year,
          rating: options.rating,
          sortBy: options.sortBy || 'relevance',
          sortOrder: options.sortOrder || 'desc',
        },
        fetchPolicy: 'network-only', // Force network request for debugging
        errorPolicy: 'all', // Return both data and errors
      });

      // Check for GraphQL errors in the response
      const resultAny = result as any;
      if (resultAny.errors && resultAny.errors.length > 0) {
        console.error('GraphQL Errors:', resultAny.errors);
        throw new Error(`GraphQL Error: ${resultAny.errors.map((e: any) => e.message).join(', ')}`);
      }

      if (!result.data || !result.data.searchMovies) {
        console.error('GraphQL Response:', result);
        throw new Error('GraphQL query returned no data or unexpected structure');
      }

      const searchData = result.data.searchMovies;
      
      return {
        data: searchData.data,
        current_page: searchData.pagination.current_page,
        last_page: searchData.pagination.last_page,
        per_page: searchData.pagination.per_page,
        total: searchData.pagination.total,
      };
    } catch (error) {
      console.error('GraphQL Search Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search movies');
    }
  },

  // Get movies with filtering and pagination
  getMovies: async (
    page = 1,
    options: {
      limit?: number;
      genre?: string;
      year?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ): Promise<MovieSearchResponse> => {
    try {
      const result = await apolloClient.query<GraphQLMoviesResult>({
        query: gql(GET_MOVIES),
        variables: {
          page,
          limit: options.limit || 12,
          genre: options.genre,
          year: options.year,
          sortBy: options.sortBy || 'created_at',
          sortOrder: options.sortOrder || 'desc',
        },
        fetchPolicy: 'cache-first',
      });

      // Check for GraphQL errors
      const resultAny = result as any;
      if (resultAny.errors && resultAny.errors.length > 0) {
        console.error('GraphQL Errors:', resultAny.errors);
        throw new Error(`GraphQL Error: ${resultAny.errors.map((e: any) => e.message).join(', ')}`);
      }

      if (!result.data) {
        throw new Error('GraphQL query returned no data');
      }
      const moviesData = result.data.movies;
      
      return {
        data: moviesData.data,
        current_page: moviesData.pagination.current_page,
        last_page: moviesData.pagination.last_page,
        per_page: moviesData.pagination.per_page,
        total: moviesData.pagination.total,
      };
    } catch (error) {
      console.error('GraphQL Movies Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch movies');
    }
  },

  // Get single movie by ID
  getMovieById: async (id: string): Promise<Movie> => {
    try {
      const result = await apolloClient.query<GraphQLMovieResult>({
        query: gql(GET_MOVIE),
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      // Check for GraphQL errors
      const resultAny = result as any;
      if (resultAny.errors && resultAny.errors.length > 0) {
        console.error('GraphQL Errors:', resultAny.errors);
        throw new Error(`GraphQL Error: ${resultAny.errors.map((e: any) => e.message).join(', ')}`);
      }

      if (!result.data) {
        throw new Error('GraphQL query returned no data');
      }
      return result.data.movie;
    } catch (error) {
      console.error('GraphQL Movie Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch movie details');
    }
  },
};