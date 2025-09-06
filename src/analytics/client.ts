/**
 * Thin client for first-party analytics events.
 * Uses sendBeacon when available, falls back to fetch with keepalive.
 */
"use client";

import type { IdentifyOptions, PageViewOptions, TrackOptions } from "./types";

const endpoint = "/api/analytics";

function send(data: Record<string, unknown>): void {
  const body = JSON.stringify(data);
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function trackEvent(options: TrackOptions): void {
  send({
    name: options.name,
    path: options.path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    referrer: options.referrer ?? (typeof document !== "undefined" ? document.referrer : ""),
    userId: options.userId,
    sessionId: options.sessionId,
    properties: options.properties,
  });
}

export function pageView(options: PageViewOptions): void {
  send({
    name: "page_view",
    path: options.path,
    referrer: options.referrer ?? (typeof document !== "undefined" ? document.referrer : ""),
    userId: options.userId,
    sessionId: options.sessionId,
  });
}

export function identify(options: IdentifyOptions): void {
  // Placeholder for future identity correlation; intentionally no-op for now.
  void options;
}
