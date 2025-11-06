import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    readTime: string;
    tags: string[];
    slug: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-2xl hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="text-base">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" aria-hidden="true" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readTime}
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 whitespace-nowrap"
              aria-label={`Read more about ${post.title}`}
            >
              Read more
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{`about ${post.title}`}</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
