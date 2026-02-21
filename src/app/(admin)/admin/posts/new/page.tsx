"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { type PostData, PostEditor } from "../../_components/post-editor";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories.");
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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

      const response = await fetch("/api/posts", {
        method: "POST",
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
        throw new Error(`Create post failed (${response.status}).${details}${hint}`);
      }

      toast.success("Post created successfully!");
      router.push("/admin/posts");
      router.refresh(); // To reflect the new post in the list
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PageHeader title="Create New Post" description="Write and publish your blog post">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
          </PageHeader>

          {isFetchingCategories ? (
            <p>Loading editor...</p>
          ) : (
            <PostEditor
              onSave={handleSave}
              mode="create"
              isLoading={isLoading}
              categories={categories}
            />
          )}
        </div>
      </div>
    </Suspense>
  );
}
