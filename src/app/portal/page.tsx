"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import MovieCard, { Movie } from "@/components/MovieCard";

interface CommentItem {
  id: string;
  movie_id: number;
  user_id: string;
  parent_id: string | null;
  comment_text: string;
  rating: number | null;
  created_at: string;
}

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PortalPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "replies" | "watchlist">("comments");

  // State for data
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [replies, setReplies] = useState<CommentItem[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);

  // Loading & error states
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  /* Fetch User Comments */
  const fetchUserComments = useCallback(async () => {
    if (!token) return;
    setLoadingComments(true);
    try {
      const res = await fetch("/api/portal/comments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // Ignore error
    } finally {
      setLoadingComments(false);
    }
  }, [token]);

  /* Fetch Replies to User */
  const fetchUserReplies = useCallback(async () => {
    if (!token) return;
    setLoadingReplies(true);
    try {
      const res = await fetch("/api/portal/replies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies || []);
      }
    } catch {
      // Ignore error
    } finally {
      setLoadingReplies(false);
    }
  }, [token]);

  /* Fetch Watchlist & Movie details */
  const fetchUserWatchlist = useCallback(async () => {
    if (!token) return;
    setLoadingWatchlist(true);
    try {
      const res = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: WatchlistItem[] = data.watchlist || [];

        // Fetch details for each movie in watchlist
        const moviePromises = items.map(async (item) => {
          try {
            const mRes = await fetch(`/api/movies/${item.movie_id}`);
            if (mRes.ok) {
              const mData = await mRes.json();
              return mData as Movie;
            }
          } catch {
            return null;
          }
          return null;
        });

        const fetchedMovies = (await Promise.all(moviePromises)).filter(
          (m): m is Movie => m !== null
        );

        setWatchlistMovies(fetchedMovies);
      }
    } catch {
      // Ignore error
    } finally {
      setLoadingWatchlist(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserComments();
      fetchUserReplies();
      fetchUserWatchlist();
    }
  }, [isAuthenticated, token, fetchUserComments, fetchUserReplies, fetchUserWatchlist]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-12 bg-white/5 rounded-xl w-64" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  /* Unauthenticated Prompt */
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-black/60 border border-white/8 rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red text-2xl">
            👤
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl text-white">User Portal</h1>
            <p className="text-gray text-sm leading-relaxed">
              Sign in to view your posted comments, track replies to your discussions, and manage your saved watchlist.
            </p>
          </div>
          <div className="flex gap-4 pt-2">
            <Link
              href="/login"
              className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-brand-red/20"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl border border-white/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (user.name ?? user.email).slice(0, 1).toUpperCase();
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      {/* ── USER HEADER CARD ─────────────────────────────────────── */}
      <div className="bg-black/60 border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-mono text-2xl font-bold shadow-lg shadow-brand-red/20 border border-white/20">
            {initials}
          </div>
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="font-heading text-2xl text-white tracking-tight">{displayName}</h1>
            </div>
            <p className="font-mono text-xs text-gray">{user.email}</p>
            <p className="font-mono text-[11px] text-gray/50">ID: {user.id}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <span className="block font-mono text-xl text-brand-red font-bold">{comments.length}</span>
            <span className="font-mono text-[10px] text-gray uppercase">Comments</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block font-mono text-xl text-white font-bold">{replies.length}</span>
            <span className="font-mono text-[10px] text-gray uppercase">Replies</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block font-mono text-xl text-white font-bold">{watchlistMovies.length}</span>
            <span className="font-mono text-[10px] text-gray uppercase">Watchlist</span>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 space-x-8">
        <button
          onClick={() => setActiveTab("comments")}
          id="tab-user-comments"
          className={`pb-4 font-heading text-lg transition-colors relative ${activeTab === "comments" ? "text-white" : "text-gray hover:text-white/80"
            }`}
        >
          Your Comments ({comments.length})
          {activeTab === "comments" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("replies")}
          id="tab-user-replies"
          className={`pb-4 font-heading text-lg transition-colors relative ${activeTab === "replies" ? "text-white" : "text-gray hover:text-white/80"
            }`}
        >
          Replies to You ({replies.length})
          {activeTab === "replies" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("watchlist")}
          id="tab-user-watchlist"
          className={`pb-4 font-heading text-lg transition-colors relative ${activeTab === "watchlist" ? "text-white" : "text-gray hover:text-white/80"
            }`}
        >
          Your Watchlist ({watchlistMovies.length})
          {activeTab === "watchlist" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full" />
          )}
        </button>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────── */}

      {/* TAB 1: YOUR COMMENTS */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-black/40 border border-white/8 rounded-2xl p-12 text-center space-y-3">
              <p className="text-3xl">💬</p>
              <h3 className="font-heading text-lg text-white">No comments yet</h3>
              <p className="text-gray text-sm">
                You haven't posted any comments or reviews. Explore trending movies to start a discussion!
              </p>
              <Link
                href="/"
                className="inline-block bg-brand-red/20 text-brand-red border border-brand-red/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/30 transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            comments.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-white/8 hover:border-white/20 rounded-xl p-5 space-y-3 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-brand-red">
                      Movie #{item.movie_id}
                    </span>
                    <span className="font-mono text-[10px] text-gray/50">
                      {timeAgo(item.created_at)}
                    </span>
                    {item.parent_id && (
                      <span className="font-mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray/70">
                        REPLY
                      </span>
                    )}
                  </div>

                  {item.rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`font-mono text-xs ${i < item.rating! ? "text-brand-red" : "text-gray/20"
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-white/90 text-sm leading-relaxed">{item.comment_text}</p>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <Link
                    href={`/movie/${item.movie_id}#discussion`}
                    className="font-mono text-xs text-brand-red hover:text-white transition-colors"
                  >
                    View on Movie Page →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: REPLIES TO YOU */}
      {activeTab === "replies" && (
        <div className="space-y-4">
          {loadingReplies ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : replies.length === 0 ? (
            <div className="bg-black/40 border border-white/8 rounded-2xl p-12 text-center space-y-3">
              <p className="text-3xl">🔔</p>
              <h3 className="font-heading text-lg text-white">No replies yet</h3>
              <p className="text-gray text-sm">
                Nobody has replied to your comments yet. Stay active in discussions to get notifications!
              </p>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-black/40 border border-white/8 hover:border-white/20 rounded-xl p-5 space-y-3 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-red/40 flex items-center justify-center text-white text-[10px] font-mono">
                      {reply.user_id.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-mono text-xs text-white">
                      {reply.user_id}
                    </span>
                    <span className="font-mono text-[10px] text-gray/50">
                      {timeAgo(reply.created_at)}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-brand-red">
                    Movie #{reply.movie_id}
                  </span>
                </div>

                <p className="text-white/90 text-sm leading-relaxed">{reply.comment_text}</p>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <Link
                    href={`/movie/${reply.movie_id}#discussion`}
                    className="font-mono text-xs text-brand-red hover:text-white transition-colors"
                  >
                    Reply Back →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: YOUR WATCHLIST */}
      {activeTab === "watchlist" && (
        <div className="space-y-4">
          {loadingWatchlist ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : watchlistMovies.length === 0 ? (
            <div className="bg-black/40 border border-white/8 rounded-2xl p-12 text-center space-y-3">
              <p className="text-3xl">📋</p>
              <h3 className="font-heading text-lg text-white">Your Watchlist is empty</h3>
              <p className="text-gray text-sm">
                Save movies to your watchlist from any movie detail page to track them here.
              </p>
              <Link
                href="/"
                className="inline-block bg-brand-red/20 text-brand-red border border-brand-red/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/30 transition-colors"
              >
                Find Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
