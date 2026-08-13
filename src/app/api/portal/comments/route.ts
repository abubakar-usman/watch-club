import { NextResponse } from "next/server";
import { repository, withRepositoryAuth } from "@/lib/data";

export const GET = withRepositoryAuth({ auth: "user" }, async (_req, ctx) => {
  const userId = ctx.userId!;
  const userComments = await repository.getUserComments(userId, ctx);
  return NextResponse.json({ comments: userComments });
});
