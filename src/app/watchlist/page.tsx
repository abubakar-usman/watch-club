"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import MovieCard, { Movie } from "@/components/MovieCard";

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
}

export default function WatchlistPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const items: WatchlistItem[] = data.watchlist || [];

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
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && token) {
        fetchWatchlist();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, token, fetchWatchlist]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-black/60 border border-white/8 rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red text-2xl">
            📋
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl text-white">Your Watchlist</h1>
            <p className="text-gray text-sm leading-relaxed">
              Sign in to view and manage your saved movies.
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-brand-red" />
          <h1 className="font-heading text-3xl text-white">My Watchlist</h1>
          <span className="font-mono text-xs text-gray/50 border border-white/10 px-2.5 py-0.5 rounded-full">
            {watchlistMovies.length} movies
          </span>
        </div>

        <Link
          href="/portal"
          className="font-mono text-xs text-brand-red hover:text-white transition-colors"
        >
          Go to User Portal →
        </Link>
      </div>

      {watchlistMovies.length === 0 ? (
        <div className="bg-black/40 border border-white/8 rounded-2xl p-12 text-center space-y-3">
          <p className="text-3xl">🎬</p>
          <h3 className="font-heading text-lg text-white">Your Watchlist is empty</h3>
          <p className="text-gray text-sm">
            Save movies to your watchlist from any movie detail page to track them here.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-red/20 text-brand-red border border-brand-red/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/30 transition-colors"
          >
            Browse Movies
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
  );
}
