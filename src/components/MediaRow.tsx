"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface MediaItem {
  id: string | number;
  title: string;
  category?: string;
  image: string;
  statusBadge?: string;
}

interface MediaRowProps {
  title: string;
  items: MediaItem[];
}

export default function MediaRow({ title, items }: MediaRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dashCount, setDashCount] = useState<number>(3);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

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
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-[1.2] text-white capitalize">{title}</h2>

        {/* Dynamic Dash Progress Indicator */}
        {items.length > 0 && dashCount > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: dashCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDashClick(i)}
                aria-label={`Go to page ${i + 1} for ${title}`}
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

      {/* Track */}
      {items.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-6 text-center text-[#999999] font-mono text-xs">
          No titles found for {title}.
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
          className="flex gap-2 overflow-x-auto scroll-smooth pb-4 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isValidUrl =
              typeof item.image === "string" &&
              item.image.length > 5 &&
              !/^\d+$/.test(item.image) &&
              (item.image.startsWith("http") || item.image.startsWith("/"));

            return (
              <Link
                key={item.id}
                href={`/movie/${item.id}`}
                draggable={false}
                className="relative flex-none w-[262.4px] h-[164px] rounded-[20px] overflow-hidden bg-[#242426] border border-white/[0.12] shadow-[0_6px_16px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:scale-[1.02] hover:border-transparent hover:shadow-[0_10px_24px_rgba(0,0,0,0.7)] group flex items-center justify-center"
              >
                {isValidUrl ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 190px, 240px"
                    className="object-cover transition-opacity duration-150"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2c2c30] to-[#141416] flex flex-col items-center justify-center p-3 text-center text-zinc-400 gap-1.5">
                    <span className="text-[13px] font-semibold text-zinc-200 line-clamp-2">{item.title}</span>
                    {item.category && <span className="text-[11px] text-zinc-400">{item.category}</span>}
                  </div>
                )}

                {item.statusBadge && (
                  <span className="absolute top-2.5 right-2.5 bg-[#E50914] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.7)] z-[5] uppercase tracking-wide">
                    {item.statusBadge}
                  </span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-end p-3 z-10">
                  <div className="text-[0.875rem] font-bold text-white truncate">{item.title}</div>
                  {item.category && (
                    <div className="text-[0.75rem] text-[#CCCCCC]">{item.category}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
