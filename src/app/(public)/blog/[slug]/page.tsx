import { CommentSection } from "@/components/blog/comment-section";
import { Reactions } from "@/components/blog/reactions";
import { RelatedPosts } from "@/components/blog/related-posts";
import { SocialShare } from "@/components/blog/social-share";
import { Callout } from "@/components/mdx/callout";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { Suspense } from "react";
import type { BlogPosting, WithContext } from "schema-dts";
import { getAbsoluteUrl } from "@/lib/url";
import { PostHeaderActions } from "../_components/post-header-actions";
import { PostHeader } from "../_components/post-header";
import { ReadingIndicator } from "@/components/blog/reading-indicator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCmsAdapter } from "@/lib/cms";
import ReactMarkdown from "react-markdown";
import { renderSafeHtml } from "@/lib/cms/render";

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

function cmsProviderIsNative(postId: string): boolean {
  // Native-only features depend on numeric post IDs in the local DB.
  return /^\d+$/.test(postId);
}

async function getPost(slug: string) {
  try {
    const cms = getCmsAdapter();
    return await cms.getPostBySlug(slug, { includeDrafts: false });
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;

  try {
    const post = await getPost(slug);

    if (!post) {
      notFound();
    }

    const postForHeader = {
      title: post.title,
      author: post.author?.name || "Unknown Author",
      publishedAt: post.publishedAt ?? post.createdAt,
      readTime: (() => {
        const text = (post.body.value || "").replace(/<[^>]+>/g, " ");
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `${minutes} min read`;
      })(),
      tags: post.tags.map((t) => t.name),
    };

    const jsonLd: WithContext<BlogPosting> = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.body.value.substring(0, 150),
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
      author: {
        "@type": "Person",
        name: post.author?.name || "Unknown Author",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": getAbsoluteUrl(`/blog/${slug}`),
      },
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <ReadingIndicator targetId="post-content" headingsSelector="h2, h3" scrollOffset={88} />
        <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
        <article className="max-w-4xl mx-auto" aria-labelledby="post-title">
          <h1 id="post-title" className="sr-only">
            {post.title}
          </h1>
          {cmsProviderIsNative(post.id) ? (
            <PostHeaderActions post={postForHeader} postId={Number.parseInt(post.id, 10)} />
          ) : (
            <PostHeader post={postForHeader} />
          )}

          {cmsProviderIsNative(post.id) ? (
            <div className="mb-4">
              <Reactions postId={Number.parseInt(post.id, 10)} />
            </div>
          ) : null}

          <Separator className="mb-8" />

          <div className="prose mb-12" id="post-content">
            {post.format === "standard" && post.body.format === "mdx" ? (
              <MDXRemote source={post.body.value} components={{ Callout }} />
            ) : null}

            {post.format === "standard" && post.body.format === "markdown" ? (
              <ReactMarkdown>{post.body.value}</ReactMarkdown>
            ) : null}

            {post.format === "standard" && post.body.format === "html" ? (
              <div dangerouslySetInnerHTML={renderSafeHtml(post.body.value)} />
            ) : null}

            {post.format === "audio" && post.audioUrl && (
              <div className="w-full">
                <audio controls className="w-full" aria-label={`Audio for ${post.title}`}>
                  <source src={post.audioUrl} type="audio/mpeg" />
                  <track kind="captions" src="/captions/empty.vtt" srcLang="en" label="Captions" default />
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
                  <div key={imageUrl} className="relative aspect-square">
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
            <SocialShare title={post.title} url={`/blog/${slug}`} />
          </div>

          <Separator className="mb-8" />

          <Suspense
            fallback={
              <div className="my-8 flex items-center gap-2 text-muted-foreground">
                <Spinner size={18} /> Loading comments…
              </div>
            }
          >
            {cmsProviderIsNative(post.id) ? (
              <CommentSection postId={Number.parseInt(post.id, 10)} />
            ) : null}
          </Suspense>

          <div className="mt-16">
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  <Spinner size={18} className="mr-2 inline" /> Loading related posts…
                </div>
              }
            >
              {cmsProviderIsNative(post.id) ? (
                <RelatedPosts
                  currentPostId={post.id.toString()}
                  tags={post.tags.map((t) => t.name)}
                />
              ) : null}
            </Suspense>
          </div>
        </article>
      </div>
    );
  } catch (error) {
    console.error(`[BlogPostPage] Critical error rendering post ${slug}:`, error);
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Post rendering error</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an issue while loading this blog post.
        </p>
        <Button asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }
}
