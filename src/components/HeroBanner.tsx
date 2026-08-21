"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ThumbsUp, MessageSquare, Info, Check, Trophy, Plus } from "lucide-react";

export interface HeroData {
  id?: string | number;
  title: string;
  subtitle?: string;
  clubScore: string;
  recommendedPercent: string;
  commentCount: string;
  tags: string[];
  description: string;
  award?: string;
  backdropUrl?: string;
  posterUrl?: string;
}

interface RawSearchResult {
  id?: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  type?: string;
  statusBadge?: string;
  genre_names?: string[];
  category?: string;
  year?: string;
  releaseDate?: string;
  vote_average?: number;
  user_rating?: number;
  vote_count?: number;
  overview?: string;
  description?: string;
  award?: string;
  backdrop?: string;
  backdrop_path?: string;
  posterUrl?: string;
  poster?: string;
  poster_path?: string;
}

interface HeroBannerProps {
  type?: "all" | "movie" | "series";
  searchQuery?: string;
  item?: HeroData | null;
}

export default function HeroBanner({
  type = "all",
  searchQuery,
  item: initialItem,
}: HeroBannerProps) {
  const [heroData, setHeroData] = useState<HeroData | null>(initialItem || null);
  const [loading, setLoading] = useState<boolean>(!initialItem);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (initialItem) return;

    let isMounted = true;
    async function fetchHeroItem() {
      setLoading(true);
      try {
        let endpoint = "";
        if (searchQuery) {
          endpoint = `/api/movies/search?query=${encodeURIComponent(searchQuery)}`;
        } else if (type === "all") {
          endpoint = "/api/movies/featured";
        } else {
          endpoint = `/api/movies/trending?type=${encodeURIComponent(type)}`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const results: RawSearchResult[] = data.results || [];
        if (results.length > 0) {
          const m = results[0];

          const genres: string[] = Array.isArray(m.genre_names)
            ? m.genre_names.slice(0, 3)
            : m.category
              ? [m.category]
              : [];

          const typeTag = m.statusBadge || (m.type === "movie" ? "Movie" : "Series");
          const yearTag = m.year || (m.releaseDate ? String(m.releaseDate).split("-")[0] : null);

          const tags = [typeTag, ...genres, yearTag].filter(Boolean) as string[];

          const rawScore = m.vote_average || m.user_rating || null;
          const score = rawScore !== null && rawScore !== undefined ? Number(rawScore).toFixed(1) : "N/A";
          const percentVal = rawScore !== null && rawScore !== undefined ? Math.min(99, Math.round((Number(rawScore) / 10) * 100)) : 0;

          const formatted: HeroData = {
            id: m.id,
            title: m.title || m.name || "",
            subtitle: m.subtitle,
            clubScore: score,
            recommendedPercent: `${percentVal}%`,
            commentCount: m.vote_count ? `${m.vote_count}+` : "0",
            tags,
            description: m.overview || m.description || "",
            award: m.award || (rawScore && Number(rawScore) >= 8 ? "Top Rated" : "Trending #1"),
            backdropUrl: m.backdrop || m.backdrop_path || m.posterUrl || m.poster || m.poster_path,
            posterUrl: m.posterUrl || m.poster || m.poster_path,
          };

          if (isMounted) setHeroData(formatted);
        } else {
          if (isMounted) setHeroData(null);
        }
      } catch (err) {
        console.error("HeroBanner fetch error:", err);
        if (isMounted) setHeroData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHeroItem();
    return () => {
      isMounted = false;
    };
  }, [type, searchQuery, initialItem]);

  if (loading) {
    return (
      <section className="w-full max-w-[1400px] mx-auto my-6 mb-8 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full min-h-[560px] h-[70vh] max-h-[720px] bg-[#282828] rounded-2xl overflow-hidden flex items-end animate-pulse" />
      </section>
    );
  }

  if (!heroData) {
    return (
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[650px] bg-black/30 border border-white/10 rounded-[30px] flex items-center justify-center">
          <div className="text-center text-[#999999] p-8">
            <p className="text-lg font-semibold text-white mb-2">No Title Available</p>
            <p className="text-sm">Check back later for live recommendations.</p>
          </div>
        </div>
      </section>
    );
  }

  const backdropImage = heroData.backdropUrl || heroData.posterUrl || "";

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className="relative w-full h-[650px] bg-[#282828] bg-cover bg-center rounded-[30px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex items-end"
        style={{
          backgroundImage: backdropImage ? `url("${backdropImage}")` : undefined,
        }}
      >
        <div className="relative z-10 px-12 py-14 max-w-[680px] flex flex-col gap-5 max-[768px]:px-6 max-[768px]:py-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-[3.5rem] font-black leading-none tracking-tight text-white uppercase [text-shadow:0_4px_20px_rgba(0,0,0,0.9)] font-sans max-[768px]:text-[2.2rem]">
              {heroData.title}
            </h1>
            {heroData.subtitle && (
              <span className="text-xl font-bold tracking-[0.15em] text-[#E50914] uppercase">
                {heroData.subtitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-[#FFC107] fill-[#FFC107]" />
              <span className="text-lg font-extrabold text-white">{heroData.clubScore}</span>
              <span className="text-[0.8rem] font-medium text-[#CCCCCC]">Club Score</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp size={18} className="text-[#4CAF50]" />
              <span className="text-lg font-extrabold text-white">{heroData.recommendedPercent}</span>
              <span className="text-[0.8rem] font-medium text-[#CCCCCC]">Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#2196F3]" />
              <span className="text-lg font-extrabold text-white">{heroData.commentCount}</span>
              <span className="text-[0.8rem] font-medium text-[#CCCCCC]">Comments</span>
            </div>
          </div>

          {heroData.tags && heroData.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#E5E5E5] text-[0.95rem] font-medium tracking-wide">
                {heroData.tags.join(" • ")}
              </span>
            </div>
          )}

          <p className="text-[#D1D1D1] text-base leading-[1.55] max-w-[580px] [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            {heroData.description}
          </p>
          <div className="flex items-center gap-3 mt-6">
            {/* Add To Watchlist Button */}
            <button
              type="button"
              className="w-[164px] h-[37px] bg-white text-black rounded-[40px] pt-[10px] pb-[10px] px-[16px] flex items-center justify-center gap-[4px] border-0 transition-colors hover:bg-gray-100 active:scale-95"
              onClick={() => setInWatchlist(!inWatchlist)}
            >
              <img
                src="/icons/play.png"
                alt=""
                className="w-[16px] h-[16px] object-contain shrink-0"
              />
              <span className="text-[14px] font-bold leading-none whitespace-nowrap">
                {inWatchlist ? "In Watchlist" : "Add To Watchlist"}
              </span>
            </button>

            {/* More Info Button */}
            <Link
              href={`/movie/${heroData.id || '#'}`}
              className="w-[97px] h-[37px] bg-[#515151]/90 text-white rounded-[40px] pt-[10px] pb-[10px] px-[16px] flex items-center justify-center gap-[8px] transition-colors hover:bg-[#515151] active:scale-95"
            >
              <span className="text-[14px] font-bold leading-none whitespace-nowrap">
                More Info
              </span>
            </Link>
          </div>
        </div>

        {/* Emmy Winner / Award Badge / Trending #1 */}
        {heroData.award && (
          <div className="absolute bottom-10 right-10 bg-[#2B2B2B]/80 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2 text-white text-[14px] font-medium border border-white/10">
            <img
              src="/icons/ew.png"
              alt="EW"
              className="w-5 h-5 object-contain shrink-0"
            />
            <span>{heroData.award}</span>
          </div>
        )}
      </div>
    </section >
  );
}