import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { advertisements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ adId: string }> }) {
  try {
    const { adId } = await params;
    const ad = await db.query.advertisements.findFirst({
      where: eq(advertisements.id, parseInt(adId, 10)),
    });

    if (!ad) {
      return NextResponse.json({ message: "Advertisement not found" }, { status: 404 });
    }

    const res: NextResponse = NextResponse.json(ad);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ adId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await params;
    const body = await request.json();
    const { name, placement, content, isActive, startDate, endDate } = body;

    const [updatedAd] = await db
      .update(advertisements)
      .set({ name, placement, content, isActive, startDate, endDate, updatedAt: new Date() })
      .where(eq(advertisements.id, parseInt(adId, 10)))
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

    if (!updatedAd) {
      return NextResponse.json({ message: "Advertisement not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ adId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await params;

    const [deletedAd] = await db
      .delete(advertisements)
      .where(eq(advertisements.id, parseInt(adId, 10)))
      .returning({ id: advertisements.id });

    if (!deletedAd) {
      return NextResponse.json({ message: "Advertisement not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
