"use client";

import { useEffect, useState } from "react";
import MediaRow, { MediaItem } from "@/components/MediaRow";

export default function SeriesPage() {
  const [trendingSeries, setTrendingSeries] = useState<MediaItem[]>([]);
  const [kdramas, setKdramas] = useState<MediaItem[]>([]);
  const [animes, setAnimes] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeriesData() {
      try {
        const [trRes, kdRes, animeRes] = await Promise.all([
          fetch("/api/movies/recommendations?type=series"),
          fetch("/api/movies/category/K-Dramas"),
          fetch("/api/movies/category/Animes"),
        ]);

        if (trRes.ok) {
          const data = await trRes.json();
          setTrendingSeries(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Series",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }

        if (kdRes.ok) {
          const data = await kdRes.json();
          setKdramas(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "K-Drama",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }

        if (animeRes.ok) {
          const data = await animeRes.json();
          setAnimes(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || "Anime",
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }

    loadSeriesData();
  }, []);

  return (
    <main style={{ padding: "1rem" }} className="space-y-8">
      <div className="flex items-center gap-3 pt-4">
        <div className="w-1 h-7 rounded-full bg-brand-red" />
        <h1 className="font-heading text-3xl text-white">TV Series Catalog</h1>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-2xl" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      ) : (
        <>
          <MediaRow title="Trending TV Shows" items={trendingSeries} />
          <MediaRow title="Top K-Dramas" items={kdramas} />
          <MediaRow title="Top Anime Series" items={animes} />
        </>
      )}
    </main>
  );
}
