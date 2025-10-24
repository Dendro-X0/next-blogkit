import { websiteConfig } from "@/config/website";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function Analytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  // Avoid 404 console noise during Lighthouse runs (local or CI) by skipping
  // Vercel script injection when ?lhci=1 is present.
  if (typeof window !== "undefined" && window.location.search.includes("lhci=1")) {
    return null;
  }

  return (
    <>
      {websiteConfig.analytics.enableVercelAnalytics && <VercelAnalytics />}
      {websiteConfig.analytics.enableSpeedInsights && <SpeedInsights />}
    </>
  );
}
