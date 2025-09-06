/**
 * Storage configuration
 */
export interface StorageConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint?: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

/**
 * Custom error classes for storage operations
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export class ConfigurationError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Result of a successful file upload
 */
export interface UploadFileResult {
  url: string;
  key: string;
}

/**
 * Parameters for generating a pre-signed URL
 */
export interface PresignedUploadUrlParams {
  filename: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
}

/**
 * Defines the contract for a storage provider
 */
export interface StorageProvider {
  getPresignedUploadUrl(params: PresignedUploadUrlParams): Promise<UploadFileResult>;
}
