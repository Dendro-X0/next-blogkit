"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { env } from "~/env";
import { type PostData, PostEditor } from "../../../_components/post-editor";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

// This should reflect the data structure returned by your GET /api/posts/[id] endpoint
interface FetchedPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  published: boolean;
  allowComments: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  category: { id: string; name: string } | null;
  tags: string[];
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [initialData, setInitialData] = useState<Partial<PostData> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingData(true);
      try {
        const [postRes, categoriesRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch("/api/categories"),
        ]);

        if (!postRes.ok) throw new Error("Failed to fetch post data");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

        const postData: FetchedPostData = await postRes.json();
        const categoriesData: Category[] = await categoriesRes.json();

        setCategories(categoriesData);
        setInitialData({
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          status: postData.published ? "published" : "draft",
          tags: postData.tags,
          category: postData.category?.id ?? "",
          excerpt: postData.excerpt ?? "",
          featuredImage: postData.imageUrl ?? "",
          allowComments: postData.allowComments,
          seoTitle: postData.seoTitle ?? "",
          seoDescription: postData.seoDescription ?? "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load post data.");
      } finally {
        setIsFetchingData(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId]);

  const handleSave = async (data: PostData, status: PostData["status"]) => {
    setIsLoading(true);
    try {
      const body = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        imageUrl: data.featuredImage, // This is now the S3 key
        categoryId: data.category ? data.category : null,
        published: status === "published",
        tags: data.tags,
        allowComments: data.allowComments,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let serverMessage = "";
        try {
          const contentType = response.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            const errorData: { message?: string; error?: string } = await response.json();
            serverMessage = errorData.message || errorData.error || "";
          } else {
            serverMessage = await response.text();
          }
        } catch {
          // ignore parse errors
        }
        const hint =
          response.status === 401 ? " You are not authenticated. Please sign in again." : "";
        const details = serverMessage ? ` - ${serverMessage}` : "";
        throw new Error(`Update post failed (${response.status}).${details}${hint}`);
      }

      toast.success("Post updated successfully!");
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          let serverMessage = "";
          try {
            const contentType = res.headers.get("content-type") ?? "";
            if (contentType.includes("application/json")) {
              const errorData: { message?: string; error?: string } = await res.json();
              serverMessage = errorData.message || errorData.error || "";
            } else {
              serverMessage = await res.text();
            }
          } catch {}
          const hint =
            res.status === 401 ? " You are not authenticated. Please sign in again." : "";
          const details = serverMessage ? ` - ${serverMessage}` : "";
          throw new Error(`Delete post failed (${res.status}).${details}${hint}`);
        }
        toast.success("Post deleted successfully!");
        router.push("/admin/posts");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting the post.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Edit Post" description="Update your blog post details">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Post
            </Button>
          </div>
        </PageHeader>

        {isFetchingData || !initialData ? (
          <p>Loading editor...</p>
        ) : (
          <PostEditor
            onSave={handleSave}
            mode="edit"
            isLoading={isLoading}
            categories={categories}
            initialData={initialData}
            s3PublicUrl={env.NEXT_PUBLIC_S3_PUBLIC_URL}
          />
        )}
      </div>
    </div>
  );
}
