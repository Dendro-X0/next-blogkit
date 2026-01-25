
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
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type ReactElement } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminComment {
    id: number;
    content: string;
    authorName: string;
    authorEmail: string;
    postTitle: string;
    postSlug: string;
    createdAt: string;
}

interface CommentsTableProps {
    comments: AdminComment[];
}

export function CommentsTable({ comments: initialComments }: CommentsTableProps) {
    const [data, setData] = useState(initialComments);
    const router = useRouter();

    async function onDeleteComment(id: number) {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`/api/admin/comments/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete comment");

            setData((prev) => prev.filter((c) => c.id !== id));
            toast.success("Comment deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete comment");
            console.error(error);
        }
    }

    const columns: ColumnDef<AdminComment>[] = [
        {
            accessorKey: "content",
            header: "Comment",
            cell: ({ row }: CellContext<AdminComment, unknown>): ReactElement => (
                <div className="max-w-[400px] truncate" title={row.original.content}>
                    {row.original.content}
                </div>
            ),
        },
        {
            accessorKey: "authorName",
            header: "Author",
            cell: ({ row }: CellContext<AdminComment, unknown>): ReactElement => (
                <div>
                    <div className="font-medium">{row.original.authorName}</div>
                    <div className="text-xs text-muted-foreground">{row.original.authorEmail}</div>
                </div>
            ),
        },
        {
            accessorKey: "postTitle",
            header: "Post",
            cell: ({ row }: CellContext<AdminComment, unknown>): ReactElement => (
                <div className="max-w-[200px] truncate">
                    <Link href={`/blog/${row.original.postSlug}`} className="hover:underline flex items-center gap-1">
                        {row.original.postTitle}
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }: CellContext<AdminComment, unknown>): ReactElement => (
                <span className="text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }: CellContext<AdminComment, unknown>): ReactElement => {
                const comment = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open actions</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/blog/${comment.postSlug}`}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Post
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteComment(comment.id)}>
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
            data={data}
            searchKey="content"
            searchPlaceholder="Search comments..."
        />
    );
}
