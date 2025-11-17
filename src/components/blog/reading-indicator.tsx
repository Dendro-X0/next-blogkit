"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";

type Heading = Readonly<{
  id: string;
  text: string;
  level: number;
}>;

export type ReadingIndicatorProps = Readonly<{
  /** The id of the container that holds the rendered post content */
  targetId: string;
  /** CSS selector used to collect headings inside the target container */
  headingsSelector?: string;
  /** Offset in pixels to account for sticky headers when scrolling to a section */
  scrollOffset?: number;
}>;

/**
 * ReadingIndicator renders:
 * - A thin progress bar at the top of the viewport that reflects scroll progress of the post body
 * - A small, accessible table of contents (ToC) that can be used to jump between sections
 *
 * It works with plain HTML content (e.g., MDX output). If headings don't have ids, we generate stable ids from the text.
 */
export function ReadingIndicator({
  targetId,
  headingsSelector = "h2, h3",
  scrollOffset = 80,
}: ReadingIndicatorProps): ReactElement | null {
  const [progress, setProgress] = useState<number>(0);
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate slug from text if no id exists
  const toSlug = (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  useEffect(() => {
    const container = document.getElementById(targetId);
    if (!container) return;

    // Collect headings
    const nodes = Array.from(container.querySelectorAll(headingsSelector)) as HTMLElement[];
    const collected: Heading[] = nodes.map((el) => {
      if (!el.id) {
        const slug = toSlug(el.textContent || "section");
        // Ensure uniqueness per page
        let candidate = slug || "section";
        let i = 1;
        while (document.getElementById(candidate)) {
          candidate = `${slug}-${i++}`;
        }
        el.id = candidate;
      }
      const level = Number(el.tagName.replace("H", ""));
      return {
        id: el.id,
        text: el.textContent || "Section",
        level: Number.isNaN(level) ? 2 : level,
      };
    });
    setHeadings(collected);

    // Progress listener
    const onScroll = (): void => {
      const total = Math.max(1, container.scrollHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, window.scrollY - (container.offsetTop || 0)));
      const pct = Math.round((scrolled / total) * 100);
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active section tracking
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the most visible heading near the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] },
    );
    for (const n of nodes) {
      observerRef.current?.observe(n);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, [targetId, headingsSelector]);

  const items = useMemo(() => headings, [headings]);

  const handleJump = (id: string): void => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (items.length === 0) {
    return (
      <div
        className="fixed left-0 top-0 z-40 h-0.5 bg-primary transition-[width]"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Reading progress"
      />
    );
  }

  return (
    <>
      {/* Progress bar */}
      <div
        className="fixed left-0 top-0 z-40 h-0.5 bg-primary transition-[width]"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Reading progress"
      />

      {/* Mobile collapsible ToC */}
      <details className="md:hidden mb-6 rounded-md border bg-card/50 p-4">
        <summary className="cursor-pointer select-none text-sm font-medium">On this page</summary>
        <nav className="mt-3 space-y-2" aria-label="On this page">
          {items.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => handleJump(h.id)}
              className={`block w-full text-left text-sm hover:text-primary focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xs px-1 ${
                activeId === h.id ? "text-primary" : "text-muted-foreground"
              }`}
              aria-current={activeId === h.id ? "true" : undefined}
            >
              {" ".repeat(Math.max(0, h.level - 2))}
              {h.text}
            </button>
          ))}
        </nav>
      </details>

      {/* Desktop right rail ToC */}
      <aside className="hidden md:block sticky top-24 float-right ml-8 w-56 shrink-0">
        <nav aria-label="On this page" className="rounded-md border bg-card/50 p-3 text-sm">
          <div className="mb-2 font-semibold text-foreground">On this page</div>
          <ul className="space-y-1">
            {items.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-3" : undefined}>
                <button
                  type="button"
                  onClick={() => handleJump(h.id)}
                  className={`w-full text-left hover:text-primary focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xs px-1 ${
                    activeId === h.id ? "text-primary" : "text-muted-foreground"
                  }`}
                  aria-current={activeId === h.id ? "true" : undefined}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
