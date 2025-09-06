import { S3Provider } from "./s3";
import type { PresignedUploadUrlParams, StorageProvider, UploadFileResult } from "./types";

let storageProvider: StorageProvider | null = null;

function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    // For now, we only support S3. This could be extended to other providers.
    storageProvider = new S3Provider();
  }
  return storageProvider;
}

export function getPresignedUploadUrl(params: PresignedUploadUrlParams): Promise<UploadFileResult> {
  const provider = getStorageProvider();
  return provider.getPresignedUploadUrl(params);
}
