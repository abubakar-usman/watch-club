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
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-[1.2] text-white capitalize">Most Discussed This Week</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-[34px] h-[34px] rounded-full bg-[#333333] border border-white/[0.12] text-white flex items-center justify-center transition-all duration-150 cursor-pointer hover:bg-[#E50914] hover:border-[#E50914] hover:shadow-[0_0_12px_rgba(229,9,20,0.35)]"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="w-[34px] h-[34px] rounded-full bg-[#333333] border border-white/[0.12] text-white flex items-center justify-center transition-all duration-150 cursor-pointer hover:bg-[#E50914] hover:border-[#E50914] hover:shadow-[0_0_12px_rgba(229,9,20,0.35)]"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Track */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[320px] h-[144px] bg-white/5 rounded-2xl flex-shrink-0 animate-pulse"
            />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-2xl p-8 text-center text-[#999999] font-mono text-sm">
          No discussions yet for this week.
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/movie/${thread.id}#discussion`}
              className="flex-none w-[360px] bg-[#333333] border border-white/[0.12] rounded-xl p-[0.85rem] flex gap-4 items-center cursor-pointer shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-all duration-250 hover:-translate-y-1 hover:border-[#E50914] hover:shadow-[0_12px_24px_rgba(0,0,0,0.8),0_0_18px_rgba(229,9,20,0.35)] max-[768px]:w-[300px] group"
            >
              {/* Thumbnail */}
              <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden flex-shrink-0 max-[768px]:w-[90px] max-[768px]:h-[90px]">
                <Image
                  src={thread.image}
                  alt={thread.title}
                  fill
                  unoptimized
                  sizes="110px"
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="text-[0.95rem] font-bold text-white leading-[1.3] line-clamp-2">
                  {thread.title}
                </div>

                <div className="flex items-center gap-1.5 text-[0.8rem] text-[#E50914] font-semibold">
                  <MessageSquare size={14} className="text-[#E50914]" />
                  <span>{thread.commentCount}</span>
                </div>

                <div className="flex items-center gap-3 mt-0.5">
                  {thread.avatars && thread.avatars.length > 0 && (
                    <div className="flex items-center">
                      {thread.avatars.map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          alt="User avatar"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full border-2 border-[#333333] -ml-2 first:ml-0 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-[0.75rem] font-bold text-[#E50914] ml-1">
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
