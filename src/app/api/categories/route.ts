import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCategories = await db.select().from(categories);
    const res: NextResponse = NextResponse.json(allCategories);
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
