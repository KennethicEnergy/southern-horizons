import "server-only";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

function r2(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") },
  });
  return client;
}

export function publicUrlFor(key: string): string {
  return `${env("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
}

/** Browser uploads straight to R2; the file never passes through Vercel. */
export async function presignPut(key: string, contentType: string, contentLength: number): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env("R2_BUCKET"),
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: "public, max-age=31536000, immutable",
  });
  return getSignedUrl(r2(), command, { expiresIn: 60 * 10 });
}

export async function headObject(key: string) {
  try {
    return await r2().send(new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
  } catch {
    return null;
  }
}

export async function readObjectBytes(key: string, range?: string): Promise<Uint8Array> {
  const res = await r2().send(new GetObjectCommand({ Bucket: env("R2_BUCKET"), Key: key, Range: range }));
  if (!res.Body) return new Uint8Array();
  return res.Body.transformToByteArray();
}

export async function deleteObject(key: string): Promise<void> {
  await r2().send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
}
