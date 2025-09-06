import { subscribeToNewsletter } from "@/lib/newsletter";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = subscribeSchema.parse(json);

    const success = await subscribeToNewsletter(body);

    if (success) {
      return NextResponse.json({ message: "Successfully subscribed!" }, { status: 200 });
    }
    return NextResponse.json({ message: "Failed to subscribe." }, { status: 500 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
