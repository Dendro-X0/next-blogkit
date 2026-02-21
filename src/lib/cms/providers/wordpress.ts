import "server-only";

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

type WpRenderedField = { rendered?: string };

type WpPost = {
  id: number;
  slug: string;
  status: string;
  title?: WpRenderedField;
  excerpt?: WpRenderedField;
  content?: WpRenderedField;
  date_gmt?: string;
  modified_gmt?: string;
  author?: number;
  categories?: number[];
  tags?: number[];
};

type WpTerm = {
  id: number;
  name: string;
  slug: string;
};

function wpBaseUrl(): string {
  if (!env.WORDPRESS_URL) throw new Error("WORDPRESS_URL is not set");
  return env.WORDPRESS_URL.replace(/\/$/, "");
}

function wpApiBase(): string {
  return `${wpBaseUrl()}/wp-json/wp/v2`;
}

function authHeader(): string | undefined {
  if (!env.WORDPRESS_USERNAME || !env.WORDPRESS_APP_PASSWORD) return undefined;
  const token = Buffer.from(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APP_PASSWORD}`).toString("base64");
  return `Basic ${token}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toIsoOrNull(s: string | undefined): string | null {
  if (!s) return null;
  return new Date(s).toISOString();
}

export class WordPressCmsAdapter implements CmsAdapter {
  readonly provider = "wordpress";
  readonly capabilities: CmsAdapterCapabilities = {
    supportsDrafts: true,
    supportsTaxonomies: true,
    supportsMediaUpload: false,
  };

  private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    const auth = authHeader();
    if (auth) headers.set("Authorization", auth);

    const res = await fetch(`${wpApiBase()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`WordPress request failed (${res.status}) ${path}${text ? ` - ${text}` : ""}`);
    }

    return (await res.json()) as T;
  }

  private mapPost(post: WpPost, termMaps?: { categories?: Map<number, WpTerm>; tags?: Map<number, WpTerm> }): CmsPost {
    const status = post.status === "publish" ? "published" : post.status === "future" ? "scheduled" : "draft";

    const catId = post.categories?.[0];
    const categoryTerm = catId ? termMaps?.categories?.get(catId) : undefined;

    const tagTerms = (post.tags ?? [])
      .map((id) => termMaps?.tags?.get(id))
      .filter((t): t is WpTerm => !!t)
      .map((t) => ({ id: t.id.toString(), name: t.name, slug: t.slug }));

    return {
      id: post.id.toString(),
      title: post.title?.rendered ?? "",
      slug: post.slug,
      excerpt: post.excerpt?.rendered ? stripHtml(post.excerpt.rendered) : null,
      body: { format: "html", value: post.content?.rendered ?? "" },
      status,
      createdAt: new Date(post.date_gmt ?? new Date().toISOString()).toISOString(),
      updatedAt: toIsoOrNull(post.modified_gmt),
      publishedAt: status === "published" ? new Date(post.date_gmt ?? new Date().toISOString()).toISOString() : null,
      author: post.author ? { id: post.author.toString(), name: null } : null,
      tags: tagTerms,
      category: categoryTerm ? { id: categoryTerm.id.toString(), name: categoryTerm.name, slug: categoryTerm.slug } : null,
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

  private async getTermMap(kind: "categories" | "tags", ids: number[]): Promise<Map<number, WpTerm>> {
    if (ids.length === 0) return new Map();
    const unique = Array.from(new Set(ids));
    const chunks: number[][] = [];
    for (let i = 0; i < unique.length; i += 50) chunks.push(unique.slice(i, i + 50));

    const map = new Map<number, WpTerm>();
    for (const chunk of chunks) {
      const qs = chunk.map((id) => `include=${encodeURIComponent(String(id))}`).join("&");
      const terms = await this.requestJson<WpTerm[]>(`/${kind}?per_page=100&${qs}`);
      for (const t of terms) map.set(t.id, t);
    }
    return map;
  }

  async listPosts(params: CmsListPostsParams): Promise<CmsListPostsResult> {
    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 100);
    const includeDrafts = !!params.includeDrafts;

    const status = includeDrafts ? "any" : "publish";
    const posts = await this.requestJson<WpPost[]>(`/posts?per_page=${limit + 1}&page=${page}&status=${status}`);

    const hasNext = posts.length > limit;
    const sliced = posts.slice(0, limit);

    const catIds = sliced.flatMap((p) => p.categories ?? []);
    const tagIds = sliced.flatMap((p) => p.tags ?? []);
    const [catMap, tagMap] = await Promise.all([
      this.getTermMap("categories", catIds),
      this.getTermMap("tags", tagIds),
    ]);

    return {
      page,
      limit: Math.min(limit, 50),
      hasNext,
      items: sliced.map((p) => {
        const mapped = this.mapPost(p, { categories: catMap, tags: tagMap });
        return {
          id: mapped.id,
          title: mapped.title,
          slug: mapped.slug,
          excerpt: mapped.excerpt,
          createdAt: mapped.createdAt,
          updatedAt: mapped.updatedAt,
          publishedAt: mapped.publishedAt,
          status: mapped.status,
          author: mapped.author,
          tags: mapped.tags,
          category: mapped.category,
        };
      }),
    };
  }

  async getPostBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;
    const status = includeDrafts ? "any" : "publish";

    const items = await this.requestJson<WpPost[]>(`/posts?slug=${encodeURIComponent(slug)}&status=${status}`);
    const post = items[0];
    if (!post) return null;

    const [catMap, tagMap] = await Promise.all([
      this.getTermMap("categories", post.categories ?? []),
      this.getTermMap("tags", post.tags ?? []),
    ]);

    return this.mapPost(post, { categories: catMap, tags: tagMap });
  }

  async getPostById(id: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null> {
    const includeDrafts = !!opts?.includeDrafts;
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) return null;

    const status = includeDrafts ? "any" : "publish";
    const post = await this.requestJson<WpPost>(`/posts/${postId}?status=${status}`);

    const [catMap, tagMap] = await Promise.all([
      this.getTermMap("categories", post.categories ?? []),
      this.getTermMap("tags", post.tags ?? []),
    ]);

    return this.mapPost(post, { categories: catMap, tags: tagMap });
  }

  async searchPosts(params: CmsSearchParams): Promise<CmsSearchResult> {
    const q = (params.q ?? "").trim();
    const page = params.page;
    const limit = Math.min(Math.max(params.limit, 1), 100);

    const items = await this.requestJson<WpPost[]>(`/posts?per_page=${limit + 1}&page=${page}&search=${encodeURIComponent(q)}&status=publish`);

    const hasNext = items.length > limit;
    const sliced = items.slice(0, limit);

    const catIds = sliced.flatMap((p) => p.categories ?? []);
    const tagIds = sliced.flatMap((p) => p.tags ?? []);
    const [catMap, tagMap] = await Promise.all([
      this.getTermMap("categories", catIds),
      this.getTermMap("tags", tagIds),
    ]);

    return {
      page,
      limit: Math.min(limit, 50),
      hasNext,
      items: sliced.map((p) => {
        const mapped = this.mapPost(p, { categories: catMap, tags: tagMap });
        return {
          id: mapped.id,
          title: mapped.title,
          slug: mapped.slug,
          excerpt: mapped.excerpt,
          createdAt: mapped.createdAt,
          author: mapped.author,
          category: mapped.category,
          tags: mapped.tags,
          status: mapped.status,
          updatedAt: mapped.updatedAt,
          publishedAt: mapped.publishedAt,
        };
      }),
    };
  }

  async listCategories(): Promise<CmsTaxonomy[]> {
    const items = await this.requestJson<WpTerm[]>(`/categories?per_page=100`);
    return items.map((t) => ({ id: t.id.toString(), name: t.name, slug: t.slug }));
  }

  async listTags(): Promise<CmsTaxonomy[]> {
    const items = await this.requestJson<WpTerm[]>(`/tags?per_page=100`);
    return items.map((t) => ({ id: t.id.toString(), name: t.name, slug: t.slug }));
  }

  async getSitemapEntries(): Promise<CmsSitemapEntry[]> {
    const items = await this.requestJson<WpPost[]>(`/posts?per_page=100&status=publish&orderby=date&order=desc`);
    return items.map((p) => ({
      slug: p.slug,
      lastModified: new Date(p.modified_gmt ?? p.date_gmt ?? new Date().toISOString()),
    }));
  }

  async getRssEntries(): Promise<CmsRssEntry[]> {
    const items = await this.requestJson<WpPost[]>(`/posts?per_page=100&status=publish&orderby=date&order=desc`);
    return items.map((p) => ({
      id: p.id.toString(),
      slug: p.slug,
      title: p.title?.rendered ?? "",
      description: stripHtml(p.excerpt?.rendered ?? p.content?.rendered ?? "").substring(0, 250),
      date: new Date(p.date_gmt ?? new Date().toISOString()),
    }));
  }

  private async ensureCategoryId(categoryId: string | null): Promise<number[] | undefined> {
    if (!categoryId) return undefined;
    const parsed = Number.parseInt(categoryId, 10);
    if (!Number.isNaN(parsed)) return [parsed];
    return undefined;
  }

  private async ensureTagIds(tagNames: string[]): Promise<number[] | undefined> {
    if (!tagNames.length) return undefined;

    const existing = await this.requestJson<WpTerm[]>(`/tags?per_page=100&search=${encodeURIComponent(tagNames[0] ?? "")}`);
    const map = new Map(existing.map((t) => [t.name.toLowerCase(), t] as const));

    const ids: number[] = [];
    for (const name of tagNames) {
      const key = name.toLowerCase();
      const found = map.get(key);
      if (found) {
        ids.push(found.id);
      } else {
        const created = await this.requestJson<WpTerm>(`/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        ids.push(created.id);
      }
    }

    return ids;
  }

  async createPost(input: CmsCreatePostInput): Promise<CmsPost> {
    const status = input.status === "published" ? "publish" : input.status === "scheduled" ? "future" : "draft";

    const categories = await this.ensureCategoryId(input.categoryId);
    const tags = await this.ensureTagIds(input.tagNames);

    const created = await this.requestJson<WpPost>(`/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? "",
        content: input.body.value,
        status,
        categories,
        tags,
      }),
    });

    const hydrated = await this.getPostBySlug(created.slug, { includeDrafts: true });
    if (!hydrated) throw new Error("Failed to load created WordPress post");
    return hydrated;
  }

  async updatePost(id: string, patch: CmsUpdatePostInput): Promise<CmsPost> {
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) throw new Error("Invalid WordPress post id");

    const status =
      patch.status === undefined
        ? undefined
        : patch.status === "published"
          ? "publish"
          : patch.status === "scheduled"
            ? "future"
            : "draft";

    const categories = patch.categoryId === undefined ? undefined : await this.ensureCategoryId(patch.categoryId);
    const tags = patch.tagNames === undefined ? undefined : await this.ensureTagIds(patch.tagNames);

    const updated = await this.requestJson<WpPost>(`/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: patch.title,
        slug: patch.slug,
        excerpt: patch.excerpt ?? undefined,
        content: patch.body?.value,
        status,
        categories,
        tags,
      }),
    });

    const hydrated = await this.getPostBySlug(updated.slug, { includeDrafts: true });
    if (!hydrated) throw new Error("Failed to load updated WordPress post");
    return hydrated;
  }

  async deletePost(id: string): Promise<void> {
    const postId = Number.parseInt(id, 10);
    if (Number.isNaN(postId)) throw new Error("Invalid WordPress post id");
    await this.requestJson(`/posts/${postId}?force=true`, { method: "DELETE" });
  }
}
