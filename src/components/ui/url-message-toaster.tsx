"use client";

import { useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Reads `message` or `error` from the URL and displays a toast once.
 */
export function UrlMessageToaster(): ReactElement | null {
  const shownRef = useRef<boolean>(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (shownRef.current) return;
    const message: string | null = searchParams.get("message");
    const error: string | null = searchParams.get("error");
    if (message) {
      toast.success("Success", { description: message });
      shownRef.current = true;
    } else if (error) {
      toast.error("Error", { description: error });
      shownRef.current = true;
    }
  }, [searchParams]);
  return null;
}
