"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Movie } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      else params.set("query", "a");

      const res = await fetch(`/api/movies/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let items: Movie[] = data.results || [];

        if (selectedGenre !== "all") {
          items = items.filter(
            (m) =>
              m.category?.toLowerCase() === selectedGenre.toLowerCase() ||
              (m.genre_names && m.genre_names.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()))
          );
        }

        if (selectedType !== "all") {
          items = items.filter((m) => m.type === selectedType);
        }

        setResults(items);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [query, selectedGenre, selectedType]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const genres = [
    "all",
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Sci-Fi",
    "Thriller",
    "Western",
  ];

  return (
    <main className="w-full max-w-[1400px] mx-auto space-y-8 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="font-heading text-3xl text-white flex items-center gap-3">
          <SearchIcon className="text-brand-red" size={28} />
          <span>Discover & Search</span>
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, genres..."
            className="w-full bg-black/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-red/50 transition-colors"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray/50" size={18} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-gray">
            <Filter size={14} />
            <span>GENRE:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-full font-mono text-xs border transition-colors ${selectedGenre === g
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-white/5 border-white/10 text-gray hover:text-white"
                  }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1 rounded-lg font-mono text-xs ${selectedType === "all" ? "bg-white/20 text-white" : "text-gray"
                }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedType("movie")}
              className={`px-3 py-1 rounded-lg font-mono text-xs ${selectedType === "movie" ? "bg-brand-red text-white" : "text-gray"
                }`}
            >
              MOVIES
            </button>
            <button
              onClick={() => setSelectedType("series")}
              className={`px-3 py-1 rounded-lg font-mono text-xs ${selectedType === "series" ? "bg-brand-red text-white" : "text-gray"
                }`}
            >
              SERIES
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-black/40 border border-white/8 rounded-2xl p-12 text-center text-gray space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="font-heading text-white text-lg">No matching results found</p>
          <p className="text-xs font-mono text-gray/50">Try broadening your search term or selecting another genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/movie/${m.id}`}
              className="group bg-black/40 border border-white/8 hover:border-brand-red/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={
                    m.posterUrl ||
                    m.poster ||
                    m.poster_path ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop"
                  }
                  alt={m.title}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {m.statusBadge && (
                  <span className="absolute top-2 right-2 bg-brand-red/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur">
                    {m.statusBadge}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <h3 className="font-heading text-sm text-white line-clamp-1 group-hover:text-brand-red transition-colors">
                  {m.title}
                </h3>
                <p className="font-mono text-[11px] text-gray/60 line-clamp-1">
                  {m.genre_names?.join(" • ") || m.category || "Media"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[1400px] mx-auto space-y-8 py-6 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-10 bg-white/5 rounded-xl w-64" />
        <div className="h-12 bg-white/5 rounded-2xl max-w-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
