import "server-only";

import { createClient, type SanityClient } from "@sanity/client";
import type { CmsAdapter, CmsAdapterCapabilities } from "../adapter";
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
import { env } from "~/env";

type SanityPostRow = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  status?: string;
  _createdAt: string;
  _updatedAt: string;
  publishedAt?: string;
  category?: { _id: string; title?: string; slug?: string } | null;
  tags?: { _id: string; title?: string; slug?: string }[];
};

type SanityTermRow = {
  _id: string;
  title?: string;
  slug?: string;
};

function sanityClient(): SanityClient {
  if (!env.SANITY_PROJECT_ID) throw new Error("SANITY_PROJECT_ID is not set");
  if (!env.SANITY_DATASET) throw new Error("SANITY_DATASET is not set");
  if (!env.SANITY_API_VERSION) throw new Error("SANITY_API_VERSION is not set");

  return createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: env.SANITY_API_VERSION,
    token: env.SANITY_TOKEN,
    useCdn: env.SANITY_USE_CDN,
  });
}

function mapStatus(s: string | undefined): "draft" | "published" | "scheduled" {
  if (s === "published") return "published";
  if (s === "scheduled") return "scheduled";
  return "draft";
}

function toPost(row: SanityPostRow): CmsPost {
  const status = mapStatus(row.status);
  return {
    id: row._id,
    title: row.title ?? "",
    slug: row.slug ?? "",
    excerpt: row.excerpt ?? null,
    body: { format: "markdown", value: row.body ?? "" },
    status,
    createdAt: new Date(row._createdAt).toISOString(),
    updatedAt: row._updatedAt ? new Date(row._updatedAt).toISOString() : null,
    publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : status === "published" ? new Date(row._createdAt).toISOString() : null,
    author: null,
    tags: (row.tags ?? []).map((t) => ({ id: t._id, name: t.title ?? "", slug: t.slug ?? null })),
    category: row.category ? { id: row.category._id, name: row.category.title ?? "", slug: row.category.slug ?? null } : null,
    heroImageUrl: null,
    seoTitle: null,
    seoDescription: null,
    allowComments: true,
    format: "standard",
    videoUrl: null,
    audioUrl: null,
    galleryImages: null,
  };
}

export class SanityCmsAdapter implements CmsAdapter {
  readonly provider = "sanity";
  readonly capabilities: CmsAdapterCapabilities = {
    supportsDrafts: true,
    supportsTaxonomies: true,
    supportsMediaUpload: false,
  };

  private client = sanityClient();

  async listPosts(params: CmsListPostsParams): Promise<CmsListPostsResult> {
    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 50);
    const includeDrafts = !!params.includeDrafts;

    const start = (page - 1) * limit;
    const end = start + limit;

    const filter = includeDrafts ? "_type == 'post'" : "_type == 'post' && status == 'published'";

    const query = `*[$filter] | order(coalesce(publishedAt, _createdAt) desc) [$start...$end]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      status,
      _createdAt,
      _updatedAt,
      publishedAt,
      "category": category->{_id, title, "slug": slug.current},
      "tags": tags[]->{_id, title, "slug": slug.current}
    }`;

    const rows = await this.client.fetch<SanityPostRow[]>(query, { filter, start, end: end + 1 });
    const hasNext = rows.length > limit;
    const sliced = rows.slice(0, limit);

