"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Heart,
  Bookmark,
  ThumbsDown,
  Check,
  Clapperboard,
  Users,
  Send,
  CornerDownRight,
} from "lucide-react";
import { Movie } from "@/lib/types";

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
  const [userReaction, setUserReaction] = useState<string | null>("like");
  const [reactions, setReactions] = useState({
    like: { count: 12800, percent: 50 },
    love: { count: 12800, percent: 50 },
    favorite: { count: 12800, percent: 50 },
    dislike: { count: 12800, percent: 50 },
  });

  // Threaded Comments State
  const [comments, setComments] = useState<DetailComment[]>([
    {
      id: "c1",
      userName: "Alay Sameer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: "Came for the action, stayed for the characters. Every season gets better and the journey feels rewarding. Zuko's redemption arc alone makes it worth watching.",
      createdAt: "2 hours ago",
      replies: [],
    },
    {
      id: "c2",
      userName: "Alay Sameer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: "Came for the action, stayed for the characters. Every season gets better and the journey feels rewarding. Zuko's redemption arc alone makes it worth watching.",
      createdAt: "4 hours ago",
      replies: [],
    },
    {
      id: "c3",
      userName: "Alay Sameer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: "this show was worth my time. 10 on 10!!",
      createdAt: "5 hours ago",
      replies: [
        {
          id: "r1",
          userName: "Miral",
          userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
          text: "this show was worth my time. 10 on 10!!",
          createdAt: "1 hour ago",
        },
      ],
    },
    {
      id: "c4",
      userName: "Alay Sameer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      text: "Came for the action, stayed for the characters. Every season gets better and the journey feels rewarding. Zuko's redemption arc alone makes it worth watching.",
      createdAt: "1 day ago",
      replies: [],
    },
  ]);

  const [newCommentText, setNewCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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
    setReactions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        count: prev[key].count + 1,
      },
    }));
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

  if (loading) {
    return (
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex flex-col gap-10 min-h-[70vh] justify-center">
        <div className="w-full h-[420px] bg-[#333333] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-[1fr_360px] gap-8 items-start max-[1024px]:grid-cols-1">
          <div className="flex flex-col gap-8 min-w-0">
            <div className="w-full h-[200px] bg-[#333333] rounded-xl animate-pulse" />
            <div className="w-full h-[200px] bg-[#333333] rounded-xl animate-pulse" />
          </div>
          <div className="flex flex-col gap-8">
            <div className="w-full h-[200px] bg-[#333333] rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (notFoundState || !movie) {
    return (
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex flex-col gap-10 min-h-[70vh] justify-center">
        <div className="bg-[#333333] border border-white/22 rounded-2xl p-16 text-center max-w-[550px] mx-auto">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-3xl font-bold mb-2 text-white">Title Not Found</h1>
          <p className="text-[#999999] text-base mb-8">
            We couldn&apos;t find a movie or series matching ID &quot;{rawId}&quot;. It may have been removed or the link might be incorrect.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#E50914] text-white hover:bg-[#F40612] transition-colors">
              Back to Home
            </Link>
            <Link href="/search" className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">
              Search Titles
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
  const recommendedPercent = rawScore !== null && rawScore !== undefined ? Math.min(99, Math.round((Number(rawScore) / 10) * 100)) : null;

  const castList = Array.isArray(movie.cast) ? movie.cast : [];

  const creatorsText = movie.creators && movie.creators.length > 0
    ? movie.creators.join(" & ")
    : "-";

  const castActorsText = castList.length > 0
    ? castList
        .slice(0, 8)
        .map((c: any) => (typeof c === "string" ? c : c.name || c.actor))
        .join(", ")
    : "-";

  return (
    <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex flex-col gap-10 text-white">

      {/* HERO BANNER */}
      <section
        className="relative rounded-2xl overflow-hidden border border-white/12 min-h-[440px] bg-cover bg-center flex items-center p-10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] max-[768px]:p-6 max-[768px]:min-h-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(20,20,20,0.95) 20%, rgba(20,20,20,0.7) 60%, rgba(20,20,20,0.45) 100%), url("${backdropImage}")`,
        }}
      >
        <div className="relative z-10 grid grid-cols-[240px_1fr] gap-10 items-center w-full max-[1024px]:grid-cols-[180px_1fr] max-[1024px]:gap-7 max-[768px]:grid-cols-1 max-[768px]:text-center">

          {/* Left Poster Image */}
          <div className="relative w-[240px] aspect-[2/3] rounded-xl overflow-hidden border border-white/22 shadow-[0_15px_35px_rgba(0,0,0,0.7)] shrink-0 max-[1024px]:w-[180px] max-[768px]:mx-auto max-[768px]:w-[160px]">
            <Image
              src={posterImage}
              alt={movie.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Right Header Content */}
          <div className="flex flex-col gap-5">

            {/* Badges Row */}
            <div className="flex items-center gap-3 flex-wrap max-[768px]:justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-[#E50914] text-white">
                Featured
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-black/65 backdrop-blur-md border border-white/22 text-white">
                <Star size={14} className="text-[#fbbf24] fill-[#fbbf24]" />
                <span className="font-bold">{clubScore !== "N/A" ? `${clubScore}/10` : "N/A"}</span>
                <span className="text-[#999999] font-normal">Club Score</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-black leading-tight uppercase tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)] max-[1024px]:text-4xl max-[768px]:text-3xl">
              {movie.title}
            </h1>

            {/* Subtitle / CTA Description */}
            <p className="text-[#CCCCCC] text-base max-w-[600px] leading-normal">
              Add to watchlist and join the discussion box for this {movie.type === "movie" ? "movie" : "series"}.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap pt-2 max-[768px]:justify-center">
              <button
                type="button"
                onClick={() => setInWatchlist(!inWatchlist)}
                className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[0.95rem] font-semibold no-underline cursor-pointer transition-all duration-150 bg-[#E50914] text-white shadow-[0_6px_20px_rgba(229,9,20,0.35)] hover:bg-[#F40612] hover:-translate-y-0.5`}
              >
                {inWatchlist ? (
                  <>
                    <Check size={18} />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/play.png" alt="play" className="w-4 h-4 object-contain" />
                    <span>Add To Watchlist</span>
                  </>
                )}
              </button>

              <Link
                href="#discussion"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[0.95rem] font-semibold no-underline cursor-pointer transition-all duration-150 bg-white/12 text-white border border-white/22 backdrop-blur-md hover:bg-white/22 hover:-translate-y-0.5"
              >
                <Users size={18} />
                <span>Join Community</span>
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* METRICS BAR */}
      <section className="grid grid-cols-3 gap-5 max-[768px]:grid-cols-1">
        <div className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-1.5">
          <div className="text-2xl font-extrabold flex items-center gap-2 text-white">
            <Star size={20} className="text-[#fbbf24] fill-[#fbbf24]" />
            <span>{clubScore}</span>
          </div>
          <span className="text-sm text-[#999999] font-medium">Club Score</span>
        </div>

        <div className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-1.5">
          <div className="text-2xl font-extrabold flex items-center gap-2 text-[#34d399]">
            <ThumbsUp size={20} />
            <span>{recommendedPercent !== null ? `${recommendedPercent}%` : "N/A"}</span>
          </div>
          <span className="text-sm text-[#999999] font-medium">Recommended</span>
        </div>

        <div className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-1.5">
          <div className="text-2xl font-extrabold flex items-center gap-2 text-[#38bdf8]">
            <MessageSquare size={20} />
            <span>{movie.vote_count ? `${movie.vote_count}+` : "10K+"}</span>
          </div>
          <span className="text-sm text-[#999999] font-medium">Comments</span>
        </div>
      </section>


      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-[1fr_360px] gap-8 items-start max-[1024px]:grid-cols-1">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8 min-w-0">

          {/* Reaction Bar */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-7 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white">
              How Did You Feel About This?
            </h2>

            {/* Reaction Buttons */}
            <div className="grid grid-cols-4 gap-4 max-[768px]:grid-cols-2">
              <button
                type="button"
                onClick={() => handleReactionClick("like")}
                className={`bg-white/5 border rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-[#CCCCCC] transition-all duration-150 cursor-pointer hover:bg-white/10 hover:text-white ${userReaction === "like" ? "bg-[rgba(229,9,20,0.18)] border-[#E50914] text-white" : "border-white/12"}`}
              >
                <ThumbsUp size={20} className="mb-1" />
                <span className="text-sm font-semibold">Like</span>
                <span className="text-xs text-[#999999]">{(reactions.like.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("love")}
                className={`bg-white/5 border rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-[#CCCCCC] transition-all duration-150 cursor-pointer hover:bg-white/10 hover:text-white ${userReaction === "love" ? "bg-[rgba(229,9,20,0.18)] border-[#E50914] text-white" : "border-white/12"}`}
              >
                <Heart size={20} className="mb-1" />
                <span className="text-sm font-semibold">Love</span>
                <span className="text-xs text-[#999999]">{(reactions.love.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("favorite")}
                className={`bg-white/5 border rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-[#CCCCCC] transition-all duration-150 cursor-pointer hover:bg-white/10 hover:text-white ${userReaction === "favorite" ? "bg-[rgba(229,9,20,0.18)] border-[#E50914] text-white" : "border-white/12"}`}
              >
                <Bookmark size={20} className="mb-1" />
                <span className="text-sm font-semibold">Favorite</span>
                <span className="text-xs text-[#999999]">{(reactions.favorite.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("dislike")}
                className={`bg-white/5 border rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-[#CCCCCC] transition-all duration-150 cursor-pointer hover:bg-white/10 hover:text-white ${userReaction === "dislike" ? "bg-[rgba(229,9,20,0.18)] border-[#E50914] text-white" : "border-white/12"}`}
              >
                <ThumbsDown size={20} className="mb-1" />
                <span className="text-sm font-semibold">Dislike</span>
                <span className="text-xs text-[#999999]">{(reactions.dislike.count / 1000).toFixed(1)}K</span>
              </button>
            </div>

            {/* Reaction Bars */}
            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="w-[70px] text-[#CCCCCC]">Like</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-250 bg-[#34d399]" style={{ width: `${reactions.like.percent}%` }} />
                </div>
                <span className="w-[45px] text-right text-[#CCCCCC] font-mono">{reactions.like.percent}%</span>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="w-[70px] text-[#CCCCCC]">Love</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-250 bg-[#fbbf24]" style={{ width: `${reactions.love.percent}%` }} />
                </div>
                <span className="w-[45px] text-right text-[#CCCCCC] font-mono">{reactions.love.percent}%</span>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="w-[70px] text-[#CCCCCC]">Favorite</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-250 bg-[#f472b6]" style={{ width: `${reactions.favorite.percent}%` }} />
                </div>
                <span className="w-[45px] text-right text-[#CCCCCC] font-mono">{reactions.favorite.percent}%</span>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="w-[70px] text-[#CCCCCC]">Dislike</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-250 bg-[#ef4444]" style={{ width: `${reactions.dislike.percent}%` }} />
                </div>
                <span className="w-[45px] text-right text-[#CCCCCC] font-mono">{reactions.dislike.percent}%</span>
              </div>
            </div>
          </section>


          {/* About Section */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-7 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">About</h2>
            <p className="text-[#CCCCCC] text-[0.95rem] leading-relaxed">
              {movie.overview || "No synopsis available for this title."}
            </p>
          </section>


          {/* Cast Row */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-7 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-white">Cast</h2>

            {castList.length > 0 ? (
              <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
                {castList.map((member: any, idx: number) => {
                  const actorName = typeof member === "string" ? member : member.name || member.actor || "Actor";
                  const charName = typeof member === "object" ? member.role || member.character || actorName : actorName;
                  const avatarSrc = typeof member === "object" && (member.profile_path || member.image)
                    ? (member.profile_path || member.image)
                    : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80&sig=${idx}`;

                  return (
                    <div key={idx} className="flex-none w-[110px] flex flex-col items-center text-center gap-2.5">
                      <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-white/22 bg-black/40">
                        <Image
                          src={avatarSrc}
                          alt={actorName}
                          fill
                          unoptimized
                          className="object-cover object-top"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white leading-tight">{charName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-xs">No cast information available for this title.</p>
            )}
          </section>


          {/* Threaded Comments Section */}
          <section id="discussion" className="bg-[#333333] border border-white/12 rounded-xl p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <MessageSquare size={20} className="text-[#E50914]" />
                <span>Comments</span>
              </h2>
              <span className="text-sm text-[#999999] font-mono">{comments.length} Discussion Threads</span>
            </div>

            {/* Post Top-level Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-3 items-center bg-black/40 border border-white/12 rounded-xl p-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your thoughts on this title..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 py-2 placeholder:text-[#999999]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-[#E50914] text-white text-xs font-semibold px-5 py-2 rounded-md inline-flex items-center gap-1.5 transition-colors duration-150 hover:bg-[#F40612]"
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-black/30 border border-white/12 rounded-xl p-5 flex flex-col gap-3">

                  {/* Comment Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={comment.userAvatar}
                        alt={comment.userName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-[0.875rem] font-semibold text-white">{comment.userName}</div>
                      <div className="text-xs text-[#999999]">{comment.createdAt}</div>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <p className="text-[0.875rem] text-[#CCCCCC] leading-relaxed pl-11">
                    {comment.text}
                  </p>

                  {/* Comment Actions */}
                  <div className="pl-11">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#999999] transition-colors duration-150 hover:text-[#E50914]"
                    >
                      <CornerDownRight size={14} />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Inline Reply Input Box */}
                  {activeReplyId === comment.id && (
                    <div className="ml-11 mt-2 flex items-center gap-2 bg-black/60 border border-white/22 rounded-xl px-2 py-1.5">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to @${comment.userName.toLowerCase().replace(/\s+/g, "")}...`}
                        className="flex-1 bg-transparent border-none outline-none text-white text-[0.825rem] px-2 py-1.5 placeholder:text-[#999999]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="bg-[#E50914] text-white text-[0.775rem] font-semibold px-3.5 py-1.5 rounded-md"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 mt-2 pl-4 border-l-2 border-white/12 flex flex-col gap-3.5">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex flex-col gap-1.5">
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
                            <span className="text-[0.825rem] font-semibold text-white">{reply.userName}</span>
                            <span className="text-[0.725rem] text-[#999999]">{reply.createdAt}</span>
                          </div>
                          <p className="text-[0.825rem] text-[#CCCCCC] leading-normal pl-8">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </section>

        </div>


        {/* RIGHT SIDEBAR COLUMN */}
        <div className="flex flex-col gap-8">

          {/* 1. Worth Watching Box */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-white">Worth Watching?</h2>
            <div className="text-3xl font-black text-[#34d399]">Yes</div>
            <p className="text-sm text-[#CCCCCC]">
              {recommendedPercent !== null ? `${recommendedPercent}%` : "N/A"} of members recommended this {movie.type === "movie" ? "movie" : "series"}.
            </p>
          </section>


          {/* 2. Details Sidebar Panel */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">Details</h2>

            <div className="flex flex-col gap-3.5 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Creator</span>
                <span className="text-white font-semibold leading-snug">{creatorsText}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Cast/Voice Actor</span>
                <span className="text-[#CCCCCC] leading-snug">{castActorsText}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Release</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.releaseDate || movie.year || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Episodes</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.episodes || (movie.type === "series" ? "45" : "-")}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Seasons</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.seasons || (movie.type === "series" ? "3 (Completed)" : "-")}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Run Time</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.runtime || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Genre</span>
                <span className="text-[#CCCCCC] leading-snug">
                  {movie.genre_names?.join(", ") || movie.category || "-"}
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Country</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.country || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Network</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.network || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Status</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.status || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Language</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.language || "-"}</span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-2 items-start max-[768px]:grid-cols-[100px_1fr]">
                <span className="text-[#999999] font-medium">Also Known As</span>
                <span className="text-[#CCCCCC] leading-snug">{movie.alsoKnownAs || "-"}</span>
              </div>
            </div>
          </section>


          {/* 3. You May Also Like Sidebar List */}
          <section className="bg-[#333333] border border-white/12 rounded-xl p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">You May Also Like</h2>

            <div className="flex flex-col gap-3.5">
              {recommendations.map((item) => {
                const itemPoster =
                  item.posterUrl ||
                  item.poster ||
                  (item.poster_path
                    ? item.poster_path.startsWith("http")
                      ? item.poster_path
                      : `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : DEFAULT_POSTER);

                const itemScoreRaw = item.user_rating ?? item.vote_average ?? null;
                const itemScore = itemScoreRaw !== null && itemScoreRaw !== undefined ? Number(itemScoreRaw).toFixed(1) : "N/A";

                return (
                  <Link
                    key={item.id}
                    href={`/movie/${item.id}`}
                    className="flex items-center gap-3.5 p-2 rounded-md bg-black/30 border border-white/12 no-underline transition-all duration-150 hover:bg-white/8 hover:border-white/22 hover:translate-x-0.5 group"
                  >
                    <div className="relative w-12 aspect-[2/3] rounded-md overflow-hidden shrink-0">
                      <Image
                        src={itemPoster}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-white truncate transition-colors duration-150 group-hover:text-[#E50914]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#999999] font-mono truncate">
                        {item.year || "2025"} • {item.genre_names?.[0] || item.category || "Drama"} • 1 Season
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-bold text-[#fbbf24] font-mono">
                      <Star size={12} className="fill-[#fbbf24]" />
                      <span>{itemScore}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>

      </div>


      {/* BOTTOM CTA BANNER */}
      <section className="bg-gradient-to-r from-[rgba(229,9,20,0.25)] via-[rgba(20,20,20,0.95)] to-[rgba(229,9,20,0.25)] border border-[rgba(229,9,20,0.4)] rounded-2xl p-12 text-center flex flex-col items-center gap-7 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-2 max-w-[650px]">
          <h2 className="text-3xl font-black tracking-wide uppercase text-white">
            NOT SURE WHAT TO WATCH NEXT ?
          </h2>
          <p className="text-[#CCCCCC] text-base leading-relaxed">
            Discover community-driven recommendations, honest reviews, and trending netflix content tailored for you.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[0.95rem] font-bold no-underline transition-all duration-150 bg-[#E50914] text-white shadow-[0_4px_15px_rgba(229,9,20,0.35)] hover:bg-[#F40612] hover:-translate-y-0.5"
          >
            <Clapperboard size={18} />
            <span>Explore</span>
          </Link>

          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[0.95rem] font-bold no-underline transition-all duration-150 bg-[#E50914] text-white shadow-[0_4px_15px_rgba(229,9,20,0.35)] hover:bg-[#F40612] hover:-translate-y-0.5"
          >
            <Users size={18} />
            <span>Join Community</span>
          </Link>
        </div>
      </section>

    </main>
  );
}
