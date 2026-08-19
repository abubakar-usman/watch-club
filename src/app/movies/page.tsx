"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import MediaRow, { MediaItem } from "@/components/MediaRow";

export default function MoviesPage() {
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>([]);
  const [comedyMovies, setComedyMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMoviesData() {
      try {
        const [trRes, actRes, scifiRes, comRes] = await Promise.all([
          fetch("/api/movies/recommendations?type=movie"),
          fetch("/api/movies/category/Action"),
          fetch("/api/movies/category/Sci-Fi"),
          fetch("/api/movies/category/Comedy"),
        ]);

        if (trRes.ok) {
          const data = await trRes.json();
          setTrendingMovies(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Movie",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }

        if (actRes.ok) {
          const data = await actRes.json();
          setActionMovies(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Action",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }

        if (scifiRes.ok) {
          const data = await scifiRes.json();
          setSciFiMovies(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Sci-Fi",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }

        if (comRes.ok) {
          const data = await comRes.json();
          setComedyMovies(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Comedy",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }

    loadMoviesData();
  }, []);

  return (
    <main className="w-full min-h-screen pb-12 overflow-x-hidden space-y-8 bg-[#181818]">
      {/* Top Trending Movie Hero Banner */}
      <HeroBanner type="movie" />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 pt-2">
          <div className="w-1 h-7 rounded-full bg-[#E50914]" />
          <h1 className="font-bold text-3xl text-white tracking-tight">Movies Catalog</h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-2xl" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      ) : (
        <>
          <MediaRow title="Trending Movies" items={trendingMovies} />
          <MediaRow title="Action Blockbusters" items={actionMovies} />
          <MediaRow title="Sci-Fi & Fantasy" items={sciFiMovies} />
          <MediaRow title="Comedy Hits" items={comedyMovies} />
        </>
      )}
    </main>
  );
}
