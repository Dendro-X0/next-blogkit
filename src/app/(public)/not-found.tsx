import Link from "next/link";
import { Suspense } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";

export default function NotFound(): React.ReactElement {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <div className="flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold tracking-tighter text-muted-foreground">404</h1>
          <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Page Not Found
          </p>
          <p className="text-muted-foreground">
            The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </Suspense>
  );
}
