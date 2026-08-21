"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Film,
  ChevronDown,
  BookmarkPlus,
  Users,
} from "lucide-react";

import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import EditProfileModal from "@/components/EditProfileModal";
import WatchlistCard from "@/components/WatchlistCard";
import MovieCard from "@/components/MovieCard";

import { useAuth } from "@/lib/auth/useAuth";
import { Movie, UserProfile, WatchlistMovie, DiscussionPost } from "@/lib/types";

const initialUserProfile: UserProfile = {
  id: "",
  fullName: "WatchClub Member",
  username: "@member",
  bio: "",
  email: "",
  age: 0,
  avatarUrl: "/popcorn.png",
  genrePreferences: [],
  joinedDate: "",
  watchlistCount: 0,
  discussionCount: 0,
};

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
      return arr.sort(
        (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
      );
    case "date":
    default:
      return arr.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
  }
}

interface GenreRecommendationRow {
  genre: string;
  movies: Movie[];
}

export default function PortalPage() {
  const { user } = useAuth();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialUserProfile.avatarUrl
  );

  // Sync auth user to profile if available
  useEffect(() => {
    if (user) {
      const name = user.name || "WatchClub Member";
      setProfile((prev) => ({
        ...prev,
        id: user.id || prev.id,
        fullName: name,
        username: `@${name.toLowerCase().replace(/\s+/g, "")}`,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // ── Discussions state ──────────────────────────────────────────────────────
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"discussion" | "watchlist">(
    "watchlist"
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Watchlist state from API ───────────────────────────────────────────────
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // ── Recommendations state from API ─────────────────────────────────────────
  const [recommendationRows, setRecommendationRows] = useState<GenreRecommendationRow[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // ── Fetch Watchlist from API ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchWatchlistApi() {
      setLoadingWatchlist(true);
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
        setLoadingWatchlist(false);
      }
    }

    fetchWatchlistApi();
  }, []);

  // ── Fetch Genre Recommendations from API ──────────────────────────────────
  useEffect(() => {
    async function fetchRecommendations() {
      setLoadingRecommendations(true);
      const targetGenres = ["Action", "Thriller", "Sci-Fi"];

      try {
        const rowPromises = targetGenres.map(async (genre) => {
          try {
            const res = await fetch(`/api/movies/category/${encodeURIComponent(genre)}`);
            if (res.ok) {
              const data = await res.json();
              const movies: Movie[] = (data.results || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                posterUrl: m.posterUrl || m.poster || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : ""),
                vote_average: m.vote_average || m.user_rating,
                year: m.year || (m.releaseDate ? m.releaseDate.slice(0, 4) : undefined),
                category: genre,
              }));
              return { genre, movies };
            }
          } catch {
            return null;
          }
          return null;
        });

        const rows = (await Promise.all(rowPromises)).filter(
          (r): r is GenreRecommendationRow => r !== null && r.movies.length > 0
        );

        setRecommendationRows(rows);
      } catch {
        setRecommendationRows([]);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    fetchRecommendations();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAvatarUpload = useCallback((dataUrl: string) => {
    setAvatarUrl(dataUrl);
  }, []);

  const handleProfileSave = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleRemoveFromWatchlist = useCallback(async (id: number | string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/watchlist?movie_id=${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  }, []);

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/portal`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.fullName} on WatchClub`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const sortedWatchlist = sortWatchlist(watchlist, sortKey);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleProfileSave}
      />

      <div className="w-full max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── PROFILE HEADER CARD (Design Spec: Profile watchclub.txt) ────────────────────────────── */}
        <section
          id="profile-header-card"
          className="rounded-[12px] border border-[#535353] bg-[#302F2F] p-6 sm:p-8"
        >
          {/* Top Section: Avatar + Name & Username & Bio */}
          <div className="flex items-start sm:items-center gap-5 sm:gap-6">
            {/* Avatar */}
            <ProfilePictureUpload
              avatarUrl={avatarUrl}
              displayName={profile.fullName}
              onUpload={handleAvatarUpload}
              size={110}
            />

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-[28px] sm:text-[32px] leading-tight truncate font-heading">
                {profile.fullName}
              </h1>
              <p className="text-white text-[14px] font-normal mt-0.5">
                {profile.username}
              </p>
              <p className="text-white text-[14px] font-normal mt-1 leading-snug">
                {profile.bio || 'Living Inside My Own World Of "Make-Believe."'}
              </p>
            </div>
          </div>

          {/* Bottom Section: 2 Wide Gray Buttons (bg: #3D3D3D, border: #535353, height: 46px, radius: 8px) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button
              id="edit-profile-btn"
              onClick={() => setIsEditOpen(true)}
              className="w-full sm:flex-1 h-[46px] rounded-[8px] bg-[#3D3D3D] border border-[#535353] hover:bg-[#484848] hover:border-white/40 text-white font-normal text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer capitalize"
            >
              <span>+</span> Edit Profile
            </button>
            <button
              id="share-profile-btn"
              onClick={handleShareProfile}
              className="w-full sm:flex-1 h-[46px] rounded-[8px] bg-[#3D3D3D] border border-[#535353] hover:bg-[#484848] hover:border-white/40 text-white font-normal text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer capitalize"
            >
              {copied ? "Copied Link!" : "Share Profile"}
            </button>
          </div>
        </section>

        {/* ── TABS ROW (Line 21 border: #535353) ──────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#535353] pb-3">
          {/* Left Tabs */}
          <div className="flex items-center gap-3">
            <button
              id="tab-discussion"
              onClick={() => setActiveTab("discussion")}
              className={`px-4 py-2 rounded-[16px] text-[14px] font-medium transition-all ${activeTab === "discussion"
                ? "bg-[#3D3D3D] text-white"
                : "text-white hover:text-white/80"
                }`}
            >
              Discussion
            </button>

            <button
              id="tab-watchlist"
              onClick={() => setActiveTab("watchlist")}
              className={`px-5 py-2 rounded-[16px] text-[14px] font-medium transition-all ${activeTab === "watchlist"
                ? "bg-[#3D3D3D] text-white"
                : "text-white hover:text-white/80"
                }`}
            >
              Watchlist
            </button>
          </div>

          {/* Right Sort By */}
          <div className="relative">
            <button
              id="sort-by-btn"
              onClick={() => setIsSortOpen((v) => !v)}
              className="flex items-center gap-1 text-white hover:text-white/80 text-[14px] font-medium transition-colors cursor-pointer"
            >
              Sort By{" "}
              <ChevronDown
                size={15}
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
                    id={`sort-${opt.key}`}
                    onClick={() => {
                      setSortKey(opt.key);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[13px] transition-colors ${sortKey === opt.key
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

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}

        {/* ─ DISCUSSION TAB ─ */}
        {activeTab === "discussion" && (
          <section id="discussion-content" className="space-y-4">
            {discussions.length === 0 ? (
              /* Empty state */
              <div
                className="rounded-2xl border border-[#535353] p-12 text-center space-y-4 bg-[#302F2F]"
              >
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-[#E50914]/10 border border-[#E50914]/25">
                  <MessageCircle size={28} className="text-[#E50914]" />
                </div>
                <h3 className="text-white font-semibold text-[18px]">No discussions yet</h3>
                <p className="text-[#959292] text-[14px] max-w-sm mx-auto">
                  You haven't started any discussions. Explore movies and join the conversation!
                </p>
                <Link
                  href="/community"
                  className="inline-block px-6 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#E50914] hover:bg-[#c5070f] transition-all"
                >
                  Browse Discussions
                </Link>
              </div>
            ) : (
              discussions.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-[#535353] p-5 sm:p-6 transition-all hover:border-white/25 bg-[#302F2F]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#535353] flex-shrink-0">
                      {post.authorAvatar ? (
                        <Image
                          src={post.authorAvatar}
                          alt={post.authorName}
                          width={36}
                          height={36}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E50914] to-[#8B0000] flex items-center justify-center text-white text-sm font-bold">
                          {post.authorName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[14px] font-semibold truncate">
                        {post.authorName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/movie/${post.movieId}`}
                          className="text-[#E50914] text-[12px] hover:underline truncate"
                        >
                          {post.movieTitle}
                        </Link>
                        <span className="text-[#595959] text-[11px]">· {post.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#C7C7C7] text-[14px] leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[#535353]">
                    <button className="flex items-center gap-1.5 text-[#959292] hover:text-[#E50914] transition-colors text-[13px] font-medium">
                      <Heart size={16} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-[#959292] hover:text-white transition-colors text-[13px] font-medium">
                      <MessageCircle size={16} />
                      {post.comments}
                    </button>
                    <Link
                      href={`/movie/${post.movieId}#discussion`}
                      className="ml-auto text-[12px] text-[#E50914] hover:text-white transition-colors font-medium"
                    >
                      View discussion →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* ─ WATCHLIST TAB ─ */}
        {activeTab === "watchlist" && (
          <section id="watchlist-content" className="space-y-5">
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {sortedWatchlist.map((movie) => (
                  <WatchlistCard
                    key={movie.id}
                    movie={movie}
                    onRemove={handleRemoveFromWatchlist}
                  />
                ))}

                {/* Add movie card */}
                <Link
                  href="/movies"
                  id="add-movie-card"
                  className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#535353] aspect-[2/3] text-[#959292] hover:border-[#E50914] hover:text-[#E50914] transition-all group"
                  style={{ background: "#1a1a1c" }}
                >
                  <BookmarkPlus size={24} className="mb-2" />
                  <span className="text-[11px] font-medium text-center px-2">
                    Add Movie
                  </span>
                </Link>
              </div>
            ) : (
              /* FRAME 103: EMPTY WATCHLIST STATE (Exact CSS Spec) */
              <div
                className="w-full py-[40px] px-[16px] sm:px-[84px] flex flex-col items-center justify-center gap-[28px] text-center"
                id="watchlist-empty-state"
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
                      id="explore-movies-series-btn"
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
                      id="go-to-community-btn"
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
            )}
          </section>
        )}

        {/* ── GENRE-BASED RECOMMENDATIONS FROM API ─────────────────────────── */}
        <section id="genre-recommendations" className="space-y-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#E50914]" />
            <h2 className="text-white font-bold text-[20px]">
              Recommended for You
            </h2>
          </div>

          {loadingRecommendations ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recommendationRows.length === 0 ? (
            <div className="p-8 text-center text-[#959292] border border-[#535353] rounded-2xl bg-[#302F2F]">
              No recommendations available right now.
            </div>
          ) : (
            recommendationRows.map((rec) => (
              <div key={rec.genre} className="space-y-3">
                {/* Genre row header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-[#C7C7C7] text-[16px] font-semibold flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-[#E50914] inline-block"
                    />
                    {rec.genre}
                  </h3>
                  <Link
                    href={`/genre/${rec.genre.toLowerCase()}`}
                    className="text-[12px] text-[#E50914] hover:text-white transition-colors font-medium"
                  >
                    See all →
                  </Link>
                </div>

                {/* Movie grid row */}
                <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {rec.movies.map((movie) => (
                    <div
                      key={movie.id}
                      className="flex-none w-[140px] sm:w-[160px] md:w-[180px]"
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
