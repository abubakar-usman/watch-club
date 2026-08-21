"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Bookmark,
  ChevronDown,
  Star,
  User,
  BookmarkPlus,
  Users,
} from "lucide-react";
import WatchlistCard from "@/components/WatchlistCard";
import { WatchlistMovie } from "@/lib/types";

type SortKey = "date" | "title" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date Added" },
  { key: "title", label: "Title (A–Z)" },
  { key: "rating", label: "Rating" },
];

function sortWatchlist(movies: WatchlistMovie[], key: SortKey): WatchlistMovie[] {
  const arr = [...movies];
  switch (key) {
    case "title":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "rating":
      return arr.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    case "date":
    default:
      return arr.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
  }
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWatchlistApi() {
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          if (data.watchlist && Array.isArray(data.watchlist)) {
            const moviePromises = data.watchlist.map(async (item: { movie_id: number; added_at?: string }) => {
              try {
                const mRes = await fetch(`/api/movies/${item.movie_id}`);
                if (mRes.ok) {
                  const mData = await mRes.json();
                  return { ...mData, addedAt: item.added_at || new Date().toISOString() } as WatchlistMovie;
                }
              } catch {
                return null;
              }
              return null;
            });
            const fetched = (await Promise.all(moviePromises)).filter((m): m is WatchlistMovie => m !== null);
            setWatchlist(fetched);
          }
        }
      } catch {
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlistApi();
  }, []);

  const handleRemove = useCallback(async (id: number | string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/watchlist?movie_id=${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  }, []);

  const sorted = sortWatchlist(watchlist, sortKey);
  const avgRating =
    watchlist.length > 0
      ? (
          watchlist.reduce((s, m) => s + (m.vote_average ?? 0), 0) /
          watchlist.length
        ).toFixed(1)
      : null;

  return (
    <div className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-[12px] border border-[#535353] p-6 sm:p-8 overflow-hidden bg-[#302F2F]"
      >
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#E50914]/10 border border-[#E50914]/25"
            >
              <Bookmark size={26} className="text-[#E50914]" />
            </div>

            <div>
              <h1 className="text-white font-semibold text-[24px] sm:text-[28px] leading-tight font-heading">
                My Watchlist
              </h1>
              <p className="text-[#A0A0A0] text-[14px] mt-0.5">
                Track the movies you want to watch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:border-l sm:border-[#535353] sm:pl-8">
            <div className="text-center">
              <span className="block text-white font-bold text-[22px]">
                {watchlist.length}
              </span>
              <span className="text-[#A0A0A0] text-[11px] uppercase tracking-wide">
                Movies
              </span>
            </div>
            {avgRating && (
              <>
                <div className="w-px h-10 bg-[#535353]" />
                <div className="text-center flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold text-[22px]">
                      {avgRating}
                    </span>
                  </div>
                  <span className="text-[#A0A0A0] text-[11px] uppercase tracking-wide">
                    Avg Rating
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-4 mt-5 pt-5 border-t border-[#535353]">
          <Link
            href="/portal"
            className="flex items-center gap-1.5 text-[#A0A0A0] hover:text-white text-[13px] transition-colors"
            id="watchlist-goto-profile"
          >
            <User size={14} />
            Go to Profile
          </Link>
          <div className="w-px h-4 bg-[#535353]" />
          <Link
            href="/movies"
            className="flex items-center gap-1.5 text-[#A0A0A0] hover:text-white text-[13px] transition-colors"
          >
            <Film size={14} />
            Browse Movies
          </Link>
        </div>
      </div>

      {/* ── Watchlist Controls ───────────────────────────────────────────── */}
      {watchlist.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-white font-semibold text-[16px]">
            {watchlist.length}{" "}
            {watchlist.length === 1 ? "Movie" : "Movies"} Saved
          </h2>

          <div className="relative">
            <button
              id="watchlist-sort-btn"
              onClick={() => setIsSortOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium text-white border border-[#535353] bg-[#302F2F] hover:border-white/30 transition-all"
            >
              Sort By:{" "}
              {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isSortOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#535353] shadow-2xl z-50 overflow-hidden bg-[#302F2F]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    id={`watchlist-sort-${opt.key}`}
                    onClick={() => {
                      setSortKey(opt.key);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[13px] transition-colors ${
                      sortKey === opt.key
                        ? "text-[#E50914] bg-[#E50914]/10"
                        : "text-[#C7C7C7] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Movie Grid or Empty State ────────────────────────────────────── */}
      {watchlist.length === 0 ? (
        <div
          className="w-full rounded-[12px] bg-[#282828] border border-[#535353] py-[40px] px-[16px] sm:px-[84px] flex flex-col items-center justify-center gap-[28px] text-center"
          id="watchlist-page-empty-state"
        >
          {/* Image: 248px x 200px */}
          <div className="relative w-[248px] h-[200px] flex-shrink-0">
            <Image
              src="/watchlist.png"
              alt="Looking for something to add"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Frame 104: Text + CTA wrapper */}
          <div className="flex flex-col items-center justify-center gap-[40px] w-full max-w-[984px]">
            {/* Text block */}
            <div className="flex flex-col items-center justify-center gap-[8px] w-full max-w-[984px]">
              <h2 className="font-heading font-semibold text-[24px] leading-[28px] text-white capitalize text-center">
                Looking for something to add?
              </h2>
              <p className="font-sans font-medium text-[16px] leading-[19px] text-white capitalize text-center max-w-[984px]">
                Your watchlist is where great stories wait. Save movies and series you want to watch, and never lose track of what’s next.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row items-center justify-center gap-[16px] flex-wrap">
              {/* Btn 1: Explore Movies & Series */}
              <Link
                href="/movies"
                id="empty-browse-movies-btn"
                className="h-[34px] min-w-[218px] px-[12px] py-[8px] bg-[#E60813] hover:bg-[#c5070f] rounded-[10px] flex flex-row items-center justify-center gap-[8px] text-white transition-colors"
              >
                <Film size={18} />
                <span className="font-sans font-medium text-[14px] leading-[17px] capitalize text-white whitespace-nowrap">
                  Explore movies &amp; series
                </span>
              </Link>

              {/* Btn 2: Go To Community */}
              <Link
                href="/community"
                className="h-[34px] min-w-[170px] px-[12px] py-[8px] bg-[#E60813] hover:bg-[#c5070f] rounded-[10px] flex flex-row items-center justify-center gap-[8px] text-white transition-colors"
              >
                <Users size={18} />
                <span className="font-sans font-medium text-[14px] leading-[17px] capitalize text-white whitespace-nowrap">
                  Go to community
                </span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {sorted.map((movie) => (
            <WatchlistCard
              key={movie.id}
              movie={movie}
              onRemove={handleRemove}
            />
          ))}

          <Link
            href="/movies"
            id="watchlist-add-movie-card"
            className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#535353] aspect-[2/3] text-[#959292] hover:border-[#E50914] hover:text-[#E50914] transition-all group bg-[#181818]"
          >
            <BookmarkPlus size={24} className="mb-2" />
            <span className="text-[11px] font-medium text-center px-2">
              Add Movie
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
