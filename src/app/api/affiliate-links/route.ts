import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { affiliateLinks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const links = await db.query.affiliateLinks.findMany({
      orderBy: [desc(affiliateLinks.createdAt)],
    });
    const res: NextResponse = NextResponse.json(links);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching affiliate links:", error);
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
    const { name, url, description, isActive } = body;

    if (!name || !url) {
      return NextResponse.json({ message: "Name and URL are required" }, { status: 400 });
    }

    const [newLink] = await db
      .insert(affiliateLinks)
      .values({ name, url, description, isActive })
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

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("Error creating affiliate link:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
