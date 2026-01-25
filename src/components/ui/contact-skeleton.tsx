import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ContactSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-96 mx-auto" />
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="h-5 w-5 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
