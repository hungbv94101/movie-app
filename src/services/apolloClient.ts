import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from zustand auth storage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Add gql to the client for easy access
(apolloClient as any).gql = gql;

// GraphQL Queries
export const SEARCH_MOVIES = `
  query SearchMovies(
    $query: String
    $page: Int = 1
    $limit: Int = 12
    $genre: String
    $year: String
    $rating: String
    $sortBy: String = "relevance"
    $sortOrder: String = "desc"
  ) {
    searchMovies(
      query: $query
      page: $page
      limit: $limit
      genre: $genre
      year: $year
      rating: $rating
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        id
        imdbID
        title
        year
        rated
        runtime
        genre
        director
        actors
        plot
        language
        country
        poster
        ratings {
          Source
          Value
        }
        imdbRating
        type
        favorited_by_count
        is_favorited
        created_at
        updated_at
      }
      pagination {
        current_page
        last_page
        per_page
        total
        has_more_pages
      }
      filters {
        query
        genre
        year
        rating
        sort_by
        sort_order
      }
    }
  }
`;

export const GET_MOVIES = `
  query GetMovies(
    $page: Int = 1
    $limit: Int = 12
    $genre: String
    $year: String
    $sortBy: String = "created_at"
    $sortOrder: String = "desc"
  ) {
    movies(
      page: $page
      limit: $limit
      genre: $genre
      year: $year
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        id
        imdbID
        title
        year
        rated
        runtime
        genre
        director
        actors
        plot
        language
        country
        poster
        ratings {
          Source
          Value
        }
        imdbRating
        type
        favorited_by_count
        is_favorited
        created_at
        updated_at
      }
      pagination {
        current_page
        last_page
        per_page
        total
        has_more_pages
      }
      filters {
        query
        genre
        year
        rating
        sort_by
        sort_order
      }
    }
  }
`;

export const GET_MOVIE = `
  query GetMovie($id: ID!) {
    movie(id: $id) {
      id
      imdbID
      title
      year
      rated
      runtime
      genre
      director
      actors
      plot
      language
      country
      poster
      ratings {
        Source
        Value
      }
      imdbRating
      type
      favorited_by_count
      is_favorited
      created_at
      updated_at
    }
  }
`;

// Export ApolloProvider for easy access
export { ApolloProvider };