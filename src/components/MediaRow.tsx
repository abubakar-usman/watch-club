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
    <section className="media-row__section">
      <div className="media-row__header">
        <h2 className="media-row__title">{title}</h2>

        {/* Dynamic Dash Progress Indicator (Replaces Arrows) */}
        {items.length > 0 && dashCount > 1 && (
          <div className="dash-indicator" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

      {items.length === 0 ? (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>
          No titles found for {title}.
        </div>
      ) : (
        <div
          className="media-row__track"
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
            <Link key={item.id} href={`/movie/${item.id}`} className="media-row__card" draggable={false}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 140px, 180px"
                className="media-row__card-image"
                draggable={false}
              />

              {item.statusBadge && (
                <span className="media-row__card-badge">{item.statusBadge}</span>
              )}
              <div className="media-row__overlay">
                <div className="media-row__item-title">{item.title}</div>
                {item.category && (
                  <div className="media-row__item-meta">{item.category}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
