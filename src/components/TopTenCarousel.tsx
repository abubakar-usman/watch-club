"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface TopTenItem {
  rank: number;
  id?: string | number;
  title: string;
  category: string;
  image: string;
}

interface TopTenApiMovie {
  id?: string | number;
  title?: string;
  name?: string;
  posterUrl?: string;
  poster?: string;
  poster_path?: string;
  genre_names?: string[];
  genres?: (string | { name: string })[];
  category?: string;
}

export default function TopTenCarousel({ items: initialItems }: { items?: TopTenItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TopTenItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);

  const [dashCount, setDashCount] = useState<number>(3);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) return;

    async function fetchTopTen() {
      try {
        const res = await fetch("/api/movies/trending");
        if (!res.ok) throw new Error("Failed to fetch trending movies");

        const data = await res.json();
        const movies = data.results || [];

        const formatted: TopTenItem[] = movies.slice(0, 10).map((m: TopTenApiMovie, idx: number) => {
          const imagePath =
            m.posterUrl ||
            m.poster ||
            (m.poster_path
              ? m.poster_path.startsWith("http")
                ? m.poster_path
                : `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "");

          let category = "Popular";
          if (Array.isArray(m.genre_names) && m.genre_names.length > 0) {
            category = m.genre_names.slice(0, 2).join(" • ");
          } else if (Array.isArray(m.genres) && m.genres.length > 0) {
            category = m.genres
              .map((g) => (typeof g === "string" ? g : g.name))
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

  const updatePagination = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollWidth = track.scrollWidth;
    const clientWidth = track.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 10) {
      setDashCount(1);
      setActiveIndex(0);
      return;
    }

    const calculatedPages = Math.ceil(scrollWidth / clientWidth);
    const count = Math.min(8, Math.max(2, calculatedPages));
    setDashCount(count);

    const scrollLeft = track.scrollLeft;
    const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
    const idx = Math.min(count - 1, Math.round(progress * (count - 1)));
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    updatePagination();
    window.addEventListener("resize", updatePagination);
    return () => window.removeEventListener("resize", updatePagination);
  }, [items, updatePagination]);

  const handleScroll = () => {
    updatePagination();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeftState(trackRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleDashClick = (i: number) => {
    if (!trackRef.current) return;
    const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    const targetScroll = (i / (dashCount - 1)) * maxScroll;
    trackRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  return (
    <section className="top-ten__section">
      <div className="top-ten__header">
        <h2 className="top-ten__title">Top 10 Recommendations For Today</h2>

        {/* Dynamic Dash Progress Indicator (Replaces Arrows) */}
        {!loading && items.length > 0 && dashCount > 1 && (
          <div className="dash-indicator" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {Array.from({ length: dashCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDashClick(i)}
                aria-label={`Go to page ${i + 1}`}
                style={{
                  width: i === activeIndex ? "24px" : "14px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: i === activeIndex ? "var(--accent-white, #FFFFFF)" : "rgba(255,255,255,0.2)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease-in-out",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "1rem", overflow: "hidden", padding: "1rem 0" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: "160px",
                height: "240px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "var(--radius-lg)",
                flexShrink: 0,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "monospace",
            fontSize: "0.875rem",
          }}
        >
          No recommendations available today.
        </div>
      ) : (
        <div
          className="top-ten__track"
          ref={trackRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: isDragging ? "none" : "auto",
          }}
        >
          {items.map((item) => (
            <Link
              key={item.id ?? item.rank}
              href={item.id ? `/movie/${item.id}` : "#"}
              className="top-ten__card-wrapper"
              draggable={false}
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
                  draggable={false}
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