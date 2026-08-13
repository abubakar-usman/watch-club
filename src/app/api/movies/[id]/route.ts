import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { MovieProvider } from "@/lib/types";
import { getMovieProvider } from "@/lib/providers";

const movieProvider: MovieProvider = getMovieProvider();


export const GET = withRepositoryAuth({ auth: "none" }, async (req, _ctx, context?: { params: { id: string } }) => {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const idFromPath = pathParts[pathParts.length - 1];
    const movieId = context?.params?.id || idFromPath;

    if (!movieId) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const movieData = await movieProvider.fetchDetails(movieId);

    if (!movieData) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movieData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
