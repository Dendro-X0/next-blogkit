import {
  getPageViewsLast7d,
  getTopPages,
  getTopReferrers,
  getTotalEvents,
} from "@/lib/analytics/queries";
import { type ReactElement, Suspense } from "react";

/**
 * Admin Analytics Dashboard
 * Simple KPIs and tables using server-side queries.
 */
export default async function AdminAnalyticsPage(): Promise<ReactElement> {
  const [total, series, topPages, topReferrers] = await Promise.all([
    getTotalEvents(),
    getPageViewsLast7d(),
    getTopPages(10),
    getTopReferrers(10),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Events</div>
          <div className="mt-2 text-2xl font-bold">{total.total.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Last 7 Days Page Views</div>
          <div className="mt-2 text-2xl font-bold">
            {series.reduce((acc, p) => acc + p.count, 0).toLocaleString()}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-medium">Top Pages</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Path</th>
                  <th className="px-3 py-2 text-right font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((row) => (
                  <tr key={row.path} className="border-t">
                    <td className="px-3 py-2">{row.path}</td>
                    <td className="px-3 py-2 text-right">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-medium">Top Referrers</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Referrer</th>
                  <th className="px-3 py-2 text-right font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((row) => (
                  <tr key={`${row.referrer}-${row.count}`} className="border-t">
                    <td className="px-3 py-2">{row.referrer || "Direct / None"}</td>
                    <td className="px-3 py-2 text-right">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Last 7 Days (Daily)</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-right font-medium">Page Views</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.date} className="border-t">
                  <td className="px-3 py-2">{p.date}</td>
                  <td className="px-3 py-2 text-right">{p.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Suspense />
    </div>
  );
}