    return {
      page,
      limit,
      hasNext,
      items: sliced.map((r) => {
        const p = toPost(r);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          publishedAt: p.publishedAt,
          status: p.status,
          author: p.author,
          tags: p.tags,
          category: p.category,
        };
      }),
    };
  }

  async getPostBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;
    const filter = includeDrafts
      ? "_type == 'post' && slug.current == $slug"
      : "_type == 'post' && status == 'published' && slug.current == $slug";

    const query = `*[$filter][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      status,
      _createdAt,
      _updatedAt,
      publishedAt,
      "category": category->{_id, title, "slug": slug.current},
      "tags": tags[]->{_id, title, "slug": slug.current}
    }`;

    const row = await this.client.fetch<SanityPostRow | null>(query, { filter, slug });
    if (!row) return null;
    return toPost(row);
  }

  async getPostById(id: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;
    const filter = includeDrafts
      ? "_type == 'post' && _id == $id"
      : "_type == 'post' && status == 'published' && _id == $id";

    const query = `*[$filter][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      status,
      _createdAt,
      _updatedAt,
      publishedAt,
      "category": category->{_id, title, "slug": slug.current},
      "tags": tags[]->{_id, title, "slug": slug.current}
    }`;

    const row = await this.client.fetch<SanityPostRow | null>(query, { filter, id });
    if (!row) return null;
    return toPost(row);
  }

  async searchPosts(params: CmsSearchParams): Promise<CmsSearchResult> {
    const q = (params.q ?? "").trim();
    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 50);

    const start = (page - 1) * limit;
    const end = start + limit;

    const filter = q
      ? "_type == 'post' && status == 'published' && (title match $q || excerpt match $q)"
      : "_type == 'post' && status == 'published'";

    const query = `*[$filter] | order(coalesce(publishedAt, _createdAt) desc) [$start...$end]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      status,
      _createdAt,
      _updatedAt,
      publishedAt,
      "category": category->{_id, title, "slug": slug.current},
      "tags": tags[]->{_id, title, "slug": slug.current}
    }`;

    const rows = await this.client.fetch<SanityPostRow[]>(query, {
      filter,
      q: `${q}*`,
      start,
      end: end + 1,
    });

    const hasNext = rows.length > limit;
    const sliced = rows.slice(0, limit);

    return {
      page,
      limit,
      hasNext,
      items: sliced.map((r) => {
        const p = toPost(r);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          createdAt: p.createdAt,
          author: p.author,
          category: p.category,
          tags: p.tags,
          status: p.status,
          updatedAt: p.updatedAt,
          publishedAt: p.publishedAt,
        };
      }),
    };
  }

  async listCategories(): Promise<CmsTaxonomy[]> {
    const query = "*[_type == 'category'] | order(title asc){_id, title, \"slug\": slug.current}";
    const rows = await this.client.fetch<SanityTermRow[]>(query);
    return rows.map((r) => ({ id: r._id, name: r.title ?? "", slug: r.slug ?? null }));
  }

  async listTags(): Promise<CmsTaxonomy[]> {
    const query = "*[_type == 'tag'] | order(title asc){_id, title, \"slug\": slug.current}";
    const rows = await this.client.fetch<SanityTermRow[]>(query);
    return rows.map((r) => ({ id: r._id, name: r.title ?? "", slug: r.slug ?? null }));
  }

  async getSitemapEntries(): Promise<CmsSitemapEntry[]> {
    const query = "*[_type == 'post' && status == 'published']{\"slug\": slug.current, _updatedAt, _createdAt}";
    const rows = await this.client.fetch<{ slug: string; _updatedAt: string; _createdAt: string }[]>(query);
    return rows.map((r) => ({ slug: r.slug, lastModified: new Date(r._updatedAt ?? r._createdAt) }));
  }

  async getRssEntries(): Promise<CmsRssEntry[]> {
    const query = "*[_type == 'post' && status == 'published'] | order(coalesce(publishedAt, _createdAt) desc)[0...100]{_id, title, excerpt, body, \"slug\": slug.current, publishedAt, _createdAt}";
    const rows = await this.client.fetch<
      { _id: string; title?: string; excerpt?: string; body?: string; slug?: string; publishedAt?: string; _createdAt: string }[]
    >(query);

    return rows.map((r) => ({
      id: r._id,
      slug: r.slug ?? "",
      title: r.title ?? "",
      description: (r.excerpt ?? r.body ?? "").substring(0, 250),
      date: new Date(r.publishedAt ?? r._createdAt),
    }));
  }

  async createPost(input: CmsCreatePostInput): Promise<CmsPost> {
    if (!env.SANITY_TOKEN) throw new Error("SANITY_TOKEN is required for creating posts");

    const status = input.status;

    const doc = {
      _type: "post",
      title: input.title,
      slug: { _type: "slug", current: input.slug },
      excerpt: input.excerpt,
      body: input.body.value,
      status,
      publishedAt: status === "published" ? new Date().toISOString() : null,
    };

    const created = await this.client.create(doc);
    const hydrated = await this.client.fetch<SanityPostRow | null>(
      "*[_id == $id][0]{_id, title, \"slug\": slug.current, excerpt, body, status, _createdAt, _updatedAt, publishedAt}",
      { id: created._id },
    );

    if (!hydrated) throw new Error("Failed to load created Sanity post");
    return toPost(hydrated);
  }

  async updatePost(id: string, patch: CmsUpdatePostInput): Promise<CmsPost> {
    if (!env.SANITY_TOKEN) throw new Error("SANITY_TOKEN is required for updating posts");

    const set: Record<string, unknown> = {};
    if (patch.title !== undefined) set.title = patch.title;
    if (patch.slug !== undefined) set.slug = { _type: "slug", current: patch.slug };
    if (patch.excerpt !== undefined) set.excerpt = patch.excerpt;
    if (patch.body !== undefined) set.body = patch.body.value;
    if (patch.status !== undefined) {
      set.status = patch.status;
      set.publishedAt = patch.status === "published" ? new Date().toISOString() : null;
    }

    await this.client.patch(id).set(set).commit({ autoGenerateArrayKeys: true });

    const hydrated = await this.client.fetch<SanityPostRow | null>(
      "*[_id == $id][0]{_id, title, \"slug\": slug.current, excerpt, body, status, _createdAt, _updatedAt, publishedAt}",
      { id },
    );
    if (!hydrated) throw new Error("Post not found after update");
    return toPost(hydrated);
  }

  async deletePost(id: string): Promise<void> {
    if (!env.SANITY_TOKEN) throw new Error("SANITY_TOKEN is required for deleting posts");
    await this.client.delete(id);
  }
}
