import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { MovieProvider } from "@/lib/types";
import { getMovieProvider } from "@/lib/providers";

const movieProvider: MovieProvider = getMovieProvider();

export const GET = withRepositoryAuth({ auth: "none" }, async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q");
    const pageStr = searchParams.get("page") || "1";
    const page = parseInt(pageStr, 10) || 1;

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const data = await movieProvider.search(query, page);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
