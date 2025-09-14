import { Spinner } from "@/components/ui/spinner";
import type { ReactElement } from "react";

export default function Loading(): ReactElement {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/50 p-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Spinner size={20} />
        <span>Loading...</span>
      </div>
    </div>
  );
}
