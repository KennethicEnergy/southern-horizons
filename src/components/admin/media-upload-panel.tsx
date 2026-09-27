"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "./upload-dropzone";
import { UploadQueue } from "./upload-queue";

export function MediaUploadPanel() {
  const router = useRouter();
  return (
    <>
      <UploadDropzone onUploaded={() => router.refresh()} />
      <UploadQueue />
    </>
  );
}
