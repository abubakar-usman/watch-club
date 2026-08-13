import { NextResponse } from "next/server";
import { repository, withRepositoryAuth } from "@/lib/data";
import { z } from "zod";

const createCommentSchema = z.object({
  movie_id: z.number().int(),
  parent_id: z.string().uuid().nullable().optional(),
  comment_text: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

export const GET = withRepositoryAuth({ auth: "none" }, async (req, ctx) => {
  const { searchParams } = new URL(req.url);
  const movieIdParam = searchParams.get("movie_id");
  if (!movieIdParam) return NextResponse.json({ error: "movie_id required" }, { status: 400 });

  const movieId = parseInt(movieIdParam, 10);
  const rootComments = await repository.getCommentsByMovieId(movieId, ctx);
  return NextResponse.json({ comments: rootComments });
});

export const POST = withRepositoryAuth({ auth: "user" }, async (req, ctx) => {
  const body = await req.json().catch(() => null);
  const parseResult = createCommentSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Validation failed", details: parseResult.error.format() }, { status: 400 });
  }

  const { movie_id, parent_id, comment_text, rating } = parseResult.data;
  const userId = ctx.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const newComment = await repository.createComment({
      movie_id,
      user_id: userId,
      parent_id: parent_id || null,
      comment_text,
      rating: rating ?? null,
    }, ctx);
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post" }, { status: 500 });
  }
});