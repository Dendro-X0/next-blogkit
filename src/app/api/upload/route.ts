import { type UploadApiErrorResponse, type UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const results = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {},
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
