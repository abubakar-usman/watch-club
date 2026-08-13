import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { MovieProvider, Movie } from "@/lib/types";
import { getMovieProvider } from "@/lib/providers";
import DiscussionBox from "@/components/DiscussionBox";
import WatchlistButton from "@/components/WatchlistButton";
import StreamingAvailability from "@/components/StreamingAvailability";

const movieProvider: MovieProvider = getMovieProvider();

/* ─── Helpers ─────────────────────────────────────────────── */
function formatRuntime(mins: number | null | undefined): string {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-white/5 border border-white/8 rounded-full px-3 py-0.5
                     font-mono text-xs text-gray/80">
      {children}
    </span>
  );
}

/* ─── SERVER COMPONENT ───────────────────────────────────────── */
export default async function MoviePage({
  params,
}: {
  params: { id: string };
}) {
  const movieIdStr = params.id;
  if (!movieIdStr) notFound();

  /* Detect viewer country from Vercel edge header */
  const headersList = await headers();
  const viewerCountry =
    (headersList.get("x-vercel-ip-country") ?? "US").toUpperCase();

  const movie: Movie | null = await movieProvider.fetchDetails(movieIdStr);

  if (!movie) {
    notFound();
  }

  /* Extract top cast & director */
  const castList = Array.isArray(movie.credits?.cast)
    ? movie.credits.cast
    : Array.isArray(movie.cast)
      ? movie.cast.map((c, idx) =>
        typeof c === "string" ? { id: idx, name: c, character: "Actor" } : c
      )
      : [];

  const topCast = castList.slice(0, 8);
  const directors = (movie.credits?.crew ?? []).filter(
    (c: any) => c.job === "Director"
  );
  const writers = (movie.credits?.crew ?? []).filter(
    (c: any) => c.job === "Writer" || c.job === "Screenplay"
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const backdropSrc = movie.backdrop || movie.backdrop_path || null;
  const posterSrc = movie.posterUrl || movie.poster || movie.poster_path || null;
  const year = movie.year ? String(movie.year) : movie.releaseDate?.slice(0, 4) ?? "";
  const ratingScore = movie.user_rating || movie.vote_average || 7.5;
  const ratingPct = Math.round((ratingScore / 10) * 100);
  const ratingColor =
    ratingPct >= 70 ? "#22c55e" : ratingPct >= 50 ? "#f59e0b" : "#ef4444";

  // Convert sources to Provider format for StreamingAvailability
  const formattedProviders = movie.sources && movie.sources.length > 0
    ? {
      flatrate: movie.sources
        .filter((s: any) => s.type === "sub" || s.type === "subscription")
        .map((s: any) => ({
          provider_id: s.source_id || s.service?.id || 1,
          provider_name: s.name || s.service?.name || "Provider",
          logo_path: s.logo_100px || s.service?.imageSet?.lightThemeImage || "",
          display_priority: 1,
        })),
      rent: movie.sources
        .filter((s: any) => s.type === "rent")
        .map((s: any) => ({
          provider_id: s.source_id || s.service?.id || 2,
          provider_name: s.name || s.service?.name || "Provider",
          logo_path: s.logo_100px || s.service?.imageSet?.lightThemeImage || "",
          display_priority: 2,
        })),
      buy: movie.sources
        .filter((s: any) => s.type === "buy")
        .map((s: any) => ({
          provider_id: s.source_id || s.service?.id || 3,
          provider_name: s.name || s.service?.name || "Provider",
          logo_path: s.logo_100px || s.service?.imageSet?.lightThemeImage || "",
          display_priority: 3,
        })),
    }
    : movie.streamingOptions && typeof movie.streamingOptions === "object" && movie.streamingOptions.us
      ? {
        flatrate: (movie.streamingOptions.us || [])
          .filter((s: any) => s.type === "subscription" || s.type === "sub")
          .map((s: any, i: number) => ({
            provider_id: s.service?.id || i,
            provider_name: s.service?.name || "Provider",
            logo_path: s.service?.imageSet?.lightThemeImage || "",
            display_priority: 1,
          })),
        rent: (movie.streamingOptions.us || [])
          .filter((s: any) => s.type === "rent")
          .map((s: any, i: number) => ({
            provider_id: s.service?.id || i,
            provider_name: s.service?.name || "Provider",
            logo_path: s.service?.imageSet?.lightThemeImage || "",
            display_priority: 2,
          })),
        buy: (movie.streamingOptions.us || [])
          .filter((s: any) => s.type === "buy")
          .map((s: any, i: number) => ({
            provider_id: s.service?.id || i,
            provider_name: s.service?.name || "Provider",
            logo_path: s.service?.imageSet?.lightThemeImage || "",
            display_priority: 3,
          })),
      }
      : null;

  const numericMovieId = typeof movie.id === "number" ? movie.id : parseInt(String(movie.id), 10) || 550;

  return (
    <div className="space-y-12">
      {/* ── HERO BACKDROP ─────────────────────────────────────── */}
      <div className="relative -mx-4 lg:-mx-8 -mt-8 overflow-hidden">
        {backdropSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdropSrc}
              alt={movie.title}
              className="w-full h-[320px] md:h-[460px] object-cover object-center"
            />
            {/* Multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-[200px] bg-black" />
        )}
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 -mt-32 relative z-10">
        {/* ── LEFT COLUMN: Poster + Streaming ─────────────────── */}
        <div className="space-y-6 flex flex-col items-center lg:items-start">
          {/* Poster */}
          <div className="relative w-48 lg:w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80
                          border border-white/8 flex-shrink-0">
            {posterSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={posterSrc}
                alt={movie.title}
                className="w-full object-cover"
              />
            ) : (
              <div
                className="w-full bg-surface flex items-center justify-center text-gray/30"
                style={{ aspectRatio: "2/3" }}
              >
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                </svg>
              </div>
            )}

            {/* Rating badge overlay */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur rounded-full p-0.5
                            border border-white/10">
              <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={ratingColor} strokeWidth="3"
                    strokeDasharray={`${ratingPct} ${100 - ratingPct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold"
                  style={{ color: ratingColor }}>
                  {ratingPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Watchlist Button */}
          <div className="w-full flex justify-center lg:justify-start">
            <WatchlistButton movieId={numericMovieId} />
          </div>

          {/* Streaming Availability */}
          <div className="w-full bg-black/40 border border-white/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-xs text-white/60 tracking-wider">WHERE TO WATCH</span>
            </div>
            <StreamingAvailability providers={formattedProviders} countryCode={viewerCountry} />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Details ──────────────────────────── */}
        <div className="space-y-7 min-w-0">
          {/* Title & meta */}
          <div className="space-y-3">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {year && <MetaPill>{year}</MetaPill>}
              {movie.genre_names?.map((g, i) => (
                <MetaPill key={i}>{g}</MetaPill>
              ))}
              {movie.genres?.map((g) => (
                <MetaPill key={g.id}>{g.name}</MetaPill>
              ))}
              {movie.vote_count && (
                <span className="font-mono text-xs text-gray/40 ml-1">
                  {movie.vote_count.toLocaleString()} votes
                </span>
              )}
            </div>
          </div>

          {/* Synopsis */}
          {movie.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-brand-red rounded-full" />
                <h2 className="font-heading text-lg text-white tracking-wide">Synopsis</h2>
              </div>
              <p className="text-white/75 leading-relaxed text-sm md:text-base max-w-2xl">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Crew row */}
          {(directors.length > 0 || writers.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {directors.length > 0 && (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-gray/50 tracking-widest">DIRECTOR</p>
                  {directors.map((d: any) => (
                    <p key={d.id} className="text-white text-sm font-medium">{d.name}</p>
                  ))}
                </div>
              )}
              {writers.length > 0 && (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-gray/50 tracking-widest">SCREENPLAY</p>
                  {writers.slice(0, 2).map((w: any) => (
                    <p key={w.id} className="text-white text-sm font-medium">{w.name}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cast */}
          {topCast.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-brand-red rounded-full" />
                <h2 className="font-heading text-lg text-white tracking-wide">Cast</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {topCast.map((member: any) => {
                  const profileSrc = member.profile_path || member.profilePath || null;
                  return (
                    <div key={member.id || member.name} className="flex-shrink-0 w-20 space-y-1.5 group">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-white/10
                                      group-hover:border-brand-red/40 transition-colors bg-surface">
                        {profileSrc ? (
                          <Image
                            src={profileSrc}
                            alt={member.name}
                            width={185}
                            height={185}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray/30">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                          {member.name}
                        </p>
                        {member.character && (
                          <p className="text-gray/50 text-[10px] leading-tight line-clamp-1 font-mono">
                            {member.character}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jump to discussion */}
          <Link
            href="#discussion"
            className="inline-flex items-center gap-2 text-brand-red hover:text-white
                       font-mono text-sm transition-colors group"
          >
            <span className="w-4 h-px bg-current inline-block transition-all group-hover:w-6" />
            Jump to Discussion
          </Link>
        </div>
      </div>

      {/* ── DISCUSSION BOX ──────────────────────────────────────── */}
      <div className="border-t border-white/5 pt-10">
        <DiscussionBox
          movieId={numericMovieId}
          supabaseUrl={supabaseUrl}
          supabasePublishableKey={supabasePublishableKey}
        />
      </div>
    </div>
  );
}
