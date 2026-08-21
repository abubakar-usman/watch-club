"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  CornerDownRight,
  Plus,
} from "lucide-react";
import { Movie } from "@/lib/types";
import WatchNextBanner from "@/components/watchNextBanner";
import { useSession } from "@/lib/auth-client";

type ReactionType = "like" | "love" | "favorite" | "dislike";

interface CommentReply {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface DetailComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  replies: CommentReply[];
}

export default function MovieDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const { data: session } = useSession();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);

  // Multi-select reaction set for positive reactions, or "dislike"
  const [activeReactions, setActiveReactions] = useState<Set<ReactionType>>(new Set());
  const [reactions, setReactions] = useState<{ [key in ReactionType]: number }>({
    like: 0,
    love: 0,
    favorite: 0,
    dislike: 0,
  });

  // Comments State
  const [comments, setComments] = useState<DetailComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const castScrollRef = useRef<HTMLDivElement>(null);

  // Load Movie Details & Recommendations
  useEffect(() => {
    if (!rawId) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }

    async function loadMovieData() {
      setLoading(true);
      setNotFoundState(false);

      try {
        const res = await fetch(`/api/movies/${encodeURIComponent(rawId)}`);
        if (res.ok) {
          const data = await res.json();
          const detail = data.title ? data : data.movie;
          if (detail && detail.title) {
            setMovie(detail);
          } else {
            setNotFoundState(true);
          }
        } else {
          setNotFoundState(true);
        }

        const recRes = await fetch("/api/movies/trending");
        if (recRes.ok) {
          const recData = await recRes.json();
          const items: Movie[] = (recData.results || [])
            .filter((m: Movie) => String(m.id) !== String(rawId))
            .slice(0, 5);
          setRecommendations(items);
        }
      } catch (err) {
        console.error("Error loading movie detail:", err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    loadMovieData();
  }, [rawId]);

  // Load Reactions from API
  useEffect(() => {
    if (!rawId) return;

    async function fetchReactions() {
      try {
        const res = await fetch(`/api/movies/${encodeURIComponent(rawId)}/reactions`);
        if (res.ok) {
          const data = await res.json();
          setReactions({
            like: data.counts?.like || 0,
            love: data.counts?.love || 0,
            favorite: data.counts?.favorite || 0,
            dislike: data.counts?.dislike || 0,
          });

          const userReactions = Array.isArray(data.userReaction)
            ? data.userReaction
            : data.userReaction ? [data.userReaction] : [];
          setActiveReactions(new Set(userReactions));
        }
      } catch (err) {
        console.error("Error fetching reaction data:", err);
      }
    }

    fetchReactions();
  }, [rawId]);

  // Load Comments
  useEffect(() => {
    if (!rawId) return;

    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments/${encodeURIComponent(rawId)}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }

    fetchComments();
  }, [rawId]);

  // Reaction Toggle Handler
  const handleReactionClick = async (type: ReactionType) => {
    const prevSet = new Set(activeReactions);
    const nextSet = new Set(activeReactions);

    if (type === "dislike") {
      if (nextSet.has("dislike")) {
        nextSet.delete("dislike");
      } else {
        nextSet.clear();
        nextSet.add("dislike");
      }
    } else {
      nextSet.delete("dislike");
      if (nextSet.has(type)) {
        nextSet.delete(type);
      } else {
        nextSet.add(type);
      }
    }

    const countDiffs: { [key in ReactionType]?: number } = {};
    const allTypes: ReactionType[] = ["like", "love", "favorite", "dislike"];

    allTypes.forEach((t) => {
      const wasActive = prevSet.has(t);
      const isActive = nextSet.has(t);
      if (wasActive && !isActive) countDiffs[t] = -1;
      if (!wasActive && isActive) countDiffs[t] = 1;
    });

    setActiveReactions(nextSet);
    setReactions((prev) => {
      const updated = { ...prev };
      allTypes.forEach((t) => {
        if (countDiffs[t]) {
          updated[t] = Math.max(0, updated[t] + (countDiffs[t] || 0));
        }
      });
      return updated;
    });

    try {
      await fetch(`/api/movies/${encodeURIComponent(rawId)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactions: Array.from(nextSet) }),
      });
    } catch (err) {
      console.error("Error updating reactions:", err);
      setActiveReactions(prevSet);
      setReactions((prev) => {
        const reverted = { ...prev };
        allTypes.forEach((t) => {
          if (countDiffs[t]) {
            reverted[t] = Math.max(0, reverted[t] - (countDiffs[t] || 0));
          }
        });
        return reverted;
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !session?.user) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: rawId,
          content: newCommentText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [data.comment, ...prev]);
          setNewCommentText("");
        }
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !session?.user) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: rawId,
          content: replyText.trim(),
          parentCommentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentCommentId
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
          setReplyText("");
          setActiveReplyId(null);
        }
      }
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const scrollCastRight = () => {
    if (castScrollRef.current) {
      castScrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Vote Percent Calculations
  const totalVotes = reactions.like + reactions.love + reactions.favorite + reactions.dislike;
  const getPercent = (count: number) => (totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0);

  if (loading) {
    return (
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 flex flex-col gap-8 min-h-[70vh] justify-center">
        <div className="w-full h-[500px] lg:h-[650px] bg-[#302F2F] border border-[#535353] rounded-[10px] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.25fr)_minmax(320px,1fr)] gap-8">
          <div className="flex flex-col gap-8">
            <div className="w-full h-[89px] bg-[#302F2F] border border-[#535353] rounded-[10px] animate-pulse" />
            <div className="w-full h-[600px] bg-[#302F2F] border border-[#535353] rounded-[10px] animate-pulse" />
          </div>
          <div className="flex flex-col gap-8">
            <div className="w-full h-[400px] bg-[#302F2F] border border-[#535353] rounded-[10px] animate-pulse" />
            <div className="w-full h-[400px] bg-[#302F2F] border border-[#535353] rounded-[10px] animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (notFoundState || !movie) {
    return (
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8 min-h-[70vh] justify-center items-center">
        <div className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-12 text-center max-w-[550px] mx-auto">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-3xl font-bold mb-2 text-white">API Error or Title Not Found</h1>
          <p className="text-[#C0C0C0] text-base mb-8">
            We couldn&apos;t load data for matching ID &quot;{rawId}&quot;. Please check back later.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#E60813] text-white hover:bg-[#F40612] transition-colors">
              Back to Home
            </Link>
            <Link href="/movies" className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#3D3D3D] text-white hover:bg-[#484848] border border-[#535353] transition-colors">
              Explore Titles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const posterImage = movie.posterUrl || movie.poster || movie.poster_path || "";
  const backdropImage = movie.backdrop || movie.backdrop_path || posterImage;

  const rawScore = movie.user_rating ?? movie.vote_average ?? null;
  const clubScore = rawScore !== null && rawScore !== undefined ? Number(rawScore).toFixed(1) : "N/A";
  const recommendedPercent = rawScore !== null && rawScore !== undefined ? Math.min(99, Math.round((Number(rawScore) / 10) * 100)) : 0;

  const castList = Array.isArray(movie.cast) ? movie.cast : [];
  const creatorsText = movie.creators && movie.creators.length > 0 ? movie.creators.join(" & ") : "Information not available";
  const castActorsText = castList.length > 0
    ? castList.slice(0, 8).map((c: any) => (typeof c === "string" ? c : c.name || c.actor)).join(", ")
    : "Information not available";

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-8 text-white">

      {/* 1. HERO BANNER */}
      <section
        className="relative w-full rounded-[10px] overflow-hidden min-h-[500px] lg:min-h-[550px] 2xl:h-[650px] flex flex-col lg:flex-row items-center p-6 sm:p-10 lg:p-12 2xl:px-[75px] 2xl:py-16 gap-8 2xl:gap-[77px] shadow-2xl bg-[#282828]"
        style={
          backdropImage
            ? {
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 81.23%, #282828 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.38)), url("${backdropImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : undefined
        }
      >
        <div className="relative w-[240px] sm:w-[280px] lg:w-[320px] 2xl:w-[366px] h-[340px] sm:h-[400px] lg:h-[460px] 2xl:h-[522px] rounded-[30px] overflow-hidden shadow-2xl shrink-0 z-10 hidden sm:flex items-center justify-center bg-[#1F1F1F] border border-[#535353]">
          {posterImage ? (
            <Image
              src={posterImage}
              alt={movie.title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          ) : (
            <span className="text-[#C0C0C0] text-sm font-medium">Poster Unavailable</span>
          )}
        </div>

        <div className="flex flex-col items-start gap-5 lg:gap-6 2xl:gap-[28px] w-full max-w-[633px] z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-[#E60813] text-white rounded-[6px] px-2.5 py-1.5 h-[29px] flex items-center justify-center font-medium text-[14px] leading-[17px] capitalize">
              Featured
            </div>
            <div className="flex items-center gap-1.5 h-[29px] text-[14px]">
              <img
                src="/icons/Vector.png"
                alt="Star"
                className="w-3.5 h-3.5 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span className="font-bold text-white text-[14px] leading-[17px] capitalize">
                {clubScore}/10
              </span>
              <span className="text-[#ECECEC] font-normal text-[12px] leading-[15px] capitalize">
                Club score
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-tight tracking-tight uppercase [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            {movie.title}
          </h1>

          <p className="text-white font-semibold text-[16px] sm:text-[18px] lg:text-[20px] leading-snug max-w-[568px]">
            Add To Watchlist and join the discus box for this {movie.type === "movie" ? "movie" : "series"}.
          </p>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-1 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setInWatchlist((prev) => !prev);
              }}
              className={`rounded-[40px] px-6 py-3.5 h-[56px] min-w-[200px] sm:min-w-[210px] font-bold text-[18px] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 outline-none select-none relative z-20 border ${inWatchlist
                ? "bg-[#1B1B1B] text-white border-[#535353] hover:bg-[#282828]"
                : "bg-[#E60813] text-white border-[#E60813] hover:bg-[#d00711]"
                }`}
            >
              <img
                src="/icons/wplay.png"
                alt=""
                className="w-5 h-5 object-contain shrink-0 pointer-events-none"
              />
              <span className="text-white pointer-events-none">
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </span>
            </button>

            <Link
              href="#discussion"
              className="border-2 border-white hover:bg-white/10 text-white rounded-[40px] px-6 py-3.5 h-[56px] min-w-[190px] sm:min-w-[208px] font-bold text-[18px] flex items-center justify-center gap-2.5 no-underline transition-colors duration-150"
            >
              <Plus size={20} className="text-white shrink-0 pointer-events-none" />
              <span className="text-white pointer-events-none">Join Community</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.25fr)_minmax(320px,1fr)] gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* TOP RATING METRICS */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-[28px]">
            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <Star size={18} className="text-[#FFCC00] fill-[#FFCC00]" />
                <span className="font-bold text-[20px] text-white leading-none">{clubScore}</span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">Club Score</span>
            </div>

            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <ThumbsUp size={18} className="text-[#4A9245] fill-[#4A9245]" />
                <span className="font-bold text-[20px] text-white leading-none">{recommendedPercent}%</span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">Recommended</span>
            </div>

            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={18} className="text-[#007AFF] fill-[#007AFF]" />
                <span className="font-bold text-[20px] text-white leading-none">
                  {movie.vote_count ? `${movie.vote_count}+` : "0+"}
                </span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">Comments</span>
            </div>
          </section>

          {/* MAIN DETAILS CONTAINER */}
          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 lg:p-[24px] flex flex-col gap-6 lg:gap-[24px]">

            <div className="flex flex-col gap-5">
              <h2 className="text-white font-semibold text-[20px] leading-[24px]">
                How Did You Feel About This?
              </h2>

              {/* Reaction Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                {(["like", "love", "favorite", "dislike"] as ReactionType[]).map((type) => {
                  const isActive = activeReactions.has(type);
                  const icons: Record<ReactionType, string> = {
                    like: "/icons/glike.png",
                    love: "/icons/happy.png",
                    favorite: "/icons/pheart.png",
                    dislike: "/icons/dislike.png",
                  };
                  const labels: Record<ReactionType, string> = {
                    like: "Like",
                    love: "Love",
                    favorite: "Favorite",
                    dislike: "Dislike",
                  };

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleReactionClick(type);
                      }}
                      className={`min-h-[56px] w-full rounded-[10px] px-3 sm:px-4 py-2.5 flex items-center justify-center gap-2.5 sm:gap-3.5 cursor-pointer transition-all duration-150 select-none ${isActive
                        ? "bg-[#181818] border border-[#E60813]"
                        : "bg-[#282828] border border-[#535353] hover:bg-[#333333]"
                        }`}
                    >
                      <img
                        src={icons[type]}
                        alt={labels[type]}
                        className="w-5 h-5 object-contain shrink-0 pointer-events-none"
                      />
                      <div className="flex flex-col items-start text-left leading-tight min-w-0 pointer-events-none">
                        <span className="font-bold text-[14px] text-white capitalize truncate w-full">
                          {labels[type]}
                        </span>
                        <span className="font-normal text-[12px] text-[#C0C0C0] truncate w-full">
                          {formatCount(reactions[type])}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Percentage Progress Bars */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">Like</span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34d399] rounded-full transition-all duration-300"
                      style={{ width: `${getPercent(reactions.like)}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {getPercent(reactions.like)}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">Love</span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#fbbf24] rounded-full transition-all duration-300"
                      style={{ width: `${getPercent(reactions.love)}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {getPercent(reactions.love)}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">Favorite</span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f472b6] rounded-full transition-all duration-300"
                      style={{ width: `${getPercent(reactions.favorite)}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {getPercent(reactions.favorite)}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">Dislike</span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ef4444] rounded-full transition-all duration-300"
                      style={{ width: `${getPercent(reactions.dislike)}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {getPercent(reactions.dislike)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-0 border-t border-[#535353]" />

            {/* About Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">about</h2>
              <p className="text-[#C0C0C0] font-normal text-[14px] leading-[22px] uppercase">
                {movie.overview || "No synopsis available for this title."}
              </p>
            </div>

            <div className="w-full h-0 border-t border-[#535353]" />

            {/* Cast Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">Cast</h2>
              </div>

              <div className="relative flex items-center min-w-0">
                {castList.length === 0 ? (
                  <span className="text-[#C0C0C0] text-[14px]">No cast information available.</span>
                ) : (
                  <>
                    <div
                      ref={castScrollRef}
                      className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto pb-2 [scrollbar-width:none]"
                    >
                      {castList.map((member: any, idx: number) => {
                        const actorName = typeof member === "string" ? member : member.name || member.actor || "Actor";
                        const charName = typeof member === "object" ? member.role || member.character || actorName : actorName;
                        const avatarSrc = typeof member === "object" ? member.profile_path || member.image || "" : "";

                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 shrink-0 w-[141px]">
                            <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden bg-[#282828] shrink-0 border border-[#535353] flex items-center justify-center">
                              {avatarSrc ? (
                                <Image src={avatarSrc} alt={actorName} fill unoptimized className="object-cover object-top" />
                              ) : (
                                <span className="text-xs text-[#C0C0C0] font-medium">N/A</span>
                              )}
                            </div>
                            <div className="flex flex-col items-center text-center w-full leading-tight">
                              <span className="font-medium text-[14px] text-white capitalize truncate w-full">{charName}</span>
                              <span className="font-normal text-[12px] text-[#C0C0C0] capitalize truncate w-full">{actorName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={scrollCastRight}
                      className="w-[36px] h-[36px] rounded-full bg-[#4F4E4E]/80 hover:bg-[#666666] border border-white/20 flex items-center justify-center shrink-0 ml-2 cursor-pointer transition-colors"
                      aria-label="Scroll cast right"
                    >
                      <ChevronRight size={18} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full h-0 border-t border-[#535353]" />

            {/* Comments Section */}
            <div id="discussion" className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">comments</h2>

              {!session?.user ? (
                <div className="bg-[#3D3D3D] border border-[#535353] rounded-[8px] p-4 text-center">
                  <span className="text-[#C0C0C0] text-[14px]">
                    Please{" "}
                    <Link href="/login" className="text-[#E60813] hover:underline font-semibold">
                      Log in to comment
                    </Link>{" "}
                    and join the discussion.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="flex items-center gap-2 w-full">
                  <div className="flex-1 bg-[#3D3D3D] rounded-[8px] h-[54px] px-6 flex items-center">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="what's on your mind?"
                      className="w-full bg-transparent outline-none text-white text-[14px] placeholder:text-[#959292] placeholder:text-[12px] placeholder:capitalize font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="bg-[#3D3D3D] hover:bg-[#4a4a4a] text-white rounded-[8px] h-[54px] px-5 flex items-center justify-center font-normal text-[12px] capitalize transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    send
                  </button>
                </form>
              )}

              {comments.length === 0 ? (
                <div className="text-center py-4 text-[#C0C0C0] text-[14px] lowercase">no comments yet!</div>
              ) : (
                <div className="flex flex-col gap-4 pt-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-[#282828] border border-[#535353] rounded-[10px] p-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#3D3D3D] flex items-center justify-center">
                          {comment.userAvatar ? (
                            <Image src={comment.userAvatar} alt={comment.userName} fill unoptimized className="object-cover" />
                          ) : (
                            <span className="text-xs text-white font-bold">{comment.userName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[14px] font-semibold text-white">{comment.userName}</span>
                          <span className="text-[11px] text-[#999999] pt-1">{comment.createdAt}</span>
                        </div>
                      </div>

                      <p className="text-[14px] text-[#C0C0C0] leading-relaxed pl-11">{comment.text}</p>

                      <div className="pl-11">
                        {!session?.user ? (
                          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#999999] hover:text-[#E60813] transition-colors">
                            <CornerDownRight size={14} />
                            <span>Log in to reply</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#999999] hover:text-[#E60813] transition-colors"
                          >
                            <CornerDownRight size={14} />
                            <span>Reply</span>
                          </button>
                        )}
                      </div>

                      {activeReplyId === comment.id && (
                        <div className="ml-11 mt-1 flex items-center gap-2 bg-[#3D3D3D] rounded-[8px] p-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to @${comment.userName.toLowerCase().replace(/\s+/g, "")}...`}
                            className="flex-1 bg-transparent border-none outline-none text-white text-[13px] px-2 placeholder:text-[#959292]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="bg-[#E60813] hover:bg-[#F40612] text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                          >
                            Send
                          </button>
                        </div>
                      )}

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-11 mt-1 pl-4 border-l border-[#535353] flex flex-col gap-2.5">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#3D3D3D] flex items-center justify-center">
                                  {reply.userAvatar ? (
                                    <Image src={reply.userAvatar} alt={reply.userName} fill unoptimized className="object-cover" />
                                  ) : (
                                    <span className="text-[10px] text-white font-bold">{reply.userName.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <span className="text-[13px] font-semibold text-white">{reply.userName}</span>
                                <span className="text-[11px] text-[#999999]">{reply.createdAt}</span>
                              </div>
                              <p className="text-[13px] text-[#C0C0C0] pl-8">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN SIDEBAR */}
        <div className="flex flex-col gap-8">
          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">worth watching?</h2>
              <div className="font-semibold text-[24px] text-[#34d399] leading-none py-1">
                {recommendedPercent >= 70 ? "Yes" : "N/A"}
              </div>
              <p className="text-[#C0C0C0] font-normal text-[14px] lowercase leading-snug">
                {recommendedPercent}% of members recommended this {movie.type === "movie" ? "movie" : "series"}.
              </p>
            </div>

            <div className="w-full h-0 border-t border-[#535353]" />

            <div className="flex flex-col gap-3">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">details</h2>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">creator</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1 break-words">{creatorsText}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">cast/voice actor</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1 break-words">{castActorsText}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">release</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.releaseDate || movie.year || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">episodes</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.episodes || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">seasons</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.seasons || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">run time</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.runtime || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">genre</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.genre_names?.join(", ") || movie.category || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">country</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.country || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">network</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.network || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">status</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.status || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">language</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.language || "-"}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">also known as</span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">{movie.alsoKnownAs || "-"}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 flex flex-col gap-4">
            <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">you may also like</h2>
            <div className="flex flex-col gap-3">
              {recommendations.length === 0 ? (
                <div className="text-[#C0C0C0] text-sm py-4">No recommendations available.</div>
              ) : (
                recommendations.map((item: any) => {
                  const itemPoster = item.posterUrl || item.poster || item.poster_path || "";
                  const itemScoreRaw = item.user_rating ?? item.vote_average ?? null;
                  const itemScore = itemScoreRaw !== null && itemScoreRaw !== undefined ? Number(itemScoreRaw).toFixed(1) : "N/A";

                  return (
                    <Link
                      key={item.id}
                      href={`/movie/${item.id}`}
                      className="flex items-center gap-5 p-1 rounded-md hover:bg-[#3D3D3D]/50 transition-colors group no-underline"
                    >
                      <div className="relative w-[80px] h-[80px] rounded-[6px] overflow-hidden shrink-0 bg-[#282828] border border-[#535353] flex items-center justify-center">
                        {itemPoster ? (
                          <Image src={itemPoster} alt={item.title} fill unoptimized className="object-cover" />
                        ) : (
                          <span className="text-[10px] text-[#C0C0C0]">No Image</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                        <h3 className="font-medium text-[14px] text-white capitalize truncate group-hover:text-[#E60813] transition-colors leading-tight">
                          {item.title}
                        </h3>

                        <div className="flex items-center justify-between text-[12px] text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{item.year || "-"}</span>
                            <span className="w-1 h-1 rounded-full bg-[#D9D9D9] inline-block" />
                            <span className="capitalize">{item.genre_names?.[0] || item.category || "-"}</span>
                            <span className="w-1 h-1 rounded-full bg-[#D9D9D9] inline-block" />
                            <span>{item.type === "movie" ? "Movie" : "Series"}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <img src="/icons/Vector.png" alt="Star" className="w-2.5 h-2.5 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            <span className="text-[12px] font-normal text-white">{itemScore}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <WatchNextBanner />
    </main>
  );
}