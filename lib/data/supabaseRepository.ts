import {
  Comment,
  CommunityTrendingMovie,
  CreateCommentInput,
  CreateTrendingSnapshotInput,
  DataRepository,
  RequestContext,
  TrendingSnapshotItem,
  WatchlistItem,
} from "./types";

export class SupabaseRepository implements DataRepository {
  private getClient(ctx?: RequestContext) {
    if (!ctx?.supabase) {
      throw new Error("Supabase client missing from request context");
    }
    return ctx.supabase;
  }

  async getCommentsByMovieId(movieId: number, ctx?: RequestContext): Promise<Comment[]> {
    const supabase = this.getClient(ctx);
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) {
      const err = new Error("Failed to fetch comments") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    const commentList: Comment[] = comments || [];
    const map = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    for (const item of commentList) {
      map.set(item.id, { ...item, replies: [] });
    }

    for (const item of commentList) {
      const node = map.get(item.id)!;
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.replies!.push(node);
      } else {
        rootComments.push(node);
      }
    }

    return rootComments;
  }

  async getCommentById(id: string, ctx?: RequestContext): Promise<Comment | null> {
    const supabase = this.getClient(ctx);
    const { data: parentComment, error } = await supabase
      .from("comments")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error || !parentComment) {
      return null;
    }

    return parentComment as Comment;
  }

  async createComment(input: CreateCommentInput, ctx?: RequestContext): Promise<Comment> {
    const supabase = this.getClient(ctx);
    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({
        movie_id: input.movie_id,
        user_id: input.user_id,
        parent_id: input.parent_id || null,
        comment_text: input.comment_text,
        rating: input.rating ?? null,
      })
      .select()
      .single();

    if (error) {
      const err = new Error("Failed to insert comment") as Error & { details?: string; code?: string; hint?: string };
      err.details = error.message;
      err.code = error.code;
      err.hint = error.hint;
      throw err;
    }

    return newComment as Comment;
  }

  async getWatchlist(userId: string, ctx?: RequestContext): Promise<WatchlistItem[]> {
    const supabase = this.getClient(ctx);
    const { data: watchlist, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      const err = new Error("Failed to fetch watchlist") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    return watchlist || [];
  }

  async getWatchlistItem(
    userId: string,
    movieId: number,
    ctx?: RequestContext
  ): Promise<WatchlistItem | null> {
    const supabase = this.getClient(ctx);
    const { data: existing, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .maybeSingle();

    if (error || !existing) {
      return null;
    }

    return existing as WatchlistItem;
  }

  async addToWatchlist(
    userId: string,
    movieId: number,
    ctx?: RequestContext
  ): Promise<WatchlistItem> {
    const supabase = this.getClient(ctx);
    const { data: item, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: userId,
        movie_id: movieId,
      })
      .select()
      .single();

    if (error) {
      const err = new Error("Failed to add movie to watchlist") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    return item as WatchlistItem;
  }

  async removeFromWatchlist(
    userId: string,
    movieId: number,
    ctx?: RequestContext
  ): Promise<void> {
    const supabase = this.getClient(ctx);
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", movieId);

    if (error) {
      const err = new Error("Failed to remove movie from watchlist") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }
  }

  async getUserComments(userId: string, ctx?: RequestContext): Promise<Comment[]> {
    const supabase = this.getClient(ctx);
    const { data: userComments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      const err = new Error("Failed to fetch user comments") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    return userComments || [];
  }

  async getRepliesToUserComments(userId: string, ctx?: RequestContext): Promise<Comment[]> {
    const supabase = this.getClient(ctx);
    const { data: userComments, error: userCommentsError } = await supabase
      .from("comments")
      .select("id")
      .eq("user_id", userId);

    if (userCommentsError) {
      const err = new Error("Failed to fetch user comments") as Error & { details?: string };
      err.details = userCommentsError.message;
      throw err;
    }

    const userCommentIds = (userComments || []).map((c: { id: string }) => c.id);

    if (userCommentIds.length === 0) {
      return [];
    }

    const { data: replies, error: repliesError } = await supabase
      .from("comments")
      .select("*")
      .in("parent_id", userCommentIds)
      .order("created_at", { ascending: false });

    if (repliesError) {
      const err = new Error("Failed to fetch replies to user comments") as Error & { details?: string };
      err.details = repliesError.message;
      throw err;
    }

    return replies || [];
  }

  async getTrendingSnapshot(ctx?: RequestContext): Promise<TrendingSnapshotItem[]> {
    const supabase = this.getClient(ctx);
    const { data, error } = await supabase
      .from("trending_snapshot")
      .select("*")
      .order("rank", { ascending: true });

    if (error) {
      const err = new Error("Failed to fetch trending snapshot") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    const items = data || [];
    console.log("[MOVIES_DATA_PATH] 3. trending_snapshot query result count:", items.length);
    console.log("[MOVIES_DATA_PATH] 3b. Is trending_snapshot empty?", items.length === 0);
    console.log("[MOVIES_DATA_PATH] 3c. trending_snapshot data:", items);

    return items;
  }

  async overwriteTrendingSnapshot(
    items: CreateTrendingSnapshotInput[],
    ctx?: RequestContext
  ): Promise<TrendingSnapshotItem[]> {
    const supabase = this.getClient(ctx);

    // Delete existing snapshot records
    const { error: deleteError } = await supabase
      .from("trending_snapshot")
      .delete()
      .gte("rank", 0);

    if (deleteError) {
      const { error: deleteAllError } = await supabase
        .from("trending_snapshot")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (deleteAllError) {
        const err = new Error("Failed to clear existing trending snapshot") as Error & { details?: string };
        err.details = deleteAllError.message;
        throw err;
      }
    }

    if (items.length === 0) {
      return [];
    }

    const rowsToInsert = items.map((item) => ({
      movie_id: item.movie_id,
      rank: item.rank,
      title: item.title,
      poster_url: item.poster_url ?? null,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("trending_snapshot")
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      const err = new Error("Failed to insert trending snapshot items") as Error & { details?: string };
      err.details = insertError.message;
      throw err;
    }

    return inserted || [];
  }

  async getCommunityTrendingMovies(
    days = 7,
    limit = 10,
    ctx?: RequestContext
  ): Promise<CommunityTrendingMovie[]> {
    const supabase = this.getClient(ctx);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: comments, error } = await supabase
      .from("comments")
      .select("movie_id, rating")
      .gt("created_at", cutoff);

    if (error) {
      const err = new Error("Failed to fetch community trending comments") as Error & { details?: string };
      err.details = error.message;
      throw err;
    }

    const statsMap = new Map<number, { count: number; ratingSum: number; ratingCount: number }>();

    for (const c of comments || []) {
      const movieId = Number(c.movie_id);
      const existing = statsMap.get(movieId) || { count: 0, ratingSum: 0, ratingCount: 0 };
      existing.count += 1;
      if (c.rating !== null && c.rating !== undefined) {
        existing.ratingSum += Number(c.rating);
        existing.ratingCount += 1;
      }
      statsMap.set(movieId, existing);
    }

    let results: CommunityTrendingMovie[] = Array.from(statsMap.entries()).map(
      ([movie_id, stats]) => ({
        movie_id,
        comment_count: stats.count,
        avg_rating: stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null,
      })
    );

    results.sort((a, b) => b.comment_count - a.comment_count);

    if (results.length === 0) {
      // Fallback: check all comments if no recent comments in last 7 days
      const { data: allComments } = await supabase
        .from("comments")
        .select("movie_id, rating")
        .limit(100);

      if (allComments && allComments.length > 0) {
        const allStatsMap = new Map<number, { count: number; ratingSum: number; ratingCount: number }>();
        for (const c of allComments) {
          const movieId = Number(c.movie_id);
          const existing = allStatsMap.get(movieId) || { count: 0, ratingSum: 0, ratingCount: 0 };
          existing.count += 1;
          if (c.rating !== null && c.rating !== undefined) {
            existing.ratingSum += Number(c.rating);
            existing.ratingCount += 1;
          }
          allStatsMap.set(movieId, existing);
        }
        results = Array.from(allStatsMap.entries()).map(([movie_id, stats]) => ({
          movie_id,
          comment_count: stats.count,
          avg_rating: stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null,
        }));
        results.sort((a, b) => b.comment_count - a.comment_count);
      }
    }

    return results.slice(0, limit);
  }
}
