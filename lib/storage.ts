import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Lazy initialization to avoid build-time errors
let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }
  return s3ClientInstance;
}

function getBucketName(): string {
  return process.env.R2_BUCKET_NAME || "propi-uploads";
}

function getPublicUrl(): string {
  return process.env.R2_PUBLIC_URL || "";
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = "listings"
): Promise<UploadResult> {
  // Generate unique key with folder structure
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: `${getPublicUrl()}/${key}`,
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
}

/**
 * Extract the key from a full R2 URL
 */
export function getKeyFromUrl(url: string): string | null {
  const publicUrl = getPublicUrl();
  if (!publicUrl || !url.startsWith(publicUrl)) {
    return null;
  }
  return url.replace(`${publicUrl}/`, "");
}

/**
 * Validate file type for images
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  return validTypes.includes(contentType.toLowerCase());
}

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum number of photos per listing
 */
export const MAX_PHOTOS_PER_LISTING = 20;
