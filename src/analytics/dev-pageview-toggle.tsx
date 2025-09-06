"use client";

import { AutoPageview } from "@/analytics/auto-pageview";
import { type ReactElement, useEffect, useState } from "react";

const STORAGE_KEY = "dev_auto_pageview" as const;

/**
 * DevPageviewToggle renders a small floating toggle in development
 * to enable/disable automatic pageview tracking via AutoPageview.
 */
export function DevPageviewToggle(): ReactElement {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    setEnabled(stored === "1");
  }, []);

  const onToggle = (): void => {
    const next = !enabled;
    setEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
  };

  return (
    <>
      {enabled && <AutoPageview />}
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 rounded-full border bg-background/80 px-3 py-1 text-xs shadow backdrop-blur hover:bg-background"
        aria-pressed={enabled}
        aria-label="Toggle dev auto pageview"
        title="Toggle dev auto pageview"
      >
        Dev Pageviews: {enabled ? "On" : "Off"}
      </button>
    </>
  );
}
