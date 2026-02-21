import "server-only";

import { cache } from "@/lib/cache/cache";
import { db } from "@/lib/db";
import { categories, posts, postsToTags, tags, user } from "@/lib/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import type {
  CmsAdapter,
  CmsAdapterCapabilities,
} from "../adapter";
import type {
  CmsCreatePostInput,
  CmsListPostsParams,
  CmsListPostsResult,
  CmsPost,
  CmsRssEntry,
  CmsSearchParams,
  CmsSearchResult,
  CmsSitemapEntry,
  CmsTaxonomy,
  CmsUpdatePostInput,
} from "../types";

function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return new Date(String(v)).toISOString();
}

export class NativeCmsAdapter implements CmsAdapter {
  readonly provider = "native";
  readonly capabilities: CmsAdapterCapabilities = {
    supportsDrafts: true,
    supportsTaxonomies: true,
    supportsMediaUpload: false,
  };

  async listPosts(params: CmsListPostsParams): Promise<CmsListPostsResult> {
    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const includeDrafts = !!params.includeDrafts;
    const offset = (page - 1) * limit;

    const whereConditions = includeDrafts ? undefined : eq(posts.published, true);
    const cacheKey = `cms:native:posts:${includeDrafts ? "with-drafts" : "published"}:p=${page}:l=${limit}`;

    const rows = await cache(
      { key: cacheKey, ttl: 60 * 5 },
      () =>
        db.query.posts.findMany({
          where: whereConditions,
          columns: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true,
            updatedAt: true,
            published: true,
          },
          with: {
            author: { columns: { id: true, name: true } },
            category: { columns: { id: true, name: true } },
            postsToTags: { with: { tag: { columns: { id: true, name: true } } } },
          },
          orderBy: [desc(posts.createdAt)],
          limit: limit + 1,
          offset,
        }),
    );

    const hasNext = rows.length > limit;
    const sliced = rows.slice(0, limit);

