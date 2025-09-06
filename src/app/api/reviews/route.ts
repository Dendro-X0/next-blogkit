import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { comments, user } from "@/lib/db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "10");

  if (!postId && !mine) {
    return NextResponse.json({ error: "postId or mine=1 is required" }, { status: 400 });
  }

  try {
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize =
      Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 50
        ? pageSizeParam
        : 10;

    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    const me = session?.user?.id ?? null;

    const baseWhere = mine
      ? and(eq(comments.authorId, me ?? ""), isNull(comments.deletedAt))
      : and(eq(comments.postId, parseInt(postId as string, 10)), isNull(comments.deletedAt));

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(comments)
      .where(baseWhere);

    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        rating: comments.rating,
        createdAt: comments.createdAt,
        authorId: comments.authorId,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comments)
      .leftJoin(user, eq(comments.authorId, user.id))
      .where(baseWhere)
      .orderBy(desc(comments.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items = rows.map((r) => ({
      id: r.id,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
      author: r.author,
      isOwner: me ? r.authorId === me : false,
    }));

    const res: NextResponse = NextResponse.json({ items, total, page, pageSize });
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, content, rating, hp } = await request.json();

    if (!postId || !content) {
      return NextResponse.json({ error: "postId and content are required" }, { status: 400 });
    }

    if (typeof hp === "string" && hp.trim().length > 0) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "Invalid rating. Must be a number between 1 and 5." },
          { status: 400 },
        );
      }
    }

    const contentStr: string = String(content).trim();
    if (contentStr.length < 2) {
      return NextResponse.json({ error: "Comment is too short." }, { status: 400 });
    }
    if (contentStr.length > 4000) {
      return NextResponse.json(
        { error: "Comment is too long (max 4000 characters)." },
        { status: 400 },
      );
    }

    // Simple per-user per-post rate limit: 30s between comments
    const MIN_INTERVAL_MS = 30_000;
    const [last] = await db
      .select({ createdAt: comments.createdAt })
      .from(comments)
      .where(and(eq(comments.postId, parseInt(postId, 10)), eq(comments.authorId, session.user.id)))
      .orderBy(desc(comments.createdAt))
      .limit(1);
    if (last) {
      const now = Date.now();
      const lastMs = new Date(last.createdAt as unknown as string).getTime();
      if (now - lastMs < MIN_INTERVAL_MS) {
        return NextResponse.json(
          { error: "You are commenting too fast. Please wait a bit." },
          { status: 429 },
        );
      }
    }

    const [newReview] = await db
      .insert(comments)
      .values({
        postId: parseInt(postId, 10),
        authorId: session.user.id,
        content: contentStr,
        rating: rating ?? null,
      })
      .returning();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
