"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film } from "lucide-react";
import { Movie } from "@/lib/types";

export type { Movie };

interface MovieCardProps {
  movie: Movie;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (/^\d+$/.test(trimmed)) return false; // Raw numeric string like "11817"
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
}

export default function MovieCard({ movie }: MovieCardProps) {
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

  useEffect(() => {
    const valid = isValidImageUrl(rawPoster) ? rawPoster : null;
    setPosterSrc(valid);
    setHasError(!valid);
  }, [rawPoster]);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group block relative rounded-2xl overflow-hidden bg-[#242426] border border-white/10 hover:border-white/25 transition-all shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1a1a1c] flex items-center justify-center">
        {!hasError && posterSrc ? (
          <Image
            src={posterSrc}
            alt={movie.title || "Movie poster"}
            fill
            sizes="(max-width: 768px) 160px, 220px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-400 gap-2 h-full w-full bg-gradient-to-b from-[#2a2a2e] to-[#161618]">
            <Film size={32} className="text-zinc-500 mb-1" />
            <span className="text-[12px] font-semibold text-zinc-300 line-clamp-2 leading-tight">
              {movie.title}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <span className="text-white font-semibold text-xs leading-snug line-clamp-2">{movie.title}</span>
          {movie.category && (
            <span className="text-zinc-400 text-[11px] mt-0.5 truncate">{movie.category}</span>
          )}
        </div>
      </div>
      <div className="p-2.5 bg-black/60 border-t border-white/5">
        <h3 className="text-white text-[13px] font-medium leading-snug line-clamp-1 group-hover:text-zinc-200">
          {movie.title}
        </h3>
      </div>
    </Link>
  );
}