    return {
      page,
      limit,
      hasNext,
      items: sliced.map((r) => ({
        id: r.id.toString(),
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt ?? null,
        createdAt: toIso(r.createdAt),
        updatedAt: r.updatedAt ? toIso(r.updatedAt) : null,
        publishedAt: r.published ? toIso(r.createdAt) : null,
        status: r.published ? "published" : "draft",
        author: r.author ? { id: r.author.id, name: r.author.name ?? null } : null,
        category: r.category ? { id: r.category.id.toString(), name: r.category.name } : null,
        tags: r.postsToTags.map((ptt) => ({ id: ptt.tag.id.toString(), name: ptt.tag.name })),
      })),
    };
  }

  async getPostBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;

    const row = await db.query.posts.findFirst({
      where: includeDrafts ? eq(posts.slug, slug) : and(eq(posts.slug, slug), eq(posts.published, true)),
      with: {
        author: { columns: { id: true, name: true } },
        category: { columns: { id: true, name: true } },
        postsToTags: { with: { tag: { columns: { id: true, name: true } } } },
      },
    });

    if (!row) return null;

    return {
      id: row.id.toString(),
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? null,
      body: { format: "mdx", value: row.content },
      status: row.published ? "published" : "draft",
      createdAt: toIso(row.createdAt),
      updatedAt: row.updatedAt ? toIso(row.updatedAt) : null,
      publishedAt: row.published ? toIso(row.createdAt) : null,
      author: row.author ? { id: row.author.id, name: row.author.name ?? null } : null,
      tags: row.postsToTags.map((ptt) => ({ id: ptt.tag.id.toString(), name: ptt.tag.name })),
      category: row.category ? { id: row.category.id.toString(), name: row.category.name } : null,
      heroImageUrl: row.imageUrl ?? null,
      seoTitle: row.seoTitle ?? null,
      seoDescription: row.seoDescription ?? null,
      allowComments: row.allowComments,
      format: row.format,
      videoUrl: row.videoUrl ?? null,
      audioUrl: row.audioUrl ?? null,
      galleryImages: row.galleryImages ?? null,
    };
  }

  async getPostById(id: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) return null;

    const row = await db.query.posts.findFirst({
      where: includeDrafts
        ? eq(posts.id, postId)
        : and(eq(posts.id, postId), eq(posts.published, true)),
      with: {
        author: { columns: { id: true, name: true } },
        category: { columns: { id: true, name: true } },
        postsToTags: { with: { tag: { columns: { id: true, name: true } } } },
      },
    });
    if (!row) return null;

    return {
      id: row.id.toString(),
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? null,
      body: { format: "mdx", value: row.content },
      status: row.published ? "published" : "draft",
      createdAt: toIso(row.createdAt),
      updatedAt: row.updatedAt ? toIso(row.updatedAt) : null,
      publishedAt: row.published ? toIso(row.createdAt) : null,
      author: row.author ? { id: row.author.id, name: row.author.name ?? null } : null,
      tags: row.postsToTags.map((ptt) => ({ id: ptt.tag.id.toString(), name: ptt.tag.name })),
      category: row.category ? { id: row.category.id.toString(), name: row.category.name } : null,
      heroImageUrl: row.imageUrl ?? null,
      seoTitle: row.seoTitle ?? null,
      seoDescription: row.seoDescription ?? null,
      allowComments: row.allowComments,
      format: row.format,
      videoUrl: row.videoUrl ?? null,
      audioUrl: row.audioUrl ?? null,
      galleryImages: row.galleryImages ?? null,
    };
  }

  async searchPosts(params: CmsSearchParams): Promise<CmsSearchResult> {
    const qRaw = (params.q ?? "").trim();
    const tagsList = params.tags ?? [];
    const categoriesList = params.categories ?? [];
    const authorsList = params.authors ?? [];
    const sort = (params.sort ?? "newest").toLowerCase() as "newest" | "oldest" | "title";

    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const offset = (page - 1) * limit;

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
      whereClauses.push(inArray(tags.name, tagsList));
    }

    const orderBy =
      sort === "oldest"
        ? asc(posts.createdAt)
        : sort === "title"
          ? asc(posts.title)
          : desc(posts.createdAt);

    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        createdAt: posts.createdAt,
        authorId: user.id,
        authorName: user.name,
        categoryId: categories.id,
        categoryName: categories.name,
        tagId: tags.id,
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

    const map = new Map<
      number,
      {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        createdAt: Date;
        author: { id: string; name: string | null } | null;
        category: { id: string; name: string } | null;
        tags: { id: string; name: string }[];
      }
    >();

    for (const r of rows) {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id: r.id,
          title: r.title,
          slug: r.slug,
          excerpt: r.excerpt ?? null,
          createdAt: r.createdAt,
          author: r.authorId ? { id: r.authorId, name: r.authorName ?? null } : null,
          category:
            r.categoryId && r.categoryName
              ? { id: r.categoryId.toString(), name: r.categoryName }
              : null,
          tags: [],
        });
      }
      if (r.tagId && r.tagName) {
        const item = map.get(r.id)!;
        const tagId = r.tagId.toString();
        if (!item.tags.some((t) => t.id === tagId)) item.tags.push({ id: tagId, name: r.tagName });
      }
    }

    const itemsArr = Array.from(map.values());
    const hasNext = itemsArr.length > limit;
    const pageItems = itemsArr.slice(0, limit);

    return {
      page,
      limit,
      hasNext,
      items: pageItems.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        createdAt: toIso(p.createdAt),
        author: p.author,
        category: p.category,
        tags: p.tags,
        status: "published",
        updatedAt: null,
        publishedAt: toIso(p.createdAt),
      })),
    };
  }

  async listCategories(): Promise<CmsTaxonomy[]> {
    const rows = await db.select().from(categories);
    return rows.map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  async listTags(): Promise<CmsTaxonomy[]> {
    const rows = await db.select().from(tags);
    return rows.map((t) => ({ id: t.id.toString(), name: t.name }));
  }

  async getSitemapEntries(): Promise<CmsSitemapEntry[]> {
    const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return rows
      .filter((p) => p.published)
      .map((p) => ({ slug: p.slug, lastModified: p.updatedAt ?? p.createdAt }));
  }

  async getRssEntries(): Promise<CmsRssEntry[]> {
    const rows = await db.select().from(posts).orderBy(posts.createdAt);
    return rows
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id.toString(),
        slug: p.slug,
        title: p.title,
        description: (p.content ?? "").substring(0, 250),
        date: p.createdAt,
      }));
  }

  async createPost(input: CmsCreatePostInput): Promise<CmsPost> {
    const published = input.status === "published";

    const created = await db.transaction(async (tx) => {
      const [createdPost] = await tx
        .insert(posts)
        .values({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.body.value,
          imageUrl: input.heroImageUrl,
          categoryId: input.categoryId ? Number.parseInt(input.categoryId, 10) : null,
          published,
          allowComments: input.allowComments,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          format: input.format,
          videoUrl: input.videoUrl,
          audioUrl: input.audioUrl,
          galleryImages: input.galleryImages,
          authorId: input.authorId,
        })
        .returning();

      if (input.tagNames.length > 0) {
        const existing = await tx.select().from(tags).where(inArray(tags.name, input.tagNames));
        const existingNames = new Set(existing.map((t) => t.name));
        const toCreate = input.tagNames.filter((n) => !existingNames.has(n));

        let newTags: { id: number; name: string }[] = [];
        if (toCreate.length > 0) {
          newTags = await tx
            .insert(tags)
            .values(toCreate.map((name) => ({ name })))
            .returning();
        }
        const all = [...existing, ...newTags];
        await tx.insert(postsToTags).values(all.map((t) => ({ postId: createdPost.id, tagId: t.id })));
      }

      return createdPost;
    });

    const hydrated = await this.getPostBySlug(created.slug, { includeDrafts: true });
    if (!hydrated) {
      throw new Error("Failed to load created post");
    }
    return hydrated;
  }

  async updatePost(id: string, patch: CmsUpdatePostInput): Promise<CmsPost> {
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) throw new Error("Invalid post id");

    await db.transaction(async (tx) => {
      const updateData: Partial<typeof posts.$inferInsert> = {};
      if (patch.title !== undefined) updateData.title = patch.title;
      if (patch.slug !== undefined) updateData.slug = patch.slug;
      if (patch.excerpt !== undefined) updateData.excerpt = patch.excerpt;
      if (patch.body !== undefined) updateData.content = patch.body.value;
      if (patch.heroImageUrl !== undefined) updateData.imageUrl = patch.heroImageUrl;
      if (patch.categoryId !== undefined) {
        updateData.categoryId = patch.categoryId ? Number.parseInt(patch.categoryId, 10) : null;
      }
      if (patch.seoTitle !== undefined) updateData.seoTitle = patch.seoTitle;
      if (patch.seoDescription !== undefined) updateData.seoDescription = patch.seoDescription;
      if (patch.allowComments !== undefined) updateData.allowComments = patch.allowComments;
      if (patch.status !== undefined) updateData.published = patch.status === "published";
      if (patch.format !== undefined) updateData.format = patch.format;
      if (patch.videoUrl !== undefined) updateData.videoUrl = patch.videoUrl;
      if (patch.audioUrl !== undefined) updateData.audioUrl = patch.audioUrl;
      if (patch.galleryImages !== undefined) updateData.galleryImages = patch.galleryImages;
      updateData.updatedAt = new Date();

      await tx.update(posts).set(updateData).where(eq(posts.id, postId));

      if (patch.tagNames !== undefined) {
        await tx.delete(postsToTags).where(eq(postsToTags.postId, postId));
        if (patch.tagNames.length > 0) {
          const clean = patch.tagNames.filter((t) => t.trim() !== "");
          const existing = await tx.query.tags.findMany({ where: inArray(tags.name, clean) });
          const existingNames = new Set(existing.map((t) => t.name));
          const toCreate = clean.filter((n) => !existingNames.has(n));
          let newIds: { id: number }[] = [];
          if (toCreate.length > 0) {
            newIds = await tx
              .insert(tags)
              .values(toCreate.map((name) => ({ name })))
              .returning({ id: tags.id });
          }
          const allIds = [...existing.map((t) => t.id), ...newIds.map((t) => t.id)];
          await tx.insert(postsToTags).values(allIds.map((tagId) => ({ postId, tagId })));
        }
      }
    });

    const row = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
    if (!row) throw new Error("Post not found after update");

    const hydrated = await this.getPostBySlug(row.slug, { includeDrafts: true });
    if (!hydrated) throw new Error("Failed to load updated post");
    return hydrated;
  }

  async deletePost(id: string): Promise<void> {
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) throw new Error("Invalid post id");
    await db.delete(posts).where(eq(posts.id, postId));
  }
}
