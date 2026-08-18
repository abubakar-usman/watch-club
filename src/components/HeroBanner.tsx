"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ThumbsUp, MessageSquare, Info, Check, Trophy } from "lucide-react";

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
  // "spiderman" / "demon-slayer" removed — hero is always driven by real trending data now
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
        } else if (type === "all" || (type as string) === "spiderman") {
          // Uses the pinned featured title, not live trending — keeps /api/movies/trending untouched for other consumers (e.g. Top 10 Carousel)
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

          // Tag row = type + genres + year. Subtitle no longer repeats genres.
          const tags = [typeTag, ...genres, yearTag].filter(Boolean) as string[];

          const rawScore = m.vote_average || m.user_rating || 8.5;
          const score = Number(rawScore).toFixed(1);
          const percentVal = Math.min(99, Math.round((Number(rawScore) / 10) * 100));

          const formatted: HeroData = {
            id: m.id,
            title: m.title || m.name || "",
            // subtitle now only used if the API explicitly provides one — no genre duplication
            subtitle: m.subtitle,
            clubScore: score,
            recommendedPercent: `${percentVal}%`,
            commentCount: m.vote_count ? `${m.vote_count}+` : "1k+",
            tags,
            description: m.overview || m.description || "",
            award: m.award || (Number(rawScore) >= 8 ? "Top Rated" : "Trending #1"),
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
      <section className="hero__section hero__section--loading" style={{ minHeight: "560px", backgroundColor: "#282828", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>
        {/* Loading skeleton remains the same */}
      </section>
    );
  }

  if (!heroData) {
    return (
      <section className="hero__section hero__section--empty" style={{ minHeight: "320px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "1.5rem auto" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Title Available</p>
          <p style={{ fontSize: "0.875rem" }}>Check back later for live recommendations.</p>
        </div>
      </section>
    );
  }

  const backdropImage = heroData.backdropUrl || heroData.posterUrl || "";

  return (
    <section
      className="hero__section"
      style={{
        backgroundImage: backdropImage ? `url("${backdropImage}")` : undefined,
      }}
    >
      <div className="hero__content">
        <div className="hero__title-container">
          <Link href={heroData.id ? `/movie/${heroData.id}` : "#"}>
            <h1 className="hero__main-title hover:underline cursor-pointer">{heroData.title}</h1>
          </Link>
          {heroData.subtitle && <span className="hero__subtitle">{heroData.subtitle}</span>}
        </div>

        <div className="hero__badge-row">
          <div className="hero__badge">
            <Star size={18} className="hero__star-icon" />
            <span className="hero__badge-value">{heroData.clubScore}</span>
            <span className="hero__badge-label">Club Score</span>
          </div>
          <div className="hero__badge">
            <ThumbsUp size={18} className="hero__thumb-icon" />
            <span className="hero__badge-value">{heroData.recommendedPercent}</span>
            <span className="hero__badge-label">Recommended</span>
          </div>
          <div className="hero__badge">
            <MessageSquare size={18} className="hero__comment-icon" />
            <span className="hero__badge-value">{heroData.commentCount}</span>
            <span className="hero__badge-label">Comments</span>
          </div>
        </div>

        {heroData.tags && heroData.tags.length > 0 && (
          <div className="hero__tag-row">
            <span className="hero__tag-text">{heroData.tags.join(" • ")}</span>
          </div>
        )}

        <p className="hero__description">{heroData.description}</p>

        <div className="hero__button-group">
          <button
            type="button"
            className="hero__primary-btn"
            onClick={() => setInWatchlist(!inWatchlist)}
            aria-label="Add to Watchlist"
          >
            {inWatchlist ? (
              <>
                <Check size={18} />
                <span>In Watchlist</span>
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/play.png"
                  alt="play"
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
                <span>Add To Watchlist</span>
              </>
            )}
          </button>

          {heroData.id ? (
            <Link
              href={`/movie/${heroData.id}`}
              className="hero__secondary-btn"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
              aria-label="More Info"
            >
              <Info size={18} />
              <span>More Info</span>
            </Link>
          ) : (
            <button
              type="button"
              className="hero__secondary-btn"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
              aria-label="More Info"
            >
              <Info size={18} />
              <span>More Info</span>
            </button>
          )}
        </div>
      </div>

      {heroData.award && (
        <div className="hero__award-badge">
          <Trophy size={16} />
          <span>{heroData.award}</span>
        </div>
      )}
    </section>
  );
}