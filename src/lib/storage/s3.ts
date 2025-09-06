import "server-only";
import { randomUUID } from "crypto";
import { env } from "@/../env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ConfigurationError,
  type PresignedUploadUrlParams,
  type StorageProvider,
  type UploadFileResult,
} from "./types";

export class S3Provider implements StorageProvider {
  private s3Client: S3Client;

  constructor() {
    if (!env.S3_REGION) {
      throw new ConfigurationError("Storage region is not configured");
    }

    // Check required S3 credentials
    if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new ConfigurationError("S3 access key ID and secret access key are required");
    }

    this.s3Client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: !!env.S3_ENDPOINT, // Required for S3-compatible services
    });
  }

  private generateUniqueFilename(originalFilename: string): string {
    const extension = originalFilename.split(".").pop() || "";
    const uuid = randomUUID();
    return `${uuid}${extension ? `.${extension}` : ""}`;
  }

  public async getPresignedUploadUrl(params: PresignedUploadUrlParams): Promise<UploadFileResult> {
    const { filename, contentType, folder, expiresIn = 3600 } = params;
    const { S3_BUCKET_NAME } = env;

    if (!S3_BUCKET_NAME) {
      throw new ConfigurationError("Storage bucket name is not configured");
    }

    const uniqueFilename = this.generateUniqueFilename(filename);
    const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    return { url: signedUrl, key: key }; // Return the signedUrl for upload, key for reference
  }
}
