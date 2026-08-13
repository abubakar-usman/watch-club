export interface Movie {
  id: number | string;
  title: string;
  overview?: string;
  releaseDate?: string;
  year?: number | string;
  posterUrl?: string | null;
  poster?: string | null;
  poster_path?: string | null;
  backdrop?: string | null;
  backdrop_path?: string | null;
  user_rating?: number;
  vote_average?: number;
  vote_count?: number;
  genre_names?: string[];
  genres?: { id: number; name: string }[];
  cast?: any[];
  credits?: {
    cast?: any[];
    crew?: any[];
  };
  streamingOptions?: Record<string, any>;
  sources?: any[];
  category?: string;
  type?: "movie" | "series";
  statusBadge?: string;
}

export interface MovieSearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface CommentItem {
  id: string;
  movie_id: number;
  user_id: string;
  parent_id: string | null;
  comment_text: string;
  rating: number | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
}

export interface TrendingItem {
  id?: string;
  movie_id: string | number;
  rank: number;
  title: string;
  poster_url: string | null;
  imported_at?: string;
}

export interface RepositoryContext {
  userId?: string | null;
  token?: string | null;
}

export interface MovieProvider {
  fetchTrending(timeWindow?: string, page?: number, limit?: number): Promise<MovieSearchResult>;
  search(query: string, page?: number, genre?: string, type?: string, year?: string): Promise<MovieSearchResult>;
  fetchDetails(id: string | number): Promise<Movie | null>;
  fetchByCategory(category: string, page?: number, limit?: number): Promise<MovieSearchResult>;
}
