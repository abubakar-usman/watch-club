"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Check,
  ChevronRight,
  Send,
  CornerDownRight,
  Plus,
} from "lucide-react";
import { Movie } from "@/lib/types";
import WatchNextBanner from "@/components/watchNextBanner";

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop";

const DEFAULT_BACKDROP =
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop";

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

  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);

  // Reaction Bar States
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactions, setReactions] = useState({
    like: { count: 0, percent: 0 },
    love: { count: 0, percent: 0 },
    favorite: { count: 0, percent: 0 },
    dislike: { count: 0, percent: 0 },
  });

  // Comments State
  const [comments, setComments] = useState<DetailComment[]>([]);

  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const castScrollRef = useRef<HTMLDivElement>(null);

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
          const trendingRes = await fetch("/api/movies/trending");
          if (trendingRes.ok) {
            const trData = await trendingRes.json();
            const found = (trData.results || []).find((m: any) => String(m.id) === String(rawId));
            if (found) {
              setMovie(found);
            } else {
              setNotFoundState(true);
            }
          } else {
            setNotFoundState(true);
          }
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

  const handleReactionClick = (key: "like" | "love" | "favorite" | "dislike") => {
    setUserReaction(key);
    setReactions((prev) => {
      const newCounts = {
        ...prev,
        [key]: {
          ...prev[key],
          count: prev[key].count + 1,
        },
      };
      const total = Object.values(newCounts).reduce((acc, curr) => acc + curr.count, 0);
      return {
        like: { ...newCounts.like, percent: total > 0 ? Math.round((newCounts.like.count / total) * 100) : 0 },
        love: { ...newCounts.love, percent: total > 0 ? Math.round((newCounts.love.count / total) * 100) : 0 },
        favorite: { ...newCounts.favorite, percent: total > 0 ? Math.round((newCounts.favorite.count / total) * 100) : 0 },
        dislike: { ...newCounts.dislike, percent: total > 0 ? Math.round((newCounts.dislike.count / total) * 100) : 0 },
      };
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: DetailComment = {
      id: `c_${Date.now()}`,
      userName: "You (Member)",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: newCommentText.trim(),
      createdAt: "Just now",
      replies: [],
    };

    setComments([newC, ...comments]);
    setNewCommentText("");
  };

  const handleAddReply = (parentCommentId: string) => {
    if (!replyText.trim()) return;

    const newReply: CommentReply = {
      id: `r_${Date.now()}`,
      userName: "You (Member)",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: replyText.trim(),
      createdAt: "Just now",
    };

    setComments((prev) =>
      prev.map((c) =>
        c.id === parentCommentId
          ? { ...c, replies: [...c.replies, newReply] }
          : c
      )
    );

    setReplyText("");
    setActiveReplyId(null);
  };

  const scrollCastRight = () => {
    if (castScrollRef.current) {
      castScrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-0 py-8 pb-16 flex flex-col gap-8 min-h-[70vh] justify-center">
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
      <main className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-0 py-16 flex flex-col gap-8 min-h-[70vh] justify-center items-center">
        <div className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-12 text-center max-w-[550px] mx-auto">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-3xl font-bold mb-2 text-white">Title Not Found</h1>
          <p className="text-[#C0C0C0] text-base mb-8">
            We couldn&apos;t find a movie or series matching ID &quot;{rawId}&quot;. It may have been removed or the link might be incorrect.
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

  const posterImage =
    movie.posterUrl ||
    movie.poster ||
    (movie.poster_path
      ? movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : DEFAULT_POSTER);

  const backdropImage =
    movie.backdrop ||
    movie.backdrop_path ||
    posterImage ||
    DEFAULT_BACKDROP;

  const rawScore = movie.user_rating ?? movie.vote_average ?? null;
  const clubScore = rawScore !== null && rawScore !== undefined ? Number(rawScore).toFixed(1) : "N/A";
  const recommendedPercent = rawScore !== null && rawScore !== undefined ? Math.min(99, Math.round((Number(rawScore) / 10) * 100)) : 0;

  const castList = Array.isArray(movie.cast) ? movie.cast : [];

  const creatorsText = movie.creators && movie.creators.length > 0
    ? movie.creators.join(" & ")
    : "Information not available";

  const castActorsText = castList.length > 0
    ? castList
      .slice(0, 8)
      .map((c: any) => (typeof c === "string" ? c : c.name || c.actor))
      .join(", ")
    : "Information not available";

  return (
    <main className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-0 py-6 pb-16 flex flex-col gap-8 text-white">

      {/* 1. HERO BANNER (Frame 43 / detail) */}
      <section
        className="relative w-full rounded-[10px] overflow-hidden min-h-[500px] lg:h-auto xl:h-[650px] flex flex-col xl:flex-row items-center p-6 sm:p-10 lg:p-10 xl:px-[75px] xl:py-16 gap-8 xl:gap-[77px] shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 81.23%, #282828 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.38)), url("${backdropImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Poster (126100858316120595 1) */}
        <div className="relative w-[240px] sm:w-[300px] lg:w-[300px] xl:w-[366px] h-[340px] sm:h-[430px] lg:h-[430px] xl:h-[522px] rounded-[30px] overflow-hidden shadow-2xl shrink-0 z-10 hidden sm:block">
          <Image
            src={posterImage}
            alt={movie.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>

        {/* Content Info (Frame 37) */}
        <div className="flex flex-col items-start gap-5 lg:gap-6 xl:gap-[28px] w-full max-w-[633px] z-10">

          {/* Badges Button Row (button) */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Featured Badge */}
            <div className="bg-[#E60813] text-white rounded-[6px] px-2 py-1.5 h-[29px] flex items-center justify-center font-medium text-[14px] leading-[17px] capitalize">
              Featured
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-1.5 h-[29px] text-[14px]">
              {/* Star Icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Vector.png"
                alt="Star"
                className="w-3.5 h-3.5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="font-bold text-white text-[14px] leading-[17px] capitalize">
                {clubScore}/10
              </span>
              <span className="text-[#ECECEC] font-normal text-[12px] leading-[15px] capitalize">
                Club score
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-tight tracking-tight uppercase [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            {movie.title}
          </h1>

          {/* Subtitle / Callout Text */}
          <p className="text-white font-semibold text-[16px] sm:text-[18px] lg:text-[20px] leading-snug uppercase max-w-[568px]">
            ADD TO WATCHLIST AND JOIN THE DISCUSSION BOX FOR THIS {movie.type === "movie" ? "MOVIE" : "SERIES"}.
          </p>

          {/* Action Buttons Row (button) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-1">
            {/* Add To Watchlist Button - Solid Red Theme, No Glow Animation */}
            <button
              type="button"
              onClick={() => setInWatchlist(!inWatchlist)}
              className="bg-[#E60813] hover:bg-[#d00711] text-white rounded-[40px] px-6 py-3.5 h-[56px] min-w-[200px] sm:min-w-[210px] font-bold text-[18px] flex items-center justify-center gap-2.5 cursor-pointer transition-colors duration-150"
            >
              {inWatchlist ? (
                <>
                  <Check size={20} className="text-white" />
                  <span className="text-white">In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus size={20} className="text-white" />
                  <span className="text-white">Add to Watchlist</span>
                </>
              )}
            </button>

            {/* Join Community Button */}
            <Link
              href="#discussion"
              className="border-2 border-white hover:bg-white/10 text-white rounded-[40px] px-6 py-3.5 h-[56px] min-w-[190px] sm:min-w-[208px] font-bold text-[18px] flex items-center justify-center gap-2.5 no-underline transition-colors duration-150"
            >
              <Plus size={20} className="text-white" />
              <span className="text-white">Join Community</span>
            </Link>
          </div>

        </div>
      </section>


      {/* 2. MAIN 2-COLUMN LAYOUT (page) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.25fr)_minmax(320px,1fr)] gap-8 items-start">

        {/* LEFT COLUMN (left side) */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* TOP 3 RATING METRICS ROW (rate) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-[28px]">
            {/* Club Score Card */}
            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                {/* Yellow Star Icon */}
                <Star size={18} className="text-[#FFCC00] fill-[#FFCC00]" />
                <span className="font-bold text-[20px] text-white leading-none">
                  {clubScore}
                </span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">
                Club Score
              </span>
            </div>

            {/* Recommended Card */}
            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                {/* Green Thumbs-up */}
                <ThumbsUp size={18} className="text-[#4A9245] fill-[#4A9245]" />
                <span className="font-bold text-[20px] text-white leading-none">
                  {recommendedPercent}%
                </span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">
                Recommended
              </span>
            </div>

            {/* Comments Card */}
            <div className="bg-[#242424] border border-[#535353] rounded-[10px] h-[89px] flex flex-col items-center justify-center gap-1 p-[22px_24px] shadow-sm">
              <div className="flex items-center gap-1.5">
                {/* Blue Comment Icon */}
                <MessageSquare size={18} className="text-[#007AFF] fill-[#007AFF]" />
                <span className="font-bold text-[20px] text-white leading-none">
                  {movie.vote_count ? `${movie.vote_count}+` : "10K+"}
                </span>
              </div>
              <span className="font-normal text-[15px] text-[#ECECEC] capitalize leading-none">
                Comments
              </span>
            </div>
          </section>


          {/* MAIN DETAILS CONTAINER (details) */}
          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 lg:p-[24px] flex flex-col gap-6 lg:gap-[24px]">

            <div className="flex flex-col gap-5">
              <h2 className="text-white font-semibold text-[20px] leading-[24px]">
                How Did You Feel About This?
              </h2>

              {/* Reaction Buttons Row - Permanent Border, Gets Darker When Clicked */}
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => handleReactionClick("like")}
                  className={`h-[60px] flex-1 min-w-[130px] rounded-[10px] border border-[#535353] px-4 py-2.5 flex items-center justify-center gap-3.5 cursor-pointer transition-colors duration-150 ${userReaction === "like"
                    ? "bg-[#181818] border-[#535353] shadow-inner"
                    : "bg-[#282828] hover:bg-[#202020]"
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/glike.png"
                    alt="Like"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="font-bold text-[14px] text-white">Like</span>
                    <span className="font-normal text-[12px] text-[#C0C0C0]">
                      {(reactions.like.count / 1000).toFixed(1)}K
                    </span>
                  </div>
                </button>

                {/* Love Button */}
                <button
                  type="button"
                  onClick={() => handleReactionClick("love")}
                  className={`h-[60px] flex-1 min-w-[130px] rounded-[10px] border border-[#535353] px-4 py-2.5 flex items-center justify-center gap-3.5 cursor-pointer transition-colors duration-150 ${userReaction === "love"
                    ? "bg-[#181818] border-[#535353] shadow-inner"
                    : "bg-[#282828] hover:bg-[#202020]"
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/happy.png"
                    alt="Love"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="font-bold text-[14px] text-white">Love</span>
                    <span className="font-normal text-[12px] text-[#C0C0C0]">
                      {(reactions.love.count / 1000).toFixed(1)}K
                    </span>
                  </div>
                </button>

                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={() => handleReactionClick("favorite")}
                  className={`h-[60px] flex-1 min-w-[130px] rounded-[10px] border border-[#535353] px-4 py-2.5 flex items-center justify-center gap-3.5 cursor-pointer transition-colors duration-150 ${userReaction === "favorite"
                    ? "bg-[#181818] border-[#535353] shadow-inner"
                    : "bg-[#282828] hover:bg-[#202020]"
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/pheart.png"
                    alt="Favorite"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="font-bold text-[14px] text-white">Favorite</span>
                    <span className="font-normal text-[12px] text-[#C0C0C0]">
                      {(reactions.favorite.count / 1000).toFixed(1)}K
                    </span>
                  </div>
                </button>

                {/* Dislike Button */}
                <button
                  type="button"
                  onClick={() => handleReactionClick("dislike")}
                  className={`h-[60px] flex-1 min-w-[130px] rounded-[10px] border border-[#535353] px-4 py-2.5 flex items-center justify-center gap-3.5 cursor-pointer transition-colors duration-150 ${userReaction === "dislike"
                    ? "bg-[#181818] border-[#535353] shadow-inner"
                    : "bg-[#282828] hover:bg-[#202020]"
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/dislike .png"
                    alt="Dislike"
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="font-bold text-[14px] text-white">Dislike</span>
                    <span className="font-normal text-[12px] text-[#C0C0C0]">
                      {(reactions.dislike.count / 1000).toFixed(1)}K
                    </span>
                  </div>
                </button>
              </div>

              {/* Poll Percentage Progress Bars (poll) */}
              <div className="flex flex-col gap-3 pt-2">
                {/* Like Bar */}
                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">
                    Like
                  </span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34d399] rounded-full transition-all duration-300"
                      style={{ width: `${reactions.like.percent}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {reactions.like.percent}%
                  </span>
                </div>

                {/* Love Bar */}
                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">
                    Love
                  </span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#fbbf24] rounded-full transition-all duration-300"
                      style={{ width: `${reactions.love.percent}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {reactions.love.percent}%
                  </span>
                </div>

                {/* Favorite Bar */}
                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">
                    Favorite
                  </span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f472b6] rounded-full transition-all duration-300"
                      style={{ width: `${reactions.favorite.percent}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {reactions.favorite.percent}%
                  </span>
                </div>

                {/* Dislike Bar */}
                <div className="flex items-center gap-4 text-white">
                  <span className="w-[70px] font-semibold text-[16px] capitalize shrink-0">
                    Dislike
                  </span>
                  <div className="flex-1 h-[10px] bg-[#3B3A3A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ef4444] rounded-full transition-all duration-300"
                      style={{ width: `${reactions.dislike.percent}%` }}
                    />
                  </div>
                  <span className="w-[40px] text-right font-semibold text-[14px] uppercase shrink-0 font-mono">
                    {reactions.dislike.percent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Divider Line (Line 20) */}
            <div className="w-full h-0 border-t border-[#535353]" />

            {/* B. About Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
                about
              </h2>
              <p className="text-[#C0C0C0] font-normal text-[14px] leading-[22px] uppercase">
                {movie.overview || "No synopsis available for this title."}
              </p>
            </div>

            {/* Divider Line (Line 19) */}
            <div className="w-full h-0 border-t border-[#535353]" />

            {/* C. Cast Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
                  Cast
                </h2>
              </div>

              {/* Actor Img Row */}
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
                        const actorName =
                          typeof member === "string"
                            ? member
                            : member.name || member.actor || "Actor";
                        const charName =
                          typeof member === "object"
                            ? member.role || member.character || actorName
                            : actorName;
                        const avatarSrc =
                          typeof member === "object" &&
                            (member.profile_path || member.image)
                            ? member.profile_path || member.image
                            : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80&sig=${idx}`;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center gap-2 shrink-0 w-[141px]"
                          >
                            {/* Circle Avatar (Ellipse 6) */}
                            <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden bg-[#D9D9D9] shrink-0 border border-[#535353]">
                              <Image
                                src={avatarSrc}
                                alt={actorName}
                                fill
                                unoptimized
                                className="object-cover object-top"
                              />
                            </div>
                            {/* Name Info */}
                            <div className="flex flex-col items-center text-center w-full leading-tight">
                              <span className="font-medium text-[14px] text-white capitalize truncate w-full">
                                {charName}
                              </span>
                              <span className="font-normal text-[12px] text-[#C0C0C0] capitalize truncate w-full">
                                {actorName}
                              </span>
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

            {/* Divider Line (Line 21) */}
            <div className="w-full h-0 border-t border-[#535353]" />

            {/* D. Threaded Comments Section */}
            <div id="discussion" className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
                comments
              </h2>

              {/* Reply Input Box (Frame 66 & Frame 67) */}
              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-2 w-full"
              >
                {/* Input Frame 66 */}
                <div className="flex-1 bg-[#3D3D3D] rounded-[8px] h-[54px] px-6 flex items-center">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="what's on your mind?"
                    className="w-full bg-transparent outline-none text-white text-[14px] placeholder:text-[#959292] placeholder:text-[12px] placeholder:capitalize font-medium"
                  />
                </div>

                {/* Send Button Frame 67 */}
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-[#3D3D3D] hover:bg-[#4a4a4a] text-white rounded-[8px] h-[54px] px-5 flex items-center justify-center font-normal text-[12px] capitalize transition-colors disabled:opacity-50 cursor-pointer"
                >
                  send
                </button>
              </form>

              {/* Comments List / No Comments Yet */}
              {comments.length === 0 ? (
                <div className="text-center py-4 text-[#C0C0C0] text-[14px] lowercase">
                  no comments yet!
                </div>
              ) : (
                <div className="flex flex-col gap-4 pt-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-[#282828] border border-[#535353] rounded-[10px] p-4 flex flex-col gap-2.5"
                    >
                      {/* Author Header */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={comment.userAvatar}
                            alt={comment.userName}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[14px] font-semibold text-white">
                            {comment.userName}
                          </span>
                          <span className="text-[11px] text-[#999999] pt-1">
                            {comment.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-[14px] text-[#C0C0C0] leading-relaxed pl-11">
                        {comment.text}
                      </p>

                      {/* Reply Button */}
                      <div className="pl-11">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReplyId(
                              activeReplyId === comment.id ? null : comment.id
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#999999] hover:text-[#E60813] transition-colors"
                        >
                          <CornerDownRight size={14} />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Inline Reply Input */}
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

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-11 mt-1 pl-4 border-l border-[#535353] flex flex-col gap-2.5">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                  <Image
                                    src={reply.userAvatar}
                                    alt={reply.userName}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-[13px] font-semibold text-white">
                                  {reply.userName}
                                </span>
                                <span className="text-[11px] text-[#999999]">
                                  {reply.createdAt}
                                </span>
                              </div>
                              <p className="text-[13px] text-[#C0C0C0] pl-8">
                                {reply.text}
                              </p>
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


        {/* RIGHT COLUMN SIDEBAR (right side) */}
        <div className="flex flex-col gap-8">

          {/* 1. WORTH IT & DETAILS CONTAINER (worth it) */}
          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 flex flex-col gap-6">

            {/* Worth Watching Sub-box */}
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
                worth watching?
              </h2>
              <div className="font-semibold text-[24px] text-[#34d399] leading-none py-1">
                {recommendedPercent >= 70 ? "Yes" : "N/A"}
              </div>
              <p className="text-[#C0C0C0] font-normal text-[14px] lowercase leading-snug">
                {recommendedPercent}% of members recommended this {movie.type === "movie" ? "movie" : "series"}.
              </p>
            </div>

            {/* Divider Line (Line 20) */}
            <div className="w-full h-0 border-t border-[#535353]" />

            {/* Details Table Sub-box */}
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
                details
              </h2>

              <div className="flex flex-col gap-3 text-[14px]">
                {/* 1. Creator */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    creator
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1 break-words">
                    {creatorsText}
                  </span>
                </div>

                {/* 2. Cast/Voice Actor */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    cast/voice actor
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1 break-words">
                    {castActorsText}
                  </span>
                </div>

                {/* 3. Release */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    release
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.releaseDate || movie.year || "Oct 19, 2022"}
                  </span>
                </div>

                {/* 4. Episodes */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    episodes
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.episodes || (movie.type === "series" ? "45" : "-")}
                  </span>
                </div>

                {/* 5. Seasons */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    seasons
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.seasons || (movie.type === "series" ? "3 (Completed)" : "-")}
                  </span>
                </div>

                {/* 6. Run Time */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    run time
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.runtime || "45-60 min/ep"}
                  </span>
                </div>

                {/* 7. Genre */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    genre
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.genre_names?.join(", ") || movie.category || "Action, Adventure, Fantasy"}
                  </span>
                </div>

                {/* 8. Country */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    country
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.country || "United States"}
                  </span>
                </div>

                {/* 9. Network */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    network
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.network || "Netflix Studio"}
                  </span>
                </div>

                {/* 10. Status */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    status
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.status || "On Going"}
                  </span>
                </div>

                {/* 11. Language */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    language
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.language || "English"}
                  </span>
                </div>

                {/* 12. Also Known As */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-white font-normal capitalize shrink-0 w-[110px]">
                    also known as
                  </span>
                  <span className="text-[#C0C0C0] font-normal text-[12px] text-right flex-1">
                    {movie.alsoKnownAs || "-"}
                  </span>
                </div>
              </div>
            </div>

          </section>


          {/* 2. YOU MAY ALSO LIKE (recommendation) */}
          <section className="bg-[#302F2F] border border-[#535353] rounded-[10px] p-6 flex flex-col gap-4">
            <h2 className="text-white font-semibold text-[20px] leading-[24px] capitalize">
              you may also like
            </h2>

            <div className="flex flex-col gap-3">
              {recommendations.length === 0 ? (
                <div className="text-[#C0C0C0] text-sm py-4">No recommendations available.</div>
              ) : (
                recommendations.map((item: any) => {
                  const itemPoster =
                    item.posterUrl ||
                    item.poster ||
                    (item.poster_path
                      ? item.poster_path.startsWith("http")
                        ? item.poster_path
                        : `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : DEFAULT_POSTER);

                  const itemScoreRaw =
                    item.user_rating ?? item.vote_average ?? null;
                  const itemScore =
                    itemScoreRaw !== null && itemScoreRaw !== undefined
                      ? Number(itemScoreRaw).toFixed(1)
                      : "N/A";

                return (
                  <Link
                    key={item.id}
                    href={`/movie/${item.id}`}
                    className="flex items-center gap-5 p-1 rounded-md hover:bg-[#3D3D3D]/50 transition-colors group no-underline"
                  >
                    {/* Thumbnail (Rectangle 34624242) */}
                    <div className="relative w-[80px] h-[80px] rounded-[6px] overflow-hidden shrink-0 bg-[#282828] border border-[#535353]">
                      <Image
                        src={itemPoster}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Middle Info (Frame 64) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                      <h3 className="font-medium text-[14px] text-white capitalize truncate group-hover:text-[#E60813] transition-colors leading-tight">
                        {item.title}
                      </h3>

                      {/* Detail row */}
                      <div className="flex items-center justify-between text-[12px] text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{item.year || "2025"}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D9D9D9] inline-block" />
                          <span className="capitalize">
                            {item.genre_names?.[0] || item.category || "Drama"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#D9D9D9] inline-block" />
                          <span>
                            {item.type === "movie" ? "Movie" : "1 Season"}
                          </span>
                        </div>

                        {/* Rating (Frame 20) */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/Vector.png"
                            alt="Star"
                            className="w-2.5 h-2.5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className="text-[12px] font-normal text-white">
                            {itemScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }))}
            </div>
          </section>

        </div>

      </div>


      {/* 3. BOTTOM CTA BANNER (Frame 44) */}
      <WatchNextBanner />

    </main>
  );
}
