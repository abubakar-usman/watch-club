"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MediaRow, { MediaItem } from "@/components/MediaRow";

export default function GenrePage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "action";
  const categoryName = decodeURIComponent(rawSlug).toUpperCase();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGenreData() {
      try {
        const res = await fetch(`/api/movies/category/${encodeURIComponent(rawSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setItems(
            (data.results || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || categoryName,
              image: m.posterUrl || m.poster || m.poster_path || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop",
            }))
          );
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }

    loadGenreData();
  }, [rawSlug, categoryName]);

  return (
    <main className="w-full min-h-screen space-y-8 pb-6 bg-[#181818]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 pt-4">
        <div className="w-1 h-7 rounded-full bg-[#E50914]" />
        <h1 className="font-bold text-3xl text-white tracking-tight">{categoryName} Collection</h1>
      </div>

      {loading ? (
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
      ) : (
        <MediaRow title={`Top Picks in ${categoryName}`} items={items} />
      )}
    </main>
  );
}
