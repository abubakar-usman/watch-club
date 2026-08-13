"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";

export default function WatchlistButton({ movieId }: { movieId: number }) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          const items = data.watchlist || [];
          setInWatchlist(items.some((i: any) => i.movie_id === movieId));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [movieId]);

  const toggleWatchlist = async () => {
    setLoading(true);
    try {
      if (inWatchlist) {
        await fetch(`/api/watchlist?movie_id=${movieId}`, { method: "DELETE" });
        setInWatchlist(false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: movieId }),
        });
        setInWatchlist(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
        inWatchlist
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
          : "bg-brand-red hover:bg-brand-red-dark text-white shadow-lg shadow-brand-red/20"
      }`}
    >
      {inWatchlist ? <Check size={18} /> : <Bookmark size={18} />}
      <span>{inWatchlist ? "Saved to Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
}
