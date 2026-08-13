import { Movie, CastMember } from "../types";

export function normalizeMovie(item: any): Movie {
  if (!item) {
    return {
      id: "",
      title: "Unknown",
      posterUrl: null,
      overview: "",
      releaseDate: "",
      cast: [],
      streamingOptions: {},
    };
  }

  const id = item.id || item.imdbId || item.tmdbId || item.movie_id || "";
  const title = item.title || item.originalTitle || item.name || "Untitled";

  // Poster resolution
  let posterUrl: string | null = null;
  if (typeof item.posterUrl === "string" && item.posterUrl) {
    posterUrl = item.posterUrl;
  } else if (item.imageSet?.verticalPoster) {
    posterUrl =
      item.imageSet.verticalPoster.w480 ||
      item.imageSet.verticalPoster.w360 ||
      item.imageSet.verticalPoster.w720 ||
      null;
  } else if (item.poster) {
    posterUrl = item.poster;
  } else if (item.poster_path) {
    posterUrl = item.poster_path.startsWith("http")
      ? item.poster_path
      : `https://cdn.movieofthenight.com/posters${item.poster_path}`;
  }

  // Backdrop resolution
  let backdropUrl: string | null = null;
  if (item.imageSet?.horizontalBackdrop) {
    backdropUrl =
      item.imageSet.horizontalBackdrop.w1080 ||
      item.imageSet.horizontalBackdrop.w720 ||
      item.imageSet.horizontalBackdrop.w480 ||
      null;
  } else if (item.backdrop) {
    backdropUrl = item.backdrop;
  } else if (item.backdrop_path) {
    backdropUrl = item.backdrop_path.startsWith("http")
      ? item.backdrop_path
      : `https://cdn.movieofthenight.com/backdrops${item.backdrop_path}`;
  }

  // Release date
  const releaseYear = item.releaseYear || item.year;
  const releaseDate =
    item.releaseDate ||
    item.release_date ||
    (releaseYear ? `${releaseYear}-01-01` : "");

  // Cast
  let cast: string[] | CastMember[] = [];
  if (Array.isArray(item.cast)) {
    cast = item.cast;
  } else if (Array.isArray(item.credits?.cast)) {
    cast = item.credits.cast;
  }

  // Streaming Options
  const streamingOptions = item.streamingOptions || item.sources || {};

  const rating = item.user_rating || item.vote_average || item.rating || 7.5;

  return {
    id,
    title,
    posterUrl,
    overview: item.overview || item.plot_overview || item.plotOverview || "",
    releaseDate,
    release_date: releaseDate,
    cast,
    streamingOptions,

    // Backward compatibility fields
    poster: posterUrl,
    poster_path: posterUrl,
    backdrop: backdropUrl,
    backdrop_path: backdropUrl,
    user_rating: rating,
    vote_average: rating,
    vote_count: item.vote_count || 1000,
    year: releaseYear || (releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : undefined),
    genre_names:
      item.genre_names ||
      (Array.isArray(item.genres)
        ? item.genres.map((g: any) => (typeof g === "string" ? g : g.name))
        : []),
    genres: item.genres || [],
    credits: item.credits || {
      cast: Array.isArray(cast)
        ? cast.map((c: any, idx: number) =>
          typeof c === "string"
            ? { id: idx, name: c, character: "Actor" }
            : c
        )
        : [],
      crew: Array.isArray(item.directors)
        ? item.directors.map((d: any, idx: number) => ({
          id: idx,
          name: typeof d === "string" ? d : d.name,
          job: "Director",
          department: "Directing",
        }))
        : [],
    },
    sources: Array.isArray(item.sources) ? item.sources : [],
  };
}
