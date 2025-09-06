import { db } from "@/lib/db";
import { userProfile as profiles, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userProfile = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl,
        location: profiles.location,
        createdAt: profiles.createdAt,
      })
      .from(user)
      .leftJoin(profiles, eq(user.id, profiles.userId))
      .where(eq(user.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const res: NextResponse = NextResponse.json(userProfile[0]);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { name, bio, avatarUrl, location } = body;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      // Update user's name
      if (name) {
        await tx.update(user).set({ name }).where(eq(user.id, userId));
      }

      // Update user's profile
      const profileData = {
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(location && { location }),
      };

      if (Object.keys(profileData).length > 0) {
        await tx.update(profiles).set(profileData).where(eq(profiles.userId, userId));
      }
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
