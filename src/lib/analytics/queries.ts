import "server-only";
/**
 * Analytics query helpers (KPIs)
 * Postgres-only (Redis optional for ingestion pipeline).
 */
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";

export interface TotalEventsResult {
  readonly total: number;
}

export async function getTotalEvents(): Promise<TotalEventsResult> {
  const res = await db.select({ total: count() }).from(analyticsEvents);
  return { total: res[0]?.total ?? 0 };
}

export interface PageViewsTimeseriesPoint {
  readonly date: string;
  readonly count: number;
}

export async function getPageViewsLast7d(): Promise<ReadonlyArray<PageViewsTimeseriesPoint>> {
  const sevenDaysAgo = sql`now() - interval '7 days'`;
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${analyticsEvents.createdAt}), 'YYYY-MM-DD')`,
      count: count().as("count"),
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, sevenDaysAgo)))
    .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`);
  return rows.map((r: { date: string; count: number | string }) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

export interface TopPageRow {
  readonly path: string;
  readonly count: number;
}

export async function getTopPages(limit = 10): Promise<ReadonlyArray<TopPageRow>> {
  const cnt = count().as("cnt");
  const rows = await db
    .select({ path: analyticsEvents.path, cnt })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.name, "page_view"))
    .groupBy(analyticsEvents.path)
    .orderBy(desc(cnt))
    .limit(limit);
  return rows.map((r: { path: string; cnt: number | string }) => ({
    path: r.path,
    count: Number(r.cnt),
  }));
}

export interface TopReferrerRow {
  readonly referrer: string;
  readonly count: number;
}

export async function getTopReferrers(limit = 10): Promise<ReadonlyArray<TopReferrerRow>> {
  const cnt = count().as("cnt");
  const rows = await db
    .select({ referrer: analyticsEvents.referrer, cnt })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.name, "page_view"),
        sql`${analyticsEvents.referrer} is not null and ${analyticsEvents.referrer} <> ''`,
      ),
    )
    .groupBy(analyticsEvents.referrer)
    .orderBy(desc(cnt))
    .limit(limit);
  return rows.map((r: { referrer: string | null; cnt: number | string }) => ({
    referrer: r.referrer ?? "",
    count: Number(r.cnt),
  }));
}
