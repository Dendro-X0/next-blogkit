import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { postReactions } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Supported reaction types. Must stay in sync with reaction_type enum.
 */
type ReactionType = "like" | "love" | "insightful" | "curious" | "clap";

type Counts = Record<ReactionType, number>;

function emptyCounts(): Counts {
  return { like: 0, love: 0, insightful: 0, curious: 0, clap: 0 };
}

async function getSessionUserId(): Promise<string | null> {
  const headers = new Headers();
  const session = await auth.api.getSession({ headers });
  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId is required" }, { status: 400 });

  const pid = Number(postId);
  if (!Number.isInteger(pid))
    return NextResponse.json({ error: "postId must be an integer" }, { status: 400 });

  try {
    const rows = await db
      .select({ type: postReactions.type, count: sql<number>`count(*)` })
      .from(postReactions)
      .where(eq(postReactions.postId, pid))
      .groupBy(postReactions.type);

    const counts = emptyCounts();
    for (const r of rows) counts[r.type as ReactionType] = Number(r.count);

    const userId = await getSessionUserId();
    const userTypes: ReactionType[] = userId
      ? (
          await db
            .select({ type: postReactions.type })
            .from(postReactions)
            .where(and(eq(postReactions.postId, pid), eq(postReactions.userId, userId)))
        ).map((r) => r.type as ReactionType)
      : [];

    const res: NextResponse = NextResponse.json({ counts, userTypes });
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (err) {
    console.error("Error fetching reactions:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { postId, type } = (await request.json()) as { postId?: number; type?: ReactionType };
  if (postId == null || type == null)
    return NextResponse.json({ error: "postId and type are required" }, { status: 400 });

  const pid = Number(postId);
  if (!Number.isInteger(pid))
    return NextResponse.json({ error: "postId must be an integer" }, { status: 400 });

  const allowed: ReactionType[] = ["like", "love", "insightful", "curious", "clap"];
  if (!allowed.includes(type))
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });

  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await db
      .select({ type: postReactions.type })
      .from(postReactions)
      .where(
        and(
          eq(postReactions.postId, pid),
          eq(postReactions.userId, userId),
          eq(postReactions.type, type),
        ),
      );

    if (existing.length > 0) {
      await db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, pid),
            eq(postReactions.userId, userId),
            eq(postReactions.type, type),
          ),
        );
    } else {
      await db.insert(postReactions).values({ postId: pid, userId, type });
    }

    // Return fresh counts
    const rows = await db
      .select({ type: postReactions.type, count: sql<number>`count(*)` })
      .from(postReactions)
      .where(eq(postReactions.postId, pid))
      .groupBy(postReactions.type);

    const counts = emptyCounts();
    for (const r of rows) counts[r.type as ReactionType] = Number(r.count);

    const userTypes = (
      await db
        .select({ type: postReactions.type })
        .from(postReactions)
        .where(and(eq(postReactions.postId, pid), eq(postReactions.userId, userId)))
    ).map((r) => r.type as ReactionType);

    const res: NextResponse = NextResponse.json({ counts, userTypes });
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (err) {
    console.error("Error toggling reaction:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
