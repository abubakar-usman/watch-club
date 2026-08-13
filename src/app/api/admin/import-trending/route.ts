import { NextResponse } from "next/server";
import { withRepositoryAuth, repository, CreateTrendingSnapshotInput } from "@/lib/data";
import { MovieProvider } from "@/lib/types";
import { getMovieProvider } from "@/lib/providers";

const movieProvider: MovieProvider = getMovieProvider();

export const POST = withRepositoryAuth({ auth: "none" }, async (_req, ctx) => {
  try {
    const trendingData = await movieProvider.fetchTrending("day", 1, 45);
    const movies = trendingData.results || [];

    const snapshotItems: CreateTrendingSnapshotInput[] = movies.map((movie, index) => ({
      movie_id: String(movie.id),
      rank: index + 1,
      title: movie.title,
      poster_url: movie.posterUrl || movie.poster || movie.poster_path || null,
    }));

    const saved = await repository.overwriteTrendingSnapshot(snapshotItems, ctx);

    return NextResponse.json({
      success: true,
      count: saved.length,
      imported_at: new Date().toISOString(),
      results: saved,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
