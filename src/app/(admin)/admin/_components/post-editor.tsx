"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Eye, Plus, Save, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface PostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  publishDate?: Date;
  tags: string[];
  category: string;
  featuredImage?: string; // This will now be the S3 key
  seoTitle: string;
  seoDescription: string;
  allowComments: boolean;
  format: "standard" | "video" | "gallery";
  videoUrl?: string;
  galleryImages?: string[];
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface PostEditorProps {
  initialData?: Partial<PostData>;
  onSave: (data: PostData, status: PostData["status"]) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  categories: Category[];
  s3PublicUrl?: string;
}

export function PostEditor({
  initialData = {},
  onSave,
  isLoading = false,
  mode = "create",
  categories = [],
  s3PublicUrl,
}: PostEditorProps) {
  const [formData, setFormData] = useState<PostData>({
    title: initialData.title || "",
    slug: initialData.slug || "",
    excerpt: initialData.excerpt || "",
    content: initialData.content || "",
    status: initialData.status || "draft",
    publishDate: initialData.publishDate,
    tags: initialData.tags || [],
    category: initialData.category || "",
    featuredImage: initialData.featuredImage || undefined,
    seoTitle: initialData.seoTitle || "",
    seoDescription: initialData.seoDescription || "",
    allowComments: initialData.allowComments ?? true,
    format: initialData.format || "standard",
    videoUrl: initialData.videoUrl || "",
    galleryImages: initialData.galleryImages || [],
  });

  const [newTag, setNewTag] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.featuredImage && s3PublicUrl ? `${s3PublicUrl}/${initialData.featuredImage}` : null,
  );

  const handleUploadComplete = (key: string) => {
    setFormData((prev) => ({ ...prev, featuredImage: key }));
    setImagePreview(s3PublicUrl ? `${s3PublicUrl}/${key}` : null);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    if (mode === "create") {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleSave = async (saveStatus: PostData["status"]) => {
    await onSave(formData, saveStatus);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="post-slug-goes-here"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="A short summary of the post"
                rows={3}
              />
            </div>

            {formData.format === "standard" && (
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content here..."
                  rows={20}
                  required
                />
              </div>
            )}

            {formData.format === "video" && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="Enter video URL (e.g., YouTube, Vimeo)"
                />
              </div>
            )}

            {formData.format === "gallery" && (
              <div className="space-y-2">
                <Label htmlFor="galleryImages">Gallery Images</Label>
                <Textarea
                  id="galleryImages"
                  value={formData.galleryImages?.join("\n")}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, galleryImages: e.target.value.split("\n") }))
                  }
                  placeholder="Enter one image URL per line"
                  rows={5}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Title for search engines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))
                }
                placeholder="Description for search engines"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as PostData["status"] }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "scheduled" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.publishDate ? (
                      format(formData.publishDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.publishDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, publishDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="allowComments">Allow Comments</Label>
              <Switch
                id="allowComments"
                checked={formData.allowComments}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, allowComments: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={() => handleSave(formData.status)} disabled={isLoading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Post Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value: "standard" | "video" | "gallery") =>
                  setFormData((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Featured image preview"
                  width={500}
                  height={200}
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, featuredImage: undefined }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ImageUploader onUploadComplete={handleUploadComplete} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
