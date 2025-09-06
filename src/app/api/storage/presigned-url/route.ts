import { auth } from "@/lib/auth/auth";
import { getPresignedUploadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

const presignedUrlSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  folder: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const body = presignedUrlSchema.parse(json);

    const result = await getPresignedUploadUrl(body);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
