import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

export const GET = withRepositoryAuth(
  { auth: "none" },
  async (_req, ctx) => {
    try {
      console.log("[API HIT] GET /api/movies/trending");
      const providerData = await movieProvider.fetchTrending("day", 1, 45);
      const finalMovies = (providerData.results || []).slice(0, 45);

      return NextResponse.json({
        page: 1,
        results: finalMovies,
        total_pages: 1,
        total_results: finalMovies.length,
      });
    } catch (error: unknown) {
      console.error("Failed to fetch trending movies:", error);

      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);