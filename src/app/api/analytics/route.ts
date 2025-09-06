import { redis } from "@/lib/cache/redis";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Zod schema for analytics event payloads.
 */
const eventSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  referrer: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/analytics
 * Accepts first-party analytics events and persists to Postgres.
 * If Redis is available, also enqueues the event for downstream processing.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = eventSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { name, path, referrer, userId, sessionId, properties } = parsed.data;

    await db.insert(analyticsEvents).values({
      name,
      path,
      referrer: referrer ?? req.headers.get("referer") ?? null,
      userId: userId ?? null,
      sessionId: sessionId ?? null,
      properties: properties ?? null,
    });

    // Best-effort enqueue to Redis (optional)
    if (redis) {
      try {
        await redis.xadd(
          "analytics_events",
          "*",
          "name",
          name,
          "path",
          path,
          "referrer",
          referrer ?? "",
          "userId",
          userId ?? "",
          "sessionId",
          sessionId ?? "",
          "properties",
          JSON.stringify(properties ?? {}),
        );
      } catch {
        // ignore Redis errors to keep ingestion resilient
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
