import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { deleteObject, headObject, readObjectBytes } from "@/lib/r2";
import { requireAction } from "@/lib/session";
import { ForbiddenError } from "@/lib/errors";
import { matchesSignature } from "@/lib/file-signature";
import { finalizeSchema, type AllowedMimeType } from "@/lib/validations/upload";
import { withErrors } from "@/lib/route-handler";
import { audit } from "@/lib/audit";

export const POST = withErrors(async (req: Request) => {
  const user = await requireAction("add");
  const body = finalizeSchema.parse(await req.json());
  const db = getDb();

  const [row] = await db
    .select()
    .from(schema.media)
    .where(and(eq(schema.media.id, body.mediaId), isNull(schema.media.deletedAt)))
    .limit(1);

  if (!row) return NextResponse.json({ message: "Upload not found. Start the upload again." }, { status: 404 });
  if (row.uploadedById !== user.id) throw new ForbiddenError("You can only finish your own uploads.");

  const reject = async (message: string) => {
    await deleteObject(row.key).catch(() => undefined);
    await db.update(schema.media).set({ deletedAt: new Date() }).where(eq(schema.media.id, row.id));
    return NextResponse.json({ message }, { status: 422 });
  };

  const head = await headObject(row.key);
  if (!head) return reject("The file didn't reach storage. Try uploading it again.");
  if (head.ContentLength !== row.size) return reject("The uploaded file doesn't match what was expected. Try again.");

  const isSvg = row.mimeType === "image/svg+xml";
  const bytes = await readObjectBytes(row.key, isSvg ? undefined : "bytes=0-31");
  if (!matchesSignature(row.mimeType as AllowedMimeType, bytes)) {
    return reject(
      isSvg
        ? "This SVG contains scripts or external links, so it can't be used. Export a plain SVG and try again."
        : "This file's contents don't match its type. Re-export it and try again.",
    );
  }

  const [updated] = await db
    .update(schema.media)
    .set({ verified: true, alt: body.alt, width: body.width, height: body.height })
    .where(eq(schema.media.id, row.id))
    .returning();

  await audit({ actorId: user.id, action: "media.upload", entityType: "media", entityId: row.id });
  return NextResponse.json({ media: updated });
});
