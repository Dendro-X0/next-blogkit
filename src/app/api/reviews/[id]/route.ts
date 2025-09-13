import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const idParam = (await context.params).id;
    const id = parseId(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      content?: string;
      title?: string | null;
      rating?: number | null;
    };
    const content = typeof body.content === "string" ? body.content.trim() : undefined;
    const title =
      typeof body.title === "string"
        ? body.title.trim().slice(0, 120)
        : body.title === null
        ? null
        : undefined;
    const rating = body.rating ?? undefined;

    if (content !== undefined) {
      if (content.length < 2)
        return NextResponse.json({ error: "Comment is too short." }, { status: 400 });
      if (content.length > 4000)
        return NextResponse.json(
          { error: "Comment is too long (max 4000 characters)." },
          { status: 400 },
        );
    }
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5)
        return NextResponse.json({ error: "Invalid rating. Must be 1-5." }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.id, id),
          eq(reviews.authorId, session.user.id),
          isNull(reviews.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateValues: Partial<typeof reviews.$inferInsert> = {};
    if (content !== undefined) updateValues.body = content;
    if (title !== undefined) updateValues.title = title;
    if (rating !== undefined) updateValues.rating = rating;

    if (Object.keys(updateValues).length === 0)
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const [updated] = await db
      .update(reviews)
      .set(updateValues)
      .where(eq(reviews.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const idParam = (await context.params).id;
    const id = parseId(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.id, id),
          eq(reviews.authorId, session.user.id),
          isNull(reviews.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [deleted] = await db
      .update(reviews)
      .set({ deletedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
