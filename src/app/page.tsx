"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import TopTenCarousel from "@/components/TopTenCarousel";
import MediaRow, { MediaItem } from "@/components/MediaRow";
import MostDiscussedRow from "@/components/MostDiscussedRow";
import CommunityBanner from "@/components/CommunityBanner";

interface MovieApiItem {
  id: string | number;
  title: string;
  genre_names?: string[];
  category?: string;
  posterUrl?: string;
  poster?: string;
  poster_path?: string;
  statusBadge?: string;
}

export default function Home() {
  const [topSearches, setTopSearches] = useState<MediaItem[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<MediaItem[]>([]);
  const [recommendedSeries, setRecommendedSeries] = useState<MediaItem[]>([]);
  const [categoryRows, setCategoryRows] = useState<{ title: string; items: MediaItem[] }[]>([]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        // Fetch Top Searches
        const tsRes = await fetch("/api/movies/top-searches");
        if (tsRes.ok) {
          const tsData = await tsRes.json();
          setTopSearches(
            (tsData.results || []).map((m: MovieApiItem) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || m.category || "Trending",
              image: m.posterUrl || m.poster || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : ""),
              statusBadge: m.statusBadge,
            }))
          );
        }

        // Fetch Most Recommended Movies (category=movies)
        const rmRes = await fetch("/api/movies/category/movies");
        if (rmRes.ok) {
          const rmData = await rmRes.json();
          setRecommendedMovies(
            (rmData.results || []).map((m: MovieApiItem) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || m.category || "Movie",
              image: m.posterUrl || m.poster || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : ""),
              statusBadge: m.statusBadge,
            }))
          );
        }

        // Fetch Most Recommended Series (category=series)
        const rsRes = await fetch("/api/movies/category/series");
        if (rsRes.ok) {
          const rsData = await rsRes.json();
          setRecommendedSeries(
            (rsData.results || []).map((m: MovieApiItem) => ({
              id: m.id,
              title: m.title,
              category: m.genre_names?.join(" • ") || m.category || "Series",
              image: m.posterUrl || m.poster || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : ""),
              statusBadge: m.statusBadge,
            }))
          );
        }

        // Fetch Category Rows
        const categories = [
          "Animes",
          "Emmy Nominees",
          "International Award-Winning",
          "Based on Webtoons",
          "Western",
          "K-Dramas",
          "Japanese",
          "Chinese",
          "Bollywood",
          "Thai",
          "Comedy",
        ];

        const catPromises = categories.map(async (cat) => {
          try {
            const res = await fetch(`/api/movies/category/${encodeURIComponent(cat)}`);
            if (res.ok) {
              const data = await res.json();
              const items: MediaItem[] = (data.results || []).map((m: MovieApiItem) => ({
                id: m.id,
                title: m.title,
                category: m.genre_names?.join(" • ") || m.category || cat,
                image: m.posterUrl || m.poster || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : ""),
                statusBadge: m.statusBadge,
              }));
              return { title: cat, items };
            }
          } catch {
            return null;
          }
          return null;
        });

        const fetchedCats = (await Promise.all(catPromises)).filter(
          (c): c is { title: string; items: MediaItem[] } => c !== null && c.items.length > 0
        );

        setCategoryRows(fetchedCats);
      } catch {
        // Fallbacks preserved
      }
    }

    loadLiveData();
  }, []);

  return (
    <main style={{ padding: "0 1rem" }}>
      {/* Spider-Man: Brand New Day Hero Banner (Live API Search) */}
      <HeroBanner type="spiderman" />

      {/* Top 10 Recommendations For Today */}
      <TopTenCarousel />

      {/* Top Searches */}
      <MediaRow title="Top Searches" items={topSearches} />

      {/* Most Recommended Movies */}
      <MediaRow title="Most Recommended Movies" items={recommendedMovies} />

      {/* Most Recommended Series */}
      <MediaRow title="Most Recommended Series" items={recommendedSeries} />

      {/* Most Discussed This Week */}
      <MostDiscussedRow />

      {/* Community Banner */}
      <CommunityBanner />

      {/* Dynamic Genre & Category Rows */}
      {categoryRows.map((catRow) => (
        <MediaRow key={catRow.title} title={catRow.title} items={catRow.items} />
      ))}

      {/* Community Banner (At the end of page) */}
      <CommunityBanner />
    </main>
  );
}
