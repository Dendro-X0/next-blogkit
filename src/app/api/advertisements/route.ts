import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { advertisements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ads = await db.query.advertisements.findMany({
      orderBy: [desc(advertisements.createdAt)],
    });
    const res: NextResponse = NextResponse.json(ads);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, placement, content, isActive, startDate, endDate } = body;

    if (!name || !placement || !content) {
      return NextResponse.json(
        { message: "Name, placement, and content are required" },
        { status: 400 },
      );
    }

    const [newAd] = await db
      .insert(advertisements)
      .values({ name, placement, content, isActive, startDate, endDate })
      .returning({
        id: advertisements.id,
        name: advertisements.name,
        placement: advertisements.placement,
        content: advertisements.content,
        isActive: advertisements.isActive,
        startDate: advertisements.startDate,
        endDate: advertisements.endDate,
        createdAt: advertisements.createdAt,
        updatedAt: advertisements.updatedAt,
      });

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
