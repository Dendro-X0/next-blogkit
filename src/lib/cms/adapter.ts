import "server-only";

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
} from "./types";

export type CmsAdapterCapabilities = {
  supportsDrafts: boolean;
  supportsTaxonomies: boolean;
  supportsMediaUpload: boolean;
};

export interface CmsAdapter {
  readonly provider: string;
  readonly capabilities: CmsAdapterCapabilities;

  listPosts(params: CmsListPostsParams): Promise<CmsListPostsResult>;
  getPostBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null>;
  getPostById(id: string, opts?: { includeDrafts?: boolean }): Promise<CmsPost | null>;

  searchPosts(params: CmsSearchParams): Promise<CmsSearchResult>;

  listCategories(): Promise<CmsTaxonomy[]>;
  listTags(): Promise<CmsTaxonomy[]>;

  getSitemapEntries(): Promise<CmsSitemapEntry[]>;
  getRssEntries(): Promise<CmsRssEntry[]>;

  createPost(input: CmsCreatePostInput): Promise<CmsPost>;
  updatePost(id: string, patch: CmsUpdatePostInput): Promise<CmsPost>;
  deletePost(id: string): Promise<void>;
}
