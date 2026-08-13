import * as streamingAvailability from "streaming-availability";
import { Movie, MovieProvider, TrendingResponse, SearchResponse } from "../types";
import { normalizeMovie } from "./utils";
export { normalizeMovie };

export class StreamingAvailabilityProvider implements MovieProvider {
  private get client(): streamingAvailability.Client | null {
    const apiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
    if (!apiKey) return null;
    return new streamingAvailability.Client(
      new streamingAvailability.Configuration({
        apiKey,
      })
    );
  }

  async fetchTrending(timeWindow: string = "day", page: number = 1, limit: number = 45): Promise<TrendingResponse> {
    const client = this.client;
    if (!client) {
      console.warn("[StreamingAvailabilityProvider] Missing API key for StreamingAvailability API.");
      return {
        results: [],
        page,
        total_pages: 1,
        total_results: 0,
      };
    }

    try {
      const allShows: any[] = [];
      let cursor: string | undefined = undefined;

      while (allShows.length < limit) {
        const data: any = await client.showsApi.searchShowsByFilters({
          country: "us",
          showType: "movie" as any,
          orderBy: "popularity_1year" as any,
          ...(cursor ? { cursor } : {}),
        });

        const shows = data.shows || [];
        if (shows.length === 0) break;

        allShows.push(...shows);

        if (!data.hasMore || !data.nextCursor) break;
        cursor = data.nextCursor;
      }

      const results: Movie[] = allShows.slice(0, limit).map((show: any) => normalizeMovie(show));

      console.log("[MOVIES_DATA_PATH] 1. Raw StreamingAvailability response count:", allShows.length);
      console.log("[MOVIES_DATA_PATH] 2. Mapped Movie objects count:", results.length);

      return {
        results,
        page,
        total_pages: 1,
        total_results: results.length,
      };
    } catch (error) {
      console.error("[StreamingAvailabilityProvider] Error fetching trending movies:", error);
      return {
        results: [],
        page,
        total_pages: 1,
        total_results: 0,
      };
    }
  }

  async fetchDetails(id: string | number): Promise<Movie | null> {
    const idStr = String(id);
    const client = this.client;

    if (!client) {
      console.warn("[StreamingAvailabilityProvider] Missing API key for StreamingAvailability API.");
      return null;
    }

    try {
      const show = await client.showsApi.getShow({
        id: idStr,
        country: "us",
      });
      return normalizeMovie(show);
    } catch (error) {
      console.error(`[StreamingAvailabilityProvider] Error fetching details for movie ${idStr}:`, error);
      return null;
    }
  }

  async search(query: string, page: number = 1): Promise<SearchResponse> {
    if (!query.trim()) {
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }

    const client = this.client;
    if (!client) {
      console.warn("[StreamingAvailabilityProvider] Missing API key for StreamingAvailability API.");
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }

    try {
      const data = await client.showsApi.searchShowsByTitle({
        title: query,
        country: "us",
        showType: "movie" as any,
      });

      const showsList = Array.isArray(data) ? data : (data as any)?.shows || [];
      const results: Movie[] = showsList.map((show: any) => normalizeMovie(show));

      return {
        results,
        page,
        total_pages: 1,
        total_results: results.length,
      };
    } catch (error) {
      console.error(`[StreamingAvailabilityProvider] Error searching movies for query '${query}':`, error);
      return {
        results: [],
        page: page,
        total_pages: 1,
        total_results: 0,
      };
    }
  }
}
