import { getCmsAdapter } from "@/lib/cms";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cms = getCmsAdapter();
    const allCategories = await cms.listCategories();
    const res: NextResponse = NextResponse.json(
      allCategories.map((c) => ({
        id: c.id,
        name: c.name,
        description: null,
      })),
    );
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
