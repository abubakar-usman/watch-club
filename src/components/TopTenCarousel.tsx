"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop";

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

function TopTenCardItem({ item }: { item: TopTenItem }) {
  const [imgSrc, setImgSrc] = useState<string>(item.image || DEFAULT_POSTER);

  useEffect(() => {
    setImgSrc(item.image || DEFAULT_POSTER);
  }, [item.image]);

  return (
    <Link
      href={item.id ? `/movie/${item.id}` : "#"}
      draggable={false}
      className="relative flex-none w-[175px] flex items-end cursor-pointer select-none group"
    >
      {/* Rank number — outlined */}
      <span
        className="absolute left-[-15px] bottom-[-15px] text-[7.5rem] font-black leading-[0.8] text-black pointer-events-none z-[1] transition-all duration-150"
        style={{ WebkitTextStroke: "3px #555555" }}
      >
        {item.rank}
      </span>

      {/* Poster card */}
      <div className="relative w-[155px] h-[225px] ml-auto rounded-2xl overflow-hidden bg-[#333333] border-none shadow-[0_6px_18px_rgba(0,0,0,0.5)] z-[2] transition-all duration-250 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.7)] max-[768px]:w-[130px] max-[768px]:h-[190px]">
        <Image
          src={imgSrc}
          alt={item.title || "Poster"}
          fill
          sizes="160px"
          className="object-cover rounded-2xl transition-opacity duration-150"
          unoptimized
          draggable={false}
          onError={() => setImgSrc(DEFAULT_POSTER)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-end p-3">
          <div className="text-[0.875rem] font-bold text-white mb-0.5 truncate">{item.title}</div>
          <div className="text-[0.75rem] text-[#CCCCCC]">{item.category}</div>
        </div>
      </div>
    </Link>
  );
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
              : "") ||
            DEFAULT_POSTER;

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
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-[1.2] text-white capitalize">
          Top 10 Recommendations For Today
        </h2>

        {/* Dynamic Dash Progress Indicator */}
        {!loading && items.length > 0 && dashCount > 1 && (
          <div className="flex items-center gap-1.5">
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
                  backgroundColor: i === activeIndex ? "#FFFFFF" : "rgba(255,255,255,0.2)",
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
        <div className="flex gap-4 overflow-hidden py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-[160px] h-[240px] bg-white/5 rounded-2xl flex-shrink-0 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-2xl p-8 text-center text-[#999999] font-mono text-sm">
          No recommendations available today.
        </div>
      ) : (
        <div
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
          className="flex gap-3 overflow-x-auto scroll-smooth pt-4 pb-6 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <TopTenCardItem key={item.id ?? item.rank} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}