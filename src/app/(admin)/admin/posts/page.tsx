"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PostsTable } from "../_components/posts-table";

interface PostForTable {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  author: string;
  publishedAt: string | null;
  comments: number;
  slug: string;
}

interface FetchedPost {
  id: number;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string | null;
  categoryName: string | null;
  slug: string;
  commentsCount: number;
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<PostForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/posts?include_drafts=true", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data: FetchedPost[] = await res.json();
        const transformedPosts = data.map(
          (post): PostForTable => ({
            id: post.id.toString(),
            title: post.title,
            status: post.published ? "published" : "draft",
            author: post.authorName || "Unknown",
            publishedAt: post.createdAt,
            comments: Number(post.commentsCount) || 0,
            slug: post.slug,
          }),
        );
        setPosts(transformedPosts);
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching posts.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        setPosts(posts.filter((post: PostForTable) => post.id !== postId));
        toast.success("Post deleted successfully!");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting the post.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Posts Management" description="Create, edit, and manage your blog posts">
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>All Posts ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading posts...</p>
            ) : (
              <PostsTable posts={posts} onDeletePost={handleDeletePost} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
