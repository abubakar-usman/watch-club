"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

export interface DiscussionThread {
  id: string | number;
  title: string;
  commentCount: string;
  participantsCount: string;
  image: string;
  avatars: string[];
}

export default function MostDiscussedRow({
  threads: initialThreads,
}: {
  threads?: DiscussionThread[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<DiscussionThread[]>(initialThreads || []);
  const [loading, setLoading] = useState(!initialThreads || initialThreads.length === 0);

  useEffect(() => {
    if (initialThreads && initialThreads.length > 0) {
      setThreads(initialThreads);
      setLoading(false);
      return;
    }

    async function fetchMostDiscussed() {
      try {
        const res = await fetch("/api/movies/trending/community");
        if (res.ok) {
          const data = await res.json();
          const movies = data.results || [];
          const formatted: DiscussionThread[] = movies.map((m: any) => ({
            id: m.id,
            title: m.title,
            commentCount: typeof m.comment_count === "number"
              ? `${m.comment_count} Comments`
              : m.overview?.includes("reviews")
              ? m.overview.split("with ")[1] || "Community Discussion"
              : `${m.vote_count || 0} Reviews`,
            participantsCount: "Community Active",
            image:
              m.posterUrl ||
              m.poster ||
              (m.poster_path
                ? m.poster_path.startsWith("http")
                  ? m.poster_path
                  : `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : ""),
            avatars: [],
          }));
          setThreads(formatted);
        }
      } catch {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    }

    fetchMostDiscussed();
  }, [initialThreads]);

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="discussed__section">
      <div className="discussed__header">
        <h2 className="discussed__title">Most Discussed This Week</h2>

        <div className="discussed__controls">
          <button
            type="button"
            className="discussed__nav-btn"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="discussed__nav-btn"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "1rem", overflow: "hidden", padding: "1rem 0" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: "320px", height: "144px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.875rem" }}>
          No discussions yet for this week.
        </div>
      ) : (
        <div className="discussed__track" ref={trackRef}>
          {threads.map((thread) => (
            <Link key={thread.id} href={`/movie/${thread.id}#discussion`} className="discussed__card">
              <div className="discussed__thumbnail-wrapper">
                <Image
                  src={thread.image}
                  alt={thread.title}
                  fill
                  unoptimized
                  sizes="110px"
                  className="discussed__thumbnail"
                />
              </div>

              <div className="discussed__content">
                <div className="discussed__thread-title">{thread.title}</div>

                <div className="discussed__meta-row">
                  <MessageSquare size={14} className="discussed__comment-icon" />
                  <span>{thread.commentCount}</span>
                </div>

                <div className="discussed__stats-row">
                  {thread.avatars && thread.avatars.length > 0 && (
                    <div className="discussed__avatar-group">
                      {thread.avatars.map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          alt="User avatar"
                          width={24}
                          height={24}
                          className="discussed__avatar"
                        />
                      ))}
                    </div>
                  )}
                  <span className="discussed__participant-count">
                    {thread.participantsCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
