import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { comments, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Better Auth server session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to post comments." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const movieIdRaw = body.movieId ?? body.movie_id;
    const contentRaw = body.content ?? body.comment_text;
    const parentCommentIdRaw = body.parentCommentId ?? body.parent_id ?? body.parentCommentId;

    const movieId = String(movieIdRaw || "").trim();
    const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
    const parentCommentId = parentCommentIdRaw
      ? String(parentCommentIdRaw).trim()
      : null;

    // 3. Validation
    if (!movieId) {
      return NextResponse.json(
        { error: "movieId is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Comment content exceeds maximum length of 2000 characters" },
        { status: 400 }
      );
    }

    // 4. Insert into comments table using session.user.id
    const userId = session.user.id;
    const [inserted] = await db
      .insert(comments)
      .values({
        userId,
        movieId,
        content,
        parentCommentId: parentCommentId || null,
      })
      .returning();

    // 5. Query user details for author info
    const [author] = await db
      .select({
        name: user.name,
        image: user.image,
        avatarUrl: user.avatarUrl,
      })
      .from(user)
      .where(eq(user.id, userId));

    const avatar =
      author?.avatarUrl ||
      author?.image ||
      session.user.image ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";

    const userName = author?.name || session.user.name || "Member";

    const newCommentFormatted = {
      id: inserted.id,
      userId: inserted.userId,
      movieId: inserted.movieId,
      content: inserted.content,
      text: inserted.content,
      parentCommentId: inserted.parentCommentId,
      createdAt: inserted.createdAt
        ? new Date(inserted.createdAt).toISOString()
        : new Date().toISOString(),
      userName,
      userAvatar: avatar,
      user: {
        id: userId,
        name: userName,
        image: author?.image || session.user.image,
        avatarUrl: author?.avatarUrl,
      },
      replies: [],
    };

    return NextResponse.json({ comment: newCommentFormatted }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}