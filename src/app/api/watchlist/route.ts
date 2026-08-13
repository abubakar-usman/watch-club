import { NextResponse } from "next/server";
import { repository, withRepositoryAuth } from "@/lib/data";
import { z } from "zod";

const watchlistSchema = z.object({
  movie_id: z.number().int({ message: "movie_id must be a valid integer" }),
});

/**
 * GET /api/watchlist
 * Lists movies in the logged-in user's watchlist.
 * Requires user auth.
 */
export const GET = withRepositoryAuth({ auth: "user" }, async (_req, ctx) => {
  const userId = ctx.userId!;
  const watchlist = await repository.getWatchlist(userId, ctx);
  return NextResponse.json({ watchlist });
});

/**
 * POST /api/watchlist
 * Adds a movie to the logged-in user's watchlist.
 * Requires user auth.
 */
export const POST = withRepositoryAuth({ auth: "user" }, async (req, ctx) => {
  const userId = ctx.userId!;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parseResult = watchlistSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { movie_id } = parseResult.data;

  // Check if already in watchlist
  const existing = await repository.getWatchlistItem(userId, movie_id, ctx);
  if (existing) {
    return NextResponse.json(
      { error: "Movie is already in your watchlist" },
      { status: 409 }
    );
  }

  // Insert into watchlist
  const item = await repository.addToWatchlist(userId, movie_id, ctx);
  return NextResponse.json({ item }, { status: 201 });
});

/**
 * DELETE /api/watchlist
 * Removes a movie from the logged-in user's watchlist.
 * Accepts movie_id via query parameter (?movie_id=123) or request body ({ movie_id: 123 }).
 * Requires user auth.
 */
export const DELETE = withRepositoryAuth({ auth: "user" }, async (req, ctx) => {
  const userId = ctx.userId!;

  const { searchParams } = new URL(req.url);
  const queryMovieId = searchParams.get("movie_id");
  let movieId: number | undefined;

  if (queryMovieId) {
    movieId = parseInt(queryMovieId, 10);
  } else {
    const body = await req.json().catch(() => null);
    if (body) {
      const parseResult = watchlistSchema.safeParse(body);
      if (parseResult.success) {
        movieId = parseResult.data.movie_id;
      }
    }
  }

  if (movieId === undefined || isNaN(movieId)) {
    return NextResponse.json(
      { error: "movie_id (query parameter or body) is required" },
      { status: 400 }
    );
  }

  await repository.removeFromWatchlist(userId, movieId, ctx);
  return NextResponse.json({ message: "Removed from watchlist" }, { status: 200 });
});

