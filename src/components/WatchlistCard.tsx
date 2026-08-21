"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Star, X } from "lucide-react";
import { WatchlistMovie } from "@/lib/types";

interface WatchlistCardProps {
  movie: WatchlistMovie;
  onRemove: (id: number | string) => void;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

export default function WatchlistCard({ movie, onRemove }: WatchlistCardProps) {
  const rawPoster =
    movie.posterUrl ||
    movie.poster ||
    (movie.poster_path
      ? movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "");

  const validPoster = isValidImageUrl(rawPoster) ? rawPoster : null;
  const [posterSrc, setPosterSrc] = useState<string | null>(validPoster);
  const [hasError, setHasError] = useState<boolean>(!validPoster);

  const rating = movie.vote_average ?? movie.user_rating;
  const year = movie.year ?? movie.releaseDate?.slice(0, 4);

  return (
    <div className="group relative rounded-[12px] overflow-hidden bg-[#242426] border border-white/10 hover:border-[#E60813]/50 transition-all duration-250 shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
      {/* Poster */}
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1a1a1c] flex items-center justify-center">
          {!hasError && posterSrc ? (
            <Image
              src={posterSrc}
              alt={movie.title || "Movie poster"}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 200px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-400 gap-2 h-full w-full bg-gradient-to-b from-[#2a2a2e] to-[#161618]">
              <Film size={28} className="text-zinc-500 mb-1" />
              <span className="text-[11px] font-semibold text-zinc-300 line-clamp-2 leading-tight">
                {movie.title}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={() => onRemove(movie.id)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#E60813] hover:border-[#E60813] text-white"
        title="Remove from watchlist"
        id={`remove-watchlist-${movie.id}`}
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* Info */}
      <div className="p-2.5 bg-black/50 border-t border-white/5">
        <h3 className="text-white text-[12px] font-semibold leading-snug line-clamp-1 mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between">
          {year && (
            <span className="text-[#959292] text-[11px]">{year}</span>
          )}
          {rating && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] text-[#C7C7C7] font-medium">
                {Number(rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
        {movie.genre_names && movie.genre_names.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {movie.genre_names.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#959292]"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
