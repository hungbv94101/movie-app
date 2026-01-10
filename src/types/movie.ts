export interface Movie {
  id?: number | null;
  imdbID?: string;
  title: string;
  year?: string | null;
  rated?: string;
  released?: string;
  runtime?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  poster?: string;
  ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  type?: string;
  dvd?: string;
  boxOffice?: string;
  production?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  favorited_by_count?: number; // Favorites count from Laravel API
}

export interface MovieSearchResponse {
  data: Movie[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  movie_id: number;
  created_at: string;
  updated_at: string;
  movie?: Movie;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}