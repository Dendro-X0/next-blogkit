import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, posts, postsToTags, tags, user } from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";

// Query params
// q: string
// tags: comma-separated tag names
// categories: comma-separated category names
// authors: comma-separated author names
// sort: newest|oldest|title (default: newest)
// page: number (default: 1)
// limit: number (default: 10, max: 50)

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const qRaw = (searchParams.get("q") ?? "").trim();
    const tagsRaw = (searchParams.get("tags") ?? "").trim();
    const categoriesRaw = (searchParams.get("categories") ?? "").trim();
    const authorsRaw = (searchParams.get("authors") ?? "").trim();
    const sort = (searchParams.get("sort") ?? "newest").toLowerCase();

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;
    const offset = (page - 1) * limit;

    const tagsList = tagsRaw ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const categoriesList = categoriesRaw ? categoriesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const authorsList = authorsRaw ? authorsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const whereClauses: SQL<unknown>[] = [eq(posts.published, true)];

    if (qRaw) {
      const q = `%${qRaw}%`;
      const titleLike = ilike(posts.title, q) as SQL<unknown>;
      const excerptLike = ilike(posts.excerpt, q) as SQL<unknown>;
      whereClauses.push(or(titleLike, excerptLike) as SQL<unknown>);
    }
    if (categoriesList.length > 0) {
      whereClauses.push(inArray(categories.name, categoriesList));
    }
    if (authorsList.length > 0) {
      whereClauses.push(inArray(user.name, authorsList));
    }
    if (tagsList.length > 0) {
      // Match any of the provided tags
      whereClauses.push(inArray(tags.name, tagsList));
    }

    const orderBy =
      sort === "oldest" ? asc(posts.createdAt) : sort === "title" ? asc(posts.title) : desc(posts.createdAt);

    // We fetch limit+1 to determine if there is a next page. We'll group rows by post id.
    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        createdAt: posts.createdAt,
        authorName: user.name,
        categoryName: categories.name,
        tagName: tags.name,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(postsToTags, eq(postsToTags.postId, posts.id))
      .leftJoin(tags, eq(postsToTags.tagId, tags.id))
      .where(and(...whereClauses))
      .orderBy(orderBy)
      .limit(limit + 1)
      .offset(offset);

    // Group by post id and aggregate tags
    const map = new Map<number, {
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      createdAt: Date | string;
      authorName: string | null;
      categoryName: string | null;
      tags: string[];
    }>();
    for (const r of rows) {
      const key = r.id;
      if (!map.has(key)) {
        map.set(key, {
          id: r.id,
          title: r.title,
          slug: r.slug,
          excerpt: r.excerpt ?? null,
          createdAt: r.createdAt,
          authorName: r.authorName ?? null,
          categoryName: r.categoryName ?? null,
          tags: r.tagName ? [r.tagName] : [],
        });
      } else if (r.tagName) {
        const item = map.get(key)!;
        if (!item.tags.includes(r.tagName)) item.tags.push(r.tagName);
      }
    }

    const itemsArr = Array.from(map.values());
    const hasNext = itemsArr.length > limit;
    const pageItems = itemsArr.slice(0, limit);

    return NextResponse.json({
      page,
      limit,
      hasNext,
      items: pageItems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdAt: p.createdAt,
        authorName: p.authorName,
        categoryName: p.categoryName,
        tags: p.tags,
      })),
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
