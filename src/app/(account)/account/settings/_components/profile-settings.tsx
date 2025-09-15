"use client";

import { env } from "@/../env";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useId, useState } from "react";

// This interface should align with the fields managed in the profile form
export interface ProfileData {
  name: string;
  username?: string;
  bio?: string;
  location?: string;
  image?: string; // This will now be the S3 key
}

interface ProfileSettingsProps {
  isPending: boolean;
  initialData: ProfileData & { email: string; avatarUrl: string | null; username?: string };
  onSave: (data: ProfileData) => Promise<void>;
}

export function ProfileSettings({ isPending, initialData, onSave }: ProfileSettingsProps) {
  const uid = useId();
  const fid = (name: string): string => `${uid}-${name}`;
  const [profileData, setProfileData] = useState<ProfileData>({
    name: initialData.name || "",
    username: initialData.username || "",
    bio: initialData.bio || undefined,
    location: initialData.location || undefined,
    image: initialData.image || undefined,
  });

  const handleSave = async () => {
    await onSave(profileData);
  };

  const handleUploadComplete = (key: string) => {
    setProfileData((prev) => ({ ...prev, image: key }));
  };

  // Compute current avatar URL: prefer newly uploaded key, else initial server URL
  const s3PublicBase = env.NEXT_PUBLIC_S3_PUBLIC_URL;
  const uploadedUrl =
    profileData.image && s3PublicBase ? `${s3PublicBase}/${profileData.image}` : null;
  const avatarUrl = uploadedUrl ?? initialData.avatarUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6 justify-center flex-col">
          <ImageUploader onUploadComplete={handleUploadComplete} folder="avatars">
            <Avatar className="h-24 w-24 cursor-pointer flex items-center justify-center">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback className="text-lg">
                {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </ImageUploader>
          <div className="space-y-2 justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Click your avatar to upload a new picture.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fid("name")}>Name</Label>
          <Input
            id={fid("name")}
            value={profileData.name}
            onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fid("username")}>
            Username
          </Label>
          <Input
            id={fid("username")}
            value={profileData.username || ""}
            onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="johndoe"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fid("email")}>
            Email
          </Label>
          <Input id={fid("email")} type="email" value={initialData.email || ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fid("bio")}>
            Bio
          </Label>
          <Textarea
            id={fid("bio")}
            value={profileData.bio || ""}
            onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fid("location")}>
            Location
          </Label>
          <Input
            id={fid("location")}
            value={profileData.location || ""}
            onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="City, Country"
          />
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
