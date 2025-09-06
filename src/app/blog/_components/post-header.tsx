"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Calendar, Clock, Heart, User } from "lucide-react";

interface PostHeaderProps {
  readonly post: {
    readonly title: string;
    readonly author: string;
    readonly publishedAt: string;
    readonly readTime: string;
    readonly tags: string[];
  };
  readonly onLike?: () => void;
  readonly onBookmark?: () => void;
}

/**
 * Blog post header with tags, title, meta, and quick actions.
 * Uses semantic color tokens for accessibility in light/dark themes.
 */
export function PostHeader({ post, onLike, onBookmark }: PostHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <h1 className="text-4xl font-semibold text-foreground mb-6">{post.title}</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLike}>
            <Heart className="h-4 w-4 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" onClick={onBookmark}>
            <Bookmark className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </header>
  );
}
