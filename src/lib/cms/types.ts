export type CmsProvider = "native" | "wordpress" | "sanity";

export type CmsPostBodyFormat = "mdx" | "markdown" | "html";

export type CmsPostStatus = "draft" | "published" | "scheduled";

export type CmsAuthor = {
  id: string;
  name: string | null;
};

export type CmsTaxonomy = {
  id: string;
  name: string;
  slug?: string | null;
};

export type CmsPostBody = {
  format: CmsPostBodyFormat;
  value: string;
};

export type CmsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: CmsPostBody;
  status: CmsPostStatus;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  author: CmsAuthor | null;
  tags: CmsTaxonomy[];
  category: CmsTaxonomy | null;
  heroImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  allowComments: boolean;
  format: "standard" | "video" | "gallery" | "audio";
  videoUrl: string | null;
  audioUrl: string | null;
  galleryImages: string[] | null;
};

export type CmsPostListItem = Pick<
  CmsPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "status"
  | "author"
  | "tags"
  | "category"
>;

export type CmsListPostsParams = {
  page: number;
  limit: number;
  includeDrafts?: boolean;
};

export type CmsListPostsResult = {
  items: CmsPostListItem[];
  hasNext: boolean;
  page: number;
  limit: number;
};

export type CmsSearchParams = {
  q?: string;
  tags?: string[];
  categories?: string[];
  authors?: string[];
  sort?: "newest" | "oldest" | "title";
  page: number;
  limit: number;
};

export type CmsSearchResultItem = Pick<
  CmsPostListItem,
  "id" | "title" | "slug" | "excerpt" | "createdAt" | "author" | "category" | "tags"
>;

export type CmsSearchResult = {
  page: number;
  limit: number;
  hasNext: boolean;
  items: CmsSearchResultItem[];
};

export type CmsSitemapEntry = {
  slug: string;
  lastModified: Date;
};

export type CmsRssEntry = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: Date;
};

export type CmsCreatePostInput = {
  authorId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: CmsPostBody;
  status: CmsPostStatus;
  categoryId: string | null;
  tagNames: string[];
  heroImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  allowComments: boolean;
  format: "standard" | "video" | "gallery" | "audio";
  videoUrl: string | null;
  audioUrl: string | null;
  galleryImages: string[] | null;
};

export type CmsUpdatePostInput = Partial<Omit<CmsCreatePostInput, "slug">> & {
  slug?: string;
};

export type CmsPostDetail = CmsPost;
