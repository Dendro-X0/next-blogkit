"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Filter, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactElement, useEffect, useMemo, useState } from "react";

// Types
type Post = {
  readonly id: string;
  readonly title: string;
  readonly excerpt: string;
  readonly author: string;
  readonly publishedAt: string;
  readonly readTime: string;
  readonly tags: readonly string[];
  readonly slug: string;
  readonly category: string;
};

type SortBy = "newest" | "oldest" | "title";

// API response item for /api/posts
type ApiPostItem = {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly published: boolean;
  readonly authorName: string;
  readonly categoryName: string;
  readonly tags: string[];
};

const DEFAULT_READ_TIME = "5 min read" as const;

function mapApiPost(item: ApiPostItem): Post {
  return {
    id: String(item.id),
    title: item.title,
    excerpt: item.excerpt ?? "No excerpt available.",
    author: item.authorName ?? "Unknown",
    publishedAt: item.createdAt,
    readTime: DEFAULT_READ_TIME,
    tags: [...item.tags],
    slug: item.slug,
    category: item.categoryName ?? "Uncategorized",
  };
}

export default function SearchPage(): ReactElement {
  const router = useRouter();
  const sp = useSearchParams();
  const page: number = Math.max(1, Number(sp.get("page") ?? 1));
  const LIMIT = 10;
  const FETCH_LIMIT = LIMIT + 1; // fetch one extra to know if next exists
  const [inputQuery, setInputQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);

  // Debounce the search input to reduce re-renders while typing
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(inputQuery);
    }, 150);
    return () => clearTimeout(t);
  }, [inputQuery]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/posts?limit=${FETCH_LIMIT}&page=${page}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const items: ApiPostItem[] = await res.json();
        setHasNext(items.length > LIMIT);
        const pageItems = items.slice(0, LIMIT);
        setPostsData(pageItems.map(mapApiPost));
      } catch (err) {
        console.error("Error loading posts for search:", err);
      }
    };
    void load();
  }, [page, FETCH_LIMIT, LIMIT]);

  const allTags: string[] = useMemo<string[]>(
    () => Array.from(new Set(postsData.flatMap((post) => post.tags))),
    [postsData],
  );
  const allCategories: string[] = useMemo<string[]>(
    () => Array.from(new Set(postsData.map((post) => post.category))),
    [postsData],
  );
  const allAuthors: string[] = useMemo<string[]>(
    () => Array.from(new Set(postsData.map((post) => post.author))),
    [postsData],
  );

  const filteredPosts: Post[] = useMemo<Post[]>(() => {
    let filtered = postsData;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)));
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) => selectedCategories.includes(post.category));
    }

    // Authors filter
    if (selectedAuthors.length > 0) {
      filtered = filtered.filter((post) => selectedAuthors.includes(post.author));
    }

    // Sort
    if (sortBy === "newest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } else if (sortBy === "oldest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    } else if (sortBy === "title") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [postsData, searchQuery, selectedTags, selectedCategories, selectedAuthors, sortBy]);

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setSelectedAuthors([]);
  };

  const hasActiveFilters: boolean =
    Boolean(searchQuery) ||
    selectedTags.length > 0 ||
    selectedCategories.length > 0 ||
    selectedAuthors.length > 0;

  return (
    <main className="container mx-auto px-4 py-8" aria-labelledby="search-title">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 id="search-title" className="text-4xl font-semibold text-foreground mb-4">
            Search Posts
          </h1>
          <p className="text-xl text-muted-foreground">
            Can&apos;t find what you&apos;re looking for?
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search posts, tags, or topics..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
            name="q"
            autoComplete="search"
            aria-label="Search posts"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6" aria-labelledby="filters-heading">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg" id="filters-heading">
                Filters
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                  aria-expanded={showFilters}
                  aria-controls="filters-panel"
                  aria-label="Toggle filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    aria-label="Clear all filters"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <section
              id="filters-panel"
              className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
              aria-labelledby="filters-heading"
            >
              {/* Sort */}
              <div>
                <span id="sort-by-label" className="text-sm font-medium mb-2 block">
                  Sort By
                </span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                  <SelectTrigger aria-labelledby="sort-by-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-2">Categories</legend>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== category));
                          }
                        }}
                      />
                      <label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Authors */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-2">Authors</legend>
                <div className="space-y-2">
                  {allAuthors.map((author) => (
                    <div key={author} className="flex items-center space-x-2">
                      <Checkbox
                        id={`author-${author}`}
                        checked={selectedAuthors.includes(author)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAuthors([...selectedAuthors, author]);
                          } else {
                            setSelectedAuthors(selectedAuthors.filter((a) => a !== author));
                          }
                        }}
                      />
                      <label htmlFor={`author-${author}`} className="text-sm">
                        {author}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Tags */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-2">Tags</legend>
                <div className="space-y-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          }
                        }}
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </section>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground" aria-live="polite">
                {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="text-base">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  {hasActiveFilters && <Button onClick={clearAllFilters}>Clear all filters</Button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <nav className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <Button variant="outline" onClick={() => router.push(`/search?page=${page - 1}`)}>
              Previous
            </Button>
          ) : (
            <span />
          )}
          {hasNext && (
            <Button variant="outline" onClick={() => router.push(`/search?page=${page + 1}`)}>
              Next
            </Button>
          )}
        </nav>
      </div>
    </main>
  );
}
