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
        // Fetch movie detail from /api/movies/[id] endpoint
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
          // Fallback check from trending list if direct endpoint returns error
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

        // Fetch "You May Also Like" recommendations
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
      <main className="detail-page detail-page--loading">
        <div className="detail-hero__skeleton" />
        <div className="detail-layout">
          <div className="detail-layout__main">
            <div className="detail-skeleton-card" />
            <div className="detail-skeleton-card" />
          </div>
          <div className="detail-layout__sidebar">
            <div className="detail-skeleton-card" />
          </div>
        </div>
      </main>
    );
  }

  if (notFoundState || !movie) {
    return (
      <main className="detail-page detail-page--empty">
        <div className="detail-empty-card">
          <div className="detail-empty-icon">🎬</div>
          <h1 className="detail-empty-title">Title Not Found</h1>
          <p className="detail-empty-text">
            We couldn&apos;t find a movie or series matching ID &quot;{rawId}&quot;. It may have been removed or the link might be incorrect.
          </p>
          <div className="detail-empty-actions">
            <Link href="/" className="detail-empty-btn detail-empty-btn--primary">
              Back to Home
            </Link>
            <Link href="/search" className="detail-empty-btn detail-empty-btn--secondary">
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

  // Real cast members strictly from API
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
    <main className="detail-page">

      {/* ── HERO BANNER (FULL BLEED BACKDROP) ────────────────────────── */}
      <section
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(20,20,20,0.95) 20%, rgba(20,20,20,0.7) 60%, rgba(20,20,20,0.45) 100%), url("${backdropImage}")`,
        }}
      >
        <div className="detail-hero__content">

          {/* Left Poster Image */}
          <div className="detail-hero__poster-wrapper">
            <Image
              src={posterImage}
              alt={movie.title}
              fill
              unoptimized
              className="detail-hero__poster"
            />
          </div>

          {/* Right Header Content */}
          <div className="detail-hero__meta">

            {/* Badges Row */}
            <div className="detail-hero__badge-row">
              <span className="detail-hero__badge detail-hero__badge--featured">
                Featured
              </span>
              <div className="detail-hero__badge detail-hero__badge--score">
                <Star size={14} className="detail-hero__star-icon" />
                <span className="detail-hero__score-value">{clubScore !== "N/A" ? `${clubScore}/10` : "N/A"}</span>
                <span className="detail-hero__score-label">Club Score</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="detail-hero__title">
              {movie.title}
            </h1>

            {/* Subtitle / CTA Description */}
            <p className="detail-hero__subtitle">
              Add to watchlist and join the discussion box for this {movie.type === "movie" ? "movie" : "series"}.
            </p>

            {/* Action Buttons */}
            <div className="detail-hero__action-row">
              <button
                type="button"
                onClick={() => setInWatchlist(!inWatchlist)}
                className={`detail-hero__btn detail-hero__btn--watchlist ${inWatchlist ? "detail-hero__btn--active" : ""}`}
              >
                {inWatchlist ? (
                  <>
                    <Check size={18} />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/play.png" alt="play" className="detail-hero__play-icon" />
                    <span>Add To Watchlist</span>
                  </>
                )}
              </button>

              <Link
                href="#discussion"
                className="detail-hero__btn detail-hero__btn--community"
              >
                <Users size={18} />
                <span>Join Community</span>
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* ── METRICS BAR (3 CARDS ROW) ───────────────────────────────────────── */}
      <section className="detail-stats">
        <div className="detail-stats__card">
          <div className="detail-stats__val detail-stats__val--gold">
            <Star size={20} className="detail-stats__star" />
            <span>{clubScore}</span>
          </div>
          <span className="detail-stats__label">Club Score</span>
        </div>

        <div className="detail-stats__card">
          <div className="detail-stats__val detail-stats__val--green">
            <ThumbsUp size={20} />
            <span>{recommendedPercent !== null ? `${recommendedPercent}%` : "N/A"}</span>
          </div>
          <span className="detail-stats__label">Recommended</span>
        </div>

        <div className="detail-stats__card">
          <div className="detail-stats__val detail-stats__val--blue">
            <MessageSquare size={20} />
            <span>{movie.vote_count ? `${movie.vote_count}+` : "10K+"}</span>
          </div>
          <span className="detail-stats__label">Comments</span>
        </div>
      </section>


      {/* ── MAIN CONTENT GRID: 2 COLUMNS (~65% LEFT, ~35% RIGHT) ─────────────── */}
      <div className="detail-layout">

        {/* LEFT COLUMN: Reactions, About, Cast, Comments */}
        <div className="detail-layout__main">

          {/* 1. Reaction Bar ("How Did You Feel About This?") */}
          <section className="reactions">
            <h2 className="reactions__title">
              How Did You Feel About This?
            </h2>

            {/* Reaction Buttons */}
            <div className="reactions__grid">
              <button
                type="button"
                onClick={() => handleReactionClick("like")}
                className={`reactions__btn reactions__btn--like ${userReaction === "like" ? "reactions__btn--active-like" : ""}`}
              >
                <ThumbsUp size={20} className="reactions__btn-icon" />
                <span className="reactions__btn-name">Like</span>
                <span className="reactions__btn-count">{(reactions.like.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("love")}
                className={`reactions__btn reactions__btn--love ${userReaction === "love" ? "reactions__btn--active-love" : ""}`}
              >
                <Heart size={20} className="reactions__btn-icon" />
                <span className="reactions__btn-name">Love</span>
                <span className="reactions__btn-count">{(reactions.love.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("favorite")}
                className={`reactions__btn reactions__btn--favorite ${userReaction === "favorite" ? "reactions__btn--active-favorite" : ""}`}
              >
                <Bookmark size={20} className="reactions__btn-icon" />
                <span className="reactions__btn-name">Favorite</span>
                <span className="reactions__btn-count">{(reactions.favorite.count / 1000).toFixed(1)}K</span>
              </button>

              <button
                type="button"
                onClick={() => handleReactionClick("dislike")}
                className={`reactions__btn reactions__btn--dislike ${userReaction === "dislike" ? "reactions__btn--active-dislike" : ""}`}
              >
                <ThumbsDown size={20} className="reactions__btn-icon" />
                <span className="reactions__btn-name">Dislike</span>
                <span className="reactions__btn-count">{(reactions.dislike.count / 1000).toFixed(1)}K</span>
              </button>
            </div>

            {/* Reaction Bars */}
            <div className="reactions__bars">
              <div className="reactions__bar-row">
                <span className="reactions__bar-label">Like</span>
                <div className="reactions__bar-track">
                  <div className="reactions__bar-fill reactions__bar-fill--like" style={{ width: `${reactions.like.percent}%` }} />
                </div>
                <span className="reactions__bar-val">{reactions.like.percent}%</span>
              </div>

              <div className="reactions__bar-row">
                <span className="reactions__bar-label">Love</span>
                <div className="reactions__bar-track">
                  <div className="reactions__bar-fill reactions__bar-fill--love" style={{ width: `${reactions.love.percent}%` }} />
                </div>
                <span className="reactions__bar-val">{reactions.love.percent}%</span>
              </div>

              <div className="reactions__bar-row">
                <span className="reactions__bar-label">Favorite</span>
                <div className="reactions__bar-track">
                  <div className="reactions__bar-fill reactions__bar-fill--favorite" style={{ width: `${reactions.favorite.percent}%` }} />
                </div>
                <span className="reactions__bar-val">{reactions.favorite.percent}%</span>
              </div>

              <div className="reactions__bar-row">
                <span className="reactions__bar-label">Dislike</span>
                <div className="reactions__bar-track">
                  <div className="reactions__bar-fill reactions__bar-fill--dislike" style={{ width: `${reactions.dislike.percent}%` }} />
                </div>
                <span className="reactions__bar-val">{reactions.dislike.percent}%</span>
              </div>
            </div>
          </section>


          {/* 2. About Section */}
          <section className="about-section">
            <h2 className="about-section__title">About</h2>
            <p className="about-section__text">
              {movie.overview || "No synopsis available for this title."}
            </p>
          </section>


          {/* 3. Cast Row (Horizontally Scrollable Avatar Cards from Real API Data) */}
          <section className="cast-section">
            <h2 className="cast-section__title">Cast</h2>

            {castList.length > 0 ? (
              <div className="cast-section__track">
                {castList.map((member: any, idx: number) => {
                  const actorName = typeof member === "string" ? member : member.name || member.actor || "Actor";
                  const charName = typeof member === "object" ? member.role || member.character || actorName : actorName;
                  const avatarSrc = typeof member === "object" && (member.profile_path || member.image)
                    ? (member.profile_path || member.image)
                    : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80&sig=${idx}`;

                  return (
                    <div key={idx} className="cast-card">
                      <div className="cast-card__avatar-wrapper">
                        <Image
                          src={avatarSrc}
                          alt={actorName}
                          fill
                          unoptimized
                          className="cast-card__avatar"
                        />
                      </div>
                      <div className="cast-card__info">
                        <div className="cast-card__character">{charName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-xs">No cast information available for this title.</p>
            )}
          </section>


          {/* 4. Threaded Comments Section */}
          <section id="discussion" className="comments-section">
            <div className="comments-section__header">
              <h2 className="comments-section__title">
                <MessageSquare size={20} className="comments-section__icon" />
                <span>Comments</span>
              </h2>
              <span className="comments-section__count">{comments.length} Discussion Threads</span>
            </div>

            {/* Post Top-level Comment Form */}
            <form onSubmit={handleAddComment} className="comments-section__form">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your thoughts on this title..."
                className="comments-section__input"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="comments-section__post-btn"
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-section__list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card">

                  {/* Comment Author Header */}
                  <div className="comment-card__header">
                    <div className="comment-card__avatar-wrapper">
                      <Image
                        src={comment.userAvatar}
                        alt={comment.userName}
                        fill
                        unoptimized
                        className="comment-card__avatar"
                      />
                    </div>
                    <div className="comment-card__meta">
                      <div className="comment-card__author">{comment.userName}</div>
                      <div className="comment-card__time">{comment.createdAt}</div>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <p className="comment-card__text">
                    {comment.text}
                  </p>

                  {/* Comment Actions */}
                  <div className="comment-card__actions">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                      className="comment-card__reply-btn"
                    >
                      <CornerDownRight size={14} />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Inline Reply Input Box */}
                  {activeReplyId === comment.id && (
                    <div className="comment-card__reply-box">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to @${comment.userName.toLowerCase().replace(/\s+/g, "")}...`}
                        className="comment-card__reply-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="comment-card__reply-send"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-card__replies">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="comment-reply">
                          <div className="comment-reply__header">
                            <div className="comment-reply__avatar-wrapper">
                              <Image
                                src={reply.userAvatar}
                                alt={reply.userName}
                                fill
                                unoptimized
                                className="comment-reply__avatar"
                              />
                            </div>
                            <span className="comment-reply__author">{reply.userName}</span>
                            <span className="comment-reply__time">{reply.createdAt}</span>
                          </div>
                          <p className="comment-reply__text">
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


        {/* RIGHT SIDEBAR COLUMN: Worth Watching, Details, You May Also Like */}
        <div className="detail-layout__sidebar">

          {/* 1. Worth Watching Box */}
          <section className="worth-watching">
            <h2 className="worth-watching__title">Worth Watching?</h2>
            <div className="worth-watching__status">Yes</div>
            <p className="worth-watching__text">
              {recommendedPercent !== null ? `${recommendedPercent}%` : "N/A"} of members recommended this {movie.type === "movie" ? "movie" : "series"}.
            </p>
          </section>


          {/* 2. Details Sidebar Panel */}
          <section className="details-panel">
            <h2 className="details-panel__title">Details</h2>

            <div className="details-panel__list">
              <div className="details-panel__row">
                <span className="details-panel__label">Creator</span>
                <span className="details-panel__val details-panel__val--highlight">{creatorsText}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Cast/Voice Actor</span>
                <span className="details-panel__val">{castActorsText}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Release</span>
                <span className="details-panel__val">{movie.releaseDate || movie.year || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Episodes</span>
                <span className="details-panel__val">{movie.episodes || (movie.type === "series" ? "45" : "-")}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Seasons</span>
                <span className="details-panel__val">{movie.seasons || (movie.type === "series" ? "3 (Completed)" : "-")}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Run Time</span>
                <span className="details-panel__val">{movie.runtime || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Genre</span>
                <span className="details-panel__val">
                  {movie.genre_names?.join(", ") || movie.category || "-"}
                </span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Country</span>
                <span className="details-panel__val">{movie.country || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Network</span>
                <span className="details-panel__val">{movie.network || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Status</span>
                <span className="details-panel__val">{movie.status || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Language</span>
                <span className="details-panel__val">{movie.language || "-"}</span>
              </div>

              <div className="details-panel__row">
                <span className="details-panel__label">Also Known As</span>
                <span className="details-panel__val">{movie.alsoKnownAs || "-"}</span>
              </div>
            </div>
          </section>


          {/* 3. You May Also Like Sidebar List */}
          <section className="you-may-like">
            <h2 className="you-may-like__title">You May Also Like</h2>

            <div className="you-may-like__list">
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
                    className="you-may-like__item"
                  >
                    <div className="you-may-like__poster-wrapper">
                      <Image
                        src={itemPoster}
                        alt={item.title}
                        fill
                        unoptimized
                        className="you-may-like__poster"
                      />
                    </div>

                    <div className="you-may-like__info">
                      <h3 className="you-may-like__item-title">
                        {item.title}
                      </h3>
                      <p className="you-may-like__item-meta">
                        {item.year || "2025"} • {item.genre_names?.[0] || item.category || "Drama"} • 1 Season
                      </p>
                    </div>

                    <div className="you-may-like__rating">
                      <Star size={12} className="you-may-like__star" />
                      <span>{itemScore}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>

      </div>


      {/* ── BOTTOM CTA BANNER ("NOT SURE WHAT TO WATCH NEXT?") ───────────── */}
      <section className="cta-banner">
        <div className="cta-banner__content">
          <h2 className="cta-banner__title">
            NOT SURE WHAT TO WATCH NEXT ?
          </h2>
          <p className="cta-banner__text">
            Discover community-driven recommendations, honest reviews, and trending netflix content tailored for you.
          </p>
        </div>

        <div className="cta-banner__actions">
          <Link
            href="/movies"
            className="cta-banner__btn cta-banner__btn--explore"
          >
            <Clapperboard size={18} />
            <span>Explore</span>
          </Link>

          <Link
            href="/community"
            className="cta-banner__btn cta-banner__btn--community"
          >
            <Users size={18} />
            <span>Join Community</span>
          </Link>
        </div>
      </section>

    </main>
  );
}
