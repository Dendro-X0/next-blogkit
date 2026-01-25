import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuthSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 w-full">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
            </Card>
        </div>
    );
}
