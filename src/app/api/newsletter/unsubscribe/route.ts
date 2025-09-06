import { unsubscribeFromNewsletter } from "@/lib/newsletter";
import { NextResponse } from "next/server";
import { z } from "zod";

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = unsubscribeSchema.parse(json);
    const success = await unsubscribeFromNewsletter(body.email);
    if (success) {
      return NextResponse.json({ message: "Unsubscribed" }, { status: 200 });
    }
    return NextResponse.json({ message: "Failed to unsubscribe." }, { status: 500 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
