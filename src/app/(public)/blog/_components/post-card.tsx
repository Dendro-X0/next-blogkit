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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-xs">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors border-none font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
          <Link href={`/blog/${post.slug}`} className="block">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/90 leading-relaxed line-clamp-2">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="hidden xs:flex items-center gap-1.5 shrink-0">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{post.readTime}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="group/btn -mr-2">
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 font-semibold text-primary"
              aria-label={`Read more about ${post.title}`}
            >
              Read article
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
