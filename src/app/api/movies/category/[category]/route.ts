import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

export const GET = withRepositoryAuth(
  { auth: "none" },
  async (req, _ctx, context?: { params: { category: string } }) => {
    try {
      const url = new URL(req.url);
      const parts = url.pathname.split("/");
      const paramsObj = context?.params ? await (context.params as any) : null;
      const category = paramsObj?.category || categoryFromPath || "Action";

      const decodedCategory = decodeURIComponent(category);
      const data = await movieProvider.fetchByCategory(decodedCategory);
      return NextResponse.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
);
