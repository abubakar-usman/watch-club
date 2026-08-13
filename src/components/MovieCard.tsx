"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/lib/types";

export type { Movie };

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const poster =
    movie.posterUrl ||
    movie.poster ||
    (movie.poster_path
      ? movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop");

  return (
    <Link href={`/movie/${movie.id}`} className="group block relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all shadow-lg">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={poster}
          alt={movie.title}
          fill
          sizes="200px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <span className="text-white font-semibold text-sm line-clamp-1">{movie.title}</span>
          {movie.category && (
            <span className="text-gray/60 font-mono text-xs">{movie.category}</span>
          )}
        </div>
      </div>
      <div className="p-3 bg-black/40">
        <h3 className="text-white text-xs font-medium line-clamp-1">{movie.title}</h3>
      </div>
    </Link>
  );
}
