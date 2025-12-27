"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

interface Post {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  author: string;
  publishedAt: string | null;
  comments: number;
  slug: string;
}

interface PostsTableProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
}

export function PostsTable({ posts, onDeletePost }: PostsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: CellContext<Post, unknown>): ReactElement => (
        <div>
          <div className="font-medium">{row.getValue("title")}</div>
          <div className="text-sm text-muted-foreground">/{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: CellContext<Post, unknown>): ReactElement => (
        <Badge variant={getStatusColor(row.getValue("status"))}>{row.getValue("status")}</Badge>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      cell: ({ row }: CellContext<Post, unknown>): ReactElement => {
        const date = row.getValue("publishedAt") as string | null;
        return <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>;
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
    },
    {
      id: "actions",
      cell: ({ row }: CellContext<Post, unknown>): ReactElement => {
        const post = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Open actions for post ${post.title}`} aria-haspopup="menu">
                <span className="sr-only">Open actions for post {post.title}</span>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/blog/${post.slug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDeletePost(post.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={posts}
      searchKey="title"
      searchPlaceholder="Search posts..."
    />
  );
}
