import { auth } from "@/lib/auth/auth";
import { getCmsAdapter } from "@/lib/cms";
import { NextResponse } from "next/server";

type PostsApiListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  updatedAt: string | null;
  published: boolean;
  authorName: string;
  categoryName: string;
  commentsCount: number;
  tags: string[];
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cms = getCmsAdapter();
    const body = await request.json();
    const {
      title,
      content,
      slug,
      excerpt,
      imageUrl,
      categoryId,
      published,
      tags: tagNames,
      allowComments,
      seoTitle,
      seoDescription,
      format,
      videoUrl,
      audioUrl,
      galleryImages,
    } = body;

    if (!title || !content || !slug) {
      return NextResponse.json(
        { message: "Title, content, and slug are required" },
        { status: 400 },
      );
    }

    const status = published ? "published" : "draft";
    const bodyFormat = cms.provider === "wordpress" ? "html" : cms.provider === "sanity" ? "markdown" : "mdx";
    const newPost = await cms.createPost({
      authorId: session.user.id,
      title,
      slug,
      excerpt: excerpt ?? null,
      body: { format: bodyFormat, value: content },
      status,
      categoryId: categoryId ? String(categoryId) : null,
      tagNames: Array.isArray(tagNames) ? tagNames : [],
      heroImageUrl: imageUrl ?? null,
      seoTitle: seoTitle ?? null,
      seoDescription: seoDescription ?? null,
      allowComments: allowComments ?? true,
      format: format ?? "standard",
      videoUrl: videoUrl ?? null,
      audioUrl: audioUrl ?? null,
      galleryImages: galleryImages ?? null,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cms = getCmsAdapter();
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("include_drafts") === "true";
    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;
    const result = await cms.listPosts({ page, limit, includeDrafts });

    const responseData: PostsApiListItem[] = result.items.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      published: post.status === "published",
      authorName: post.author?.name ?? "Unknown",
      categoryName: post.category?.name ?? "Uncategorized",
      commentsCount: 0,
      tags: post.tags.map((t) => t.name),
    }));

    const res: NextResponse = NextResponse.json(responseData);
    if (includeDrafts) {
      // Admin views should never be cached by CDNs/browsers
      res.headers.set("Cache-Control", "private, no-store");
    } else {
      // Public list is safe to cache briefly at the edge
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    }
    return res;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
