import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

export const GET = withRepositoryAuth({ auth: "none" }, async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const data = await movieProvider.search("", 1, undefined, type);
    return NextResponse.json({ results: data.results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
