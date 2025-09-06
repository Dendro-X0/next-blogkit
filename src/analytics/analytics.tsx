import { websiteConfig } from "@/config/website";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function Analytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      {websiteConfig.analytics.enableVercelAnalytics && <VercelAnalytics />}
      {websiteConfig.analytics.enableSpeedInsights && <SpeedInsights />}
    </>
  );
}
