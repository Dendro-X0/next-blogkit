import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { affiliateLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  try {
    const { linkId } = await params;
    const link = await db.query.affiliateLinks.findFirst({
      where: eq(affiliateLinks.id, parseInt(linkId, 10)),
    });

    if (!link) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 });
    }

    const res: NextResponse = NextResponse.json(link);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching affiliate link:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { linkId } = await params;
    const body = await request.json();
    const { name, url, description, isActive } = body;

    const [updatedLink] = await db
      .update(affiliateLinks)
      .set({ name, url, description, isActive, updatedAt: new Date() })
      .where(eq(affiliateLinks.id, parseInt(linkId, 10)))
      .returning({
        id: affiliateLinks.id,
        name: affiliateLinks.name,
        url: affiliateLinks.url,
        description: affiliateLinks.description,
        clicks: affiliateLinks.clicks,
        isActive: affiliateLinks.isActive,
        createdAt: affiliateLinks.createdAt,
        updatedAt: affiliateLinks.updatedAt,
      });

    if (!updatedLink) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Error updating affiliate link:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(await headers()) });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { linkId } = await params;

    const [deletedLink] = await db
      .delete(affiliateLinks)
      .where(eq(affiliateLinks.id, parseInt(linkId, 10)))
      .returning({
        id: affiliateLinks.id,
        name: affiliateLinks.name,
        url: affiliateLinks.url,
        description: affiliateLinks.description,
        clicks: affiliateLinks.clicks,
        isActive: affiliateLinks.isActive,
        createdAt: affiliateLinks.createdAt,
        updatedAt: affiliateLinks.updatedAt,
      });

    if (!deletedLink) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting affiliate link:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
