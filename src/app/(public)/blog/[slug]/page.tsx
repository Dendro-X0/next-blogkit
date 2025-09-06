import { CommentSection } from "@/components/blog/comment-section";
import { Reactions } from "@/components/blog/reactions";
import { RelatedPosts } from "@/components/blog/related-posts";
import { SocialShare } from "@/components/blog/social-share";
import { Callout } from "@/components/mdx/callout";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import type { BlogPosting, WithContext } from "schema-dts";
import { env } from "~/env";
import { PostHeaderActions } from "../_components/post-header-actions";

// Define the shape of the detailed post data from our API
interface Review {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  author: {
    name: string | null;
  };
}

interface ApiPostDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: { name: string | null };
  tags: string[];
  reviews: Review[];
  format: "standard" | "video" | "gallery" | "audio";
  videoUrl?: string | null;
  audioUrl?: string | null;
  galleryImages?: string[] | null;
}

async function getPost(slug: string): Promise<ApiPostDetail | null> {
  try {
    const row = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      columns: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        format: true,
        videoUrl: true,
        audioUrl: true,
        galleryImages: true,
      },
      with: {
        author: { columns: { name: true } },
        postsToTags: { with: { tag: { columns: { name: true } } } },
      },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      author: { name: row.author?.name ?? null },
      tags: row.postsToTags.map((pt) => pt.tag.name),
      reviews: [],
      format: row.format,
      videoUrl: row.videoUrl ?? null,
      audioUrl: row.audioUrl ?? null,
      galleryImages: row.galleryImages ?? null,
    };
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: { params: Promise<{ slug: string }> }): Promise<ReactElement> {
  const post = await getPost((await params).slug);

  if (!post) {
    notFound();
  }

  const postForHeader = {
    title: post.title,
    author: post.author.name || "Unknown Author",
    publishedAt: post.createdAt,
    readTime: "5 min read", // Placeholder
    tags: post.tags,
  };

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.content.substring(0, 150),
    datePublished: post.createdAt,
    dateModified: post.createdAt, // Assuming no separate update date for now
    author: {
      "@type": "Person",
      name: post.author.name || "Unknown Author",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${env.NEXT_PUBLIC_APP_URL}/blog/${(await params).slug}`,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="max-w-4xl mx-auto" aria-labelledby="post-title">
        <h1 id="post-title" className="sr-only">
          {post.title}
        </h1>
        <PostHeaderActions post={postForHeader} postId={post.id} />

        <div className="mb-4">
          <Reactions postId={post.id} />
        </div>

        <Separator className="mb-8" />

        <div className="prose prose-slate max-w-none mb-12">
          {post.format === "standard" && (
            <MDXRemote source={post.content} components={{ Callout }} />
          )}

          {post.format === "audio" && post.audioUrl && (
            <div className="w-full">
              <audio controls className="w-full" aria-label={`Audio for ${post.title}`}>
                <source src={post.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {post.format === "video" && post.videoUrl && (
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={post.videoUrl.replace("watch?v=", "embed/")} // Basic YouTube URL conversion
                title={`Video: ${post.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {post.format === "gallery" && post.galleryImages && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {post.galleryImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <SocialShare title={post.title} url={`/blog/${(await params).slug}`} />
        </div>

        <Separator className="mb-8" />

        <CommentSection postId={post.id} />

        <div className="mt-16">
          <RelatedPosts currentPostId={post.id.toString()} tags={post.tags} />
        </div>
      </article>
    </div>
  );
}
