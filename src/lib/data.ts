import { NextRequest, NextResponse } from "next/server";
import { CommentItem, WatchlistItem, TrendingItem, RepositoryContext } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aixecdfdebdbyxctdquc.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeGVjZGZkZWJkYnl4Y3RkcXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTc1MzE5MSwiZXhwIjoyMTAxMzI5MTkxfQ.6kY5bEATRXNW_dosP9xK6Nsq2DK1KvNalwFh85HJ668";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

export interface CreateTrendingSnapshotInput {
  movie_id: string;
  rank: number;
  title: string;
  poster_url: string | null;
}

export const repository = {
  async getTrendingSnapshot(_ctx?: RepositoryContext): Promise<TrendingItem[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trending_snapshot?select=*&order=rank.asc`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async overwriteTrendingSnapshot(
    snapshotItems: CreateTrendingSnapshotInput[],
    _ctx?: RepositoryContext
  ): Promise<TrendingItem[]> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/trending_snapshot?movie_id=neq.0`, {
        method: "DELETE",
        headers,
      });

      const res = await fetch(`${SUPABASE_URL}/rest/v1/trending_snapshot`, {
        method: "POST",
        headers,
        body: JSON.stringify(snapshotItems),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getCommentsByMovieId(movieId: number, _ctx?: RepositoryContext): Promise<CommentItem[]> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?select=*&movie_id=eq.${movieId}&order=created_at.desc`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async createComment(
    commentData: {
      movie_id: number;
      user_id: string;
      parent_id: string | null;
      comment_text: string;
      rating: number | null;
    },
    _ctx?: RepositoryContext
  ): Promise<CommentItem> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify([commentData]),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create comment: ${errText}`);
    }
    const data = await res.json();
    return data[0];
  },

  async getCommunityTrendingMovies(
    _days: number = 7,
    _limit: number = 10,
    _ctx?: RepositoryContext
  ): Promise<{ movie_id: number; comment_count: number; avg_rating: number | null }[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?select=movie_id,rating`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) return [];
      const comments: { movie_id: number; rating: number | null }[] = await res.json();
      if (!Array.isArray(comments) || comments.length === 0) return [];

      const statsMap = new Map<number, { count: number; ratingSum: number; ratingCount: number }>();
      for (const c of comments) {
        const existing = statsMap.get(c.movie_id) || { count: 0, ratingSum: 0, ratingCount: 0 };
        existing.count += 1;
        if (c.rating) {
          existing.ratingSum += c.rating;
          existing.ratingCount += 1;
        }
        statsMap.set(c.movie_id, existing);
      }

      const results = Array.from(statsMap.entries()).map(([movie_id, stat]) => ({
        movie_id,
        comment_count: stat.count,
        avg_rating: stat.ratingCount > 0 ? stat.ratingSum / stat.ratingCount : null,
      }));

      // Sort by comment count descending
      results.sort((a, b) => b.comment_count - a.comment_count);
      return results.slice(0, _limit);
    } catch {
      return [];
    }
  },

  async getUserComments(userId: string, _ctx?: RepositoryContext): Promise<CommentItem[]> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?select=*&user_id=eq.${userId}&order=created_at.desc`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getUserReplies(userId: string, _ctx?: RepositoryContext): Promise<CommentItem[]> {
    try {
      // Fetch user's comment IDs first
      const userComments = await this.getUserComments(userId, _ctx);
      if (userComments.length === 0) return [];
      const parentIds = userComments.map((c) => c.id);

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?select=*&parent_id=in.(${parentIds.join(",")})&order=created_at.desc`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getWatchlist(userId: string, _ctx?: RepositoryContext): Promise<WatchlistItem[]> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/watchlist?select=*&user_id=eq.${userId}&order=added_at.desc`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getWatchlistItem(
    userId: string,
    movieId: number,
    _ctx?: RepositoryContext
  ): Promise<WatchlistItem | null> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/watchlist?select=*&user_id=eq.${userId}&movie_id=eq.${movieId}`,
        { headers, cache: "no-store" }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch {
      return null;
    }
  },

  async addToWatchlist(
    userId: string,
    movieId: number,
    _ctx?: RepositoryContext
  ): Promise<WatchlistItem> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/watchlist`, {
      method: "POST",
      headers,
      body: JSON.stringify([{ user_id: userId, movie_id: movieId }]),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to add to watchlist: ${errText}`);
    }
    const data = await res.json();
    return data[0];
  },

  async removeFromWatchlist(
    userId: string,
    movieId: number,
    _ctx?: RepositoryContext
  ): Promise<void> {
    await fetch(`${SUPABASE_URL}/rest/v1/watchlist?user_id=eq.${userId}&movie_id=eq.${movieId}`, {
      method: "DELETE",
      headers,
    });
  },
};

export type AuthMode = "none" | "user" | "admin";

export function withRepositoryAuth(
  options: { auth: AuthMode },
  handler: (req: NextRequest, ctx: RepositoryContext, params?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, params?: any) => {
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      userId = token;
    }

    const ctx: RepositoryContext = { userId, token };
    return handler(req, ctx, params);
  };
}
