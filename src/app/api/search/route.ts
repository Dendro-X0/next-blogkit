import { NextResponse } from "next/server";
import { getCmsAdapter } from "@/lib/cms";

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

    const tagsList = tagsRaw
      ? tagsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const categoriesList = categoriesRaw
      ? categoriesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const authorsList = authorsRaw
      ? authorsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const cms = getCmsAdapter();
    const result = await cms.searchPosts({
      q: qRaw || undefined,
      tags: tagsList,
      categories: categoriesList,
      authors: authorsList,
      sort: (sort === "oldest" || sort === "title" || sort === "newest" ? (sort as "newest" | "oldest" | "title") : "newest"),
      page,
      limit,
    });

    return NextResponse.json({
      page: result.page,
      limit: result.limit,
      hasNext: result.hasNext,
      items: result.items.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdAt: p.createdAt,
        authorName: p.author?.name ?? null,
        categoryName: p.category?.name ?? null,
        tags: p.tags.map((t) => t.name),
      })),
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
