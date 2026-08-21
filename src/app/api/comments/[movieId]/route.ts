import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { comments, user } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ movieId: string }> }
) {
  try {
    const params = await context.params;
    const movieId = params?.movieId;

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    const rawComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        movieId: comments.movieId,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        createdAt: comments.createdAt,
        userName: user.name,
        userImage: user.image,
        userAvatarUrl: user.avatarUrl,
      })
      .from(comments)
      .leftJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.movieId, String(movieId)))
      .orderBy(asc(comments.createdAt));

    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    for (const c of rawComments) {
      const avatar =
        c.userAvatarUrl ||
        c.userImage ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";

      const formatted = {
        id: c.id,
        userId: c.userId,
        movieId: c.movieId,
        content: c.content,
        text: c.content,
        parentCommentId: c.parentCommentId,
        createdAt: c.createdAt
          ? new Date(c.createdAt).toISOString()
          : new Date().toISOString(),
        userName: c.userName || "Member",
        userAvatar: avatar,
        user: {
          id: c.userId,
          name: c.userName || "Member",
          image: c.userImage,
          avatarUrl: c.userAvatarUrl,
        },
        replies: [],
      };
      commentMap.set(c.id, formatted);
    }

    for (const c of rawComments) {
      const item = commentMap.get(c.id);
      if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
        const parent = commentMap.get(c.parentCommentId);
        parent.replies.push(item);
      } else {
        rootComments.push(item);
      }
    }

    return NextResponse.json({ comments: rootComments });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
