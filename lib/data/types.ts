export interface Comment {
  id: string;
  movie_id: number;
  user_id: string;
  parent_id: string | null;
  comment_text: string;
  rating: number | null;
  created_at: string;
  replies?: Comment[];
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
}

export interface CreateCommentInput {
  movie_id: number;
  user_id: string;
  parent_id?: string | null;
  comment_text: string;
  rating?: number | null;
}

export interface TrendingSnapshotItem {
  id: string;
  movie_id: string;
  rank: number;
  title: string;
  poster_url: string | null;
  imported_at: string;
}

export interface CreateTrendingSnapshotInput {
  movie_id: string;
  rank: number;
  title: string;
  poster_url?: string | null;
}

export interface CommunityTrendingMovie {
  movie_id: number;
  comment_count: number;
  avg_rating: number | null;
}

export interface RequestContext {
  userId?: string;
  supabase?: any;
}

export interface DataRepository {
  // Comments
  getCommentsByMovieId(movieId: number, ctx?: RequestContext): Promise<Comment[]>;
  getCommentById(id: string, ctx?: RequestContext): Promise<Comment | null>;
  createComment(input: CreateCommentInput, ctx?: RequestContext): Promise<Comment>;

  // Watchlist
  getWatchlist(userId: string, ctx?: RequestContext): Promise<WatchlistItem[]>;
  getWatchlistItem(userId: string, movieId: number, ctx?: RequestContext): Promise<WatchlistItem | null>;
  addToWatchlist(userId: string, movieId: number, ctx?: RequestContext): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, movieId: number, ctx?: RequestContext): Promise<void>;

  // Portal
  getUserComments(userId: string, ctx?: RequestContext): Promise<Comment[]>;
  getRepliesToUserComments(userId: string, ctx?: RequestContext): Promise<Comment[]>;

  // Trending Snapshot
  getTrendingSnapshot(ctx?: RequestContext): Promise<TrendingSnapshotItem[]>;
  overwriteTrendingSnapshot(items: CreateTrendingSnapshotInput[], ctx?: RequestContext): Promise<TrendingSnapshotItem[]>;

  // Community Trending
  getCommunityTrendingMovies(days?: number, limit?: number, ctx?: RequestContext): Promise<CommunityTrendingMovie[]>;
}
