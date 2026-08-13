import { Movie, MovieProvider, MovieSearchResult } from "../types";

const MOTN_KEY =
  process.env.STREAMING_AVAILABILITY_API_KEY ||
  "motn-key-v4-trAtYAdjwuKIY7n9a7gamrqGEPdsQtuN";

const MOTN_BASE_URL =
  process.env.STREAMING_AVAILABILITY_BASE_URL ||
  "https://api.movieofthenight.com/v4";

function formatMotnShow(item: any): Movie {
  if (!item) return {} as Movie;

  const poster =
    item.imageSet?.verticalPoster?.w480 ||
    item.imageSet?.verticalPoster?.w360 ||
    item.imageSet?.verticalPoster?.w240 ||
    item.imageSet?.verticalPoster?.w600 ||
    null;

  const backdrop =
    item.imageSet?.horizontalBackdrop?.w720 ||
    item.imageSet?.horizontalBackdrop?.w1080 ||
    item.imageSet?.horizontalBackdrop?.w360 ||
    item.imageSet?.horizontalBackdrop?.w1440 ||
    null;

  const genreNames = Array.isArray(item.genres)
    ? item.genres.map((g: any) =>
      typeof g === "string" ? g : g.name || g.id
    )
    : [];

  const rating =
    typeof item.rating === "number"
      ? Math.round((item.rating / 10) * 10) / 10
      : 8.0;

  return {
    id: String(item.id),
    title: item.title || item.originalTitle || "Untitled",
    overview: item.overview || "",
    year: item.releaseYear ? String(item.releaseYear) : "",
    releaseDate: item.releaseYear ? `${item.releaseYear}-01-01` : "",
    posterUrl: poster,
    poster: poster,
    poster_path: poster,
    backdrop: backdrop,
    backdrop_path: backdrop,
    user_rating: rating,
    vote_average: rating,
    vote_count: item.voteCount || 1000,
    genre_names: genreNames,
    category:
      genreNames[0] ||
      (item.showType === "series" ? "Series" : "Movie"),
    type: item.showType === "series" ? "series" : "movie",
    statusBadge: item.showType === "series" ? "Series" : "Movie",
    cast: item.cast || [],
    streamingOptions: item.streamingOptions || {},
  };
}

class LiveStreamingMovieProvider implements MovieProvider {
  private headers = {
    "x-api-key": MOTN_KEY,
    "Content-Type": "application/json",
  };

  async fetchTrending(
    _timeWindow: string = "day",
    page: number = 1,
    limit: number = 20
  ): Promise<MovieSearchResult> {
    try {
      const url = `${MOTN_BASE_URL}/shows/top?country=us&service=netflix`;

      const res = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return {
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        };
      }

      const data = await res.json();

      const rawShows = Array.isArray(data)
        ? data
        : data.shows || [];

      const results = rawShows
        .slice((page - 1) * limit, page * limit)
        .map(formatMotnShow);

      return {
        page,
        results,
        total_pages: Math.ceil(rawShows.length / limit) || 1,
        total_results: rawShows.length,
      };
    } catch {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }

  async search(
    query: string,
    page: number = 1,
    genre?: string,
    type?: string,
    _year?: string,
    limit: number = 20
  ): Promise<MovieSearchResult> {
    try {
      let url = "";
      const q = query.trim();

      if (q) {
        url = `${MOTN_BASE_URL}/shows/search/title?title=${encodeURIComponent(
          q
        )}&country=us`;
      } else {
        const params = new URLSearchParams({
          country: "us",
        });

        if (genre && genre !== "all") {
          params.append("genres", genre.toLowerCase());
        }

        if (type === "movie" || type === "series") {
          params.append("show_type", type);
        }

        url = `${MOTN_BASE_URL}/shows/search/filters?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return {
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        };
      }

      const data = await res.json();

      const rawShows = Array.isArray(data)
        ? data
        : data.shows || [];

      const results = rawShows
        .slice((page - 1) * limit, page * limit)
        .map(formatMotnShow);

      return {
        page,
        results,
        total_pages: Math.ceil(rawShows.length / limit) || 1,
        total_results: rawShows.length,
      };
    } catch {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }

  async fetchDetails(
    id: string | number
  ): Promise<Movie | null> {
    try {
      const url = `${MOTN_BASE_URL}/shows/${id}`;

      const res = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 3600 },
      });

      if (!res.ok) return null;

      const data = await res.json();

      return formatMotnShow(data);
    } catch {
      return null;
    }
  }

  async fetchByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MovieSearchResult> {
    const catLower = category.toLowerCase().trim();

    if (
      catLower === "emmy nominees" ||
      catLower === "international award-winning" ||
      catLower === "based on webtoons"
    ) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }

    try {
      let url = "";

      if (catLower === "movies" || catLower === "movie") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&show_type=movie`;
      } else if (
        catLower === "series" ||
        catLower === "shows" ||
        catLower === "tv"
      ) {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&show_type=series`;
      } else if (
        catLower === "animes" ||
        catLower === "anime"
      ) {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&genres=animation`;
      } else if (
        catLower === "k-dramas" ||
        catLower === "k drama"
      ) {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=kr`;
      } else if (catLower === "japanese") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=jp`;
      } else if (catLower === "bollywood") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=in`;
      } else if (catLower === "thai") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=th`;
      } else if (catLower === "western") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&genres=western`;
      } else if (catLower === "comedy") {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&genres=comedy`;
      } else if (catLower === "chinese") {
        url = `${MOTN_BASE_URL}/shows/search/title?title=chinese&country=us`;
      } else {
        url = `${MOTN_BASE_URL}/shows/search/filters?country=us&genres=${encodeURIComponent(
          catLower
        )}`;
      }

      const res = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return {
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        };
      }

      const data = await res.json();

      const rawShows = Array.isArray(data)
        ? data
        : data.shows || [];

      const results = rawShows
        .slice((page - 1) * limit, page * limit)
        .map(formatMotnShow);

      return {
        page,
        results,
        total_pages: Math.ceil(rawShows.length / limit) || 1,
        total_results: rawShows.length,
      };
    } catch {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }
}

export function getMovieProvider(): MovieProvider {
  return new LiveStreamingMovieProvider();
}