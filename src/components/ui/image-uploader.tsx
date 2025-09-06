"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";

interface ImageUploaderProps {
  onUploadComplete: (key: string) => void;
  folder?: string;
  children?: React.ReactNode;
  onError?: (message: string) => void;
}

export function ImageUploader({ onUploadComplete, folder, children, onError }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (selectedFile: File) => {
    startTransition(async () => {
      try {
        // 1. Get a pre-signed URL
        const presignedUrlResponse = await fetch("/api/storage/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type,
            folder: folder,
          }),
        });
        if (!presignedUrlResponse.ok) {
          throw new Error("Failed to get a pre-signed URL.");
        }
        const { url, key } = await presignedUrlResponse.json();
        // 2. Upload the file to the pre-signed URL
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload the file.");
        }
        // 3. Notify parent component
        onUploadComplete(key);
        toast.success("Image uploaded successfully!");
        setFile(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        console.error("Upload failed:", error);
        onError?.(message);
        toast.error(message);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      upload(selectedFile);
    }
  };

  if (children) {
    return (
      <div className="relative inline-flex">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={isPending ? "opacity-70 pointer-events-none" : ""}
          disabled={isPending}
        >
          {children}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Input type="file" onChange={handleFileChange} accept="image/*" disabled={isPending} />
      <Button type="button" disabled={!file || isPending} onClick={() => file && upload(file)}>
        {isPending ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}
