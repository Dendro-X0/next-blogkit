import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FilterSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SearchResultSkeleton() {
    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}

export function SearchSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-48 mx-auto" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64">
                        <FilterSkeleton />
                    </aside>
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-5 w-32" />
                        </div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SearchResultSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
