import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

export const GET = withRepositoryAuth({ auth: "none" }, async () => {
  try {
    const data = await movieProvider.fetchTrending("day", 1, 10);
    return NextResponse.json({ results: data.results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
