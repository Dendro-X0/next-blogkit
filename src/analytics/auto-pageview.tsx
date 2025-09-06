"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type ReactElement, useEffect } from "react";
import { pageView } from "./client";

/**
 * AutoPageview mounts a listener that sends a page_view event
 * whenever the route changes on the client.
 */
export function AutoPageview(): ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const path = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    pageView({ path });
  }, [pathname, searchParams]);

  return null;
}
