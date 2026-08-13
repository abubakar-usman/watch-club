"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TopTenItem {
  rank: number;
  id?: string | number;
  title: string;
  category: string;
  image: string;
}

export default function TopTenCarousel({ items: initialItems }: { items?: TopTenItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TopTenItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      setLoading(false);
      return;
    }

    async function fetchTopTen() {
      try {
        // Fetch daily trending recommendations for "Top 10 For Today"
        const res = await fetch("/api/movies/trending");
        if (!res.ok) throw new Error("Failed to fetch trending movies");

        const data = await res.json();
        const movies = data.results || [];

        const formatted: TopTenItem[] = movies.slice(0, 10).map((m: any, idx: number) => {
          let imagePath =
            m.posterUrl ||
            m.poster ||
            (m.poster_path
              ? m.poster_path.startsWith("http")
                ? m.poster_path
                : `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "");

          // Extract primary genres or category fallback
          let category = "Popular";
          if (Array.isArray(m.genre_names) && m.genre_names.length > 0) {
            category = m.genre_names.slice(0, 2).join(" • ");
          } else if (Array.isArray(m.genres) && m.genres.length > 0) {
            category = m.genres
              .map((g: any) => (typeof g === "string" ? g : g.name))
              .slice(0, 2)
              .join(" • ");
          } else if (m.category) {
            category = m.category;
          }

          return {
            rank: idx + 1,
            id: m.id,
            title: m.title || m.name || "Untitled",
            category,
            image: imagePath,
          };
        });

        setItems(formatted);
      } catch (err) {
        console.error("TopTenCarousel fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopTen();
  }, [initialItems]);

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="top-ten__section">
      <div className="top-ten__header">
        <h2 className="top-ten__title">Top 10 Recommendations For Today</h2>

        <div className="top-ten__controls">
          <button
            type="button"
            className="top-ten__nav-btn"
            onClick={() => scroll("left")}
            aria-label="Previous items"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="top-ten__nav-btn"
            onClick={() => scroll("right")}
            aria-label="Next items"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "1rem", overflow: "hidden", padding: "1rem 0" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: "160px", height: "240px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.875rem" }}>
          No recommendations available today.
        </div>
      ) : (
        <div className="top-ten__track" ref={trackRef}>
          {items.map((item) => (
            <Link
              key={item.id ?? item.rank}
              href={item.id ? `/movie/${item.id}` : "#"}
              className="top-ten__card-wrapper"
            >
              <span className="top-ten__rank">{item.rank}</span>

              <div className="top-ten__poster-card">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="160px"
                  className="top-ten__poster-image"
                  unoptimized
                />
                <div className="top-ten__card-overlay">
                  <div className="top-ten__movie-title">{item.title}</div>
                  <div className="top-ten__movie-category">{item.category}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}