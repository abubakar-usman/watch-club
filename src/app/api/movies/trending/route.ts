import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

export const GET = withRepositoryAuth(
  { auth: "none" },
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type");

      console.log(`[API HIT] GET /api/movies/trending?type=${type || "all"}`);
      const providerData = await movieProvider.fetchTrending("day", 1, 45);
      let finalMovies = providerData.results || [];

      if (type && type !== "all") {
        finalMovies = finalMovies.filter(
          (m: { type?: string; statusBadge?: string }) =>
            m.type?.toLowerCase() === type.toLowerCase() ||
            m.statusBadge?.toLowerCase() === type.toLowerCase()
        );
      }

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