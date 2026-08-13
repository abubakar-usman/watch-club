import { NextResponse } from "next/server";
import { withRepositoryAuth, repository } from "@/lib/data";
import { Movie, MovieProvider } from "@/lib/types";
import { getMovieProvider } from "@/lib/providers";

const movieProvider: MovieProvider = getMovieProvider();

export const GET = withRepositoryAuth({ auth: "none" }, async (_req, ctx) => {
  try {
    const communityItems = await repository.getCommunityTrendingMovies(7, 10, ctx);
    const snapshotItems = await repository.getTrendingSnapshot(ctx);

    const snapshotMap = new Map<string, { title: string; poster_url: string | null }>();
    for (const snap of snapshotItems) {
      snapshotMap.set(String(snap.movie_id), {
        title: snap.title,
        poster_url: snap.poster_url,
      });
    }

    const resolvedMovies = (await Promise.all(
      communityItems.map(async (item) => {
        const movieIdStr = String(item.movie_id);
        const cached = snapshotMap.get(movieIdStr);

        const ratingScore = item.avg_rating ? item.avg_rating * 2 : 8.5;

        const details = await movieProvider.fetchDetails(item.movie_id);
        if (details) {
          return {
            ...details,
            id: item.movie_id,
            title: details.title || cached?.title || `Movie #${item.movie_id}`,
            posterUrl: details.posterUrl || cached?.poster_url || null,
            poster: details.poster || cached?.poster_url || null,
            poster_path: details.poster_path || cached?.poster_url || null,
            overview:
              details.overview ||
              `Trending in discussion threads with ${item.comment_count} reviews.`,
            user_rating: ratingScore,
            vote_average: ratingScore,
          };
        }

        if (cached && cached.title) {
          return {
            id: item.movie_id,
            title: cached.title,
            posterUrl: cached.poster_url,
            overview: `Trending in discussion threads with ${item.comment_count} reviews.`,
            releaseDate: "",
            cast: [],
            streamingOptions: {},
            poster: cached.poster_url,
            poster_path: cached.poster_url,
            user_rating: ratingScore,
            vote_average: ratingScore,
          };
        }

        return null;
      })
    )).filter(Boolean) as Movie[];
    const movies: Movie[] = resolvedMovies;

    return NextResponse.json({
      page: 1,
      results: movies,
      total_pages: 1,
      total_results: movies.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
