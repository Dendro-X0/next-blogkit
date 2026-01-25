import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PostCardSkeleton() {
    return (
        <Card className="flex flex-col h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-xs">
            <CardHeader className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16 px-2" />
                    <Skeleton className="h-5 w-20 px-2" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-5 w-24 ml-auto" />
                </div>
            </CardContent>
        </Card>
    );
}

export function BlogListSkeleton() {
    return (
        <div className="grid gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function PostDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        </div>
    );
}
