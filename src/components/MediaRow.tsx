"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = direction === "left" ? -450 : 450;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="media-row__section">
      <div className="media-row__header">
        <h2 className="media-row__title">{title}</h2>

        <div className="media-row__controls">
          <button
            type="button"
            className="media-row__nav-btn"
            onClick={() => scroll("left")}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="media-row__nav-btn"
            onClick={() => scroll("right")}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>
          No titles found for {title}.
        </div>
      ) : (
        <div className="media-row__track" ref={trackRef}>
          {items.map((item) => (
            <Link key={item.id} href={`/movie/${item.id}`} className="media-row__card">
              <Image
                src={item.image}
                alt={item.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 140px, 180px"
                className="media-row__card-image"
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
