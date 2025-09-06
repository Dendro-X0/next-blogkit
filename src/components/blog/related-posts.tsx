import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
}

// Mock related posts
const mockRelatedPosts: RelatedPost[] = [
  {
    id: "2",
    title: "Building Scalable React Applications",
    excerpt:
      "Best practices for structuring and scaling React applications for enterprise-level development.",
    slug: "scalable-react-applications",
    publishedAt: "2024-01-12",
    readTime: "8 min read",
    tags: ["React", "Architecture"],
  },
  {
    id: "3",
    title: "TypeScript Tips and Tricks",
    excerpt:
      "Advanced TypeScript techniques to improve your code quality and developer experience.",
    slug: "typescript-tips-tricks",
    publishedAt: "2024-01-10",
    readTime: "6 min read",
    tags: ["TypeScript", "Development"],
  },
];

interface RelatedPostsProps {
  currentPostId: string;
  tags: string[];
}

export function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  // In a real app, you'd filter posts based on similar tags and exclude current post
  const relatedPosts = mockRelatedPosts.filter((post) => post.id !== currentPostId);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground">Related Posts</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
