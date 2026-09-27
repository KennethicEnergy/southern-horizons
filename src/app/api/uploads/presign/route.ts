import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { presignPut, publicUrlFor } from "@/lib/r2";
import { requirePermission } from "@/lib/session";
import { can } from "@/lib/rbac";
import { ForbiddenError } from "@/lib/errors";
import { presignSchema, UPLOAD_RULES } from "@/lib/validations/upload";
import { withErrors } from "@/lib/route-handler";

export const POST = withErrors(async (req: Request) => {
  const user = await requirePermission("media:upload");
  const body = presignSchema.parse(await req.json());

  if (body.contentType === "image/svg+xml" && !can(user.role, "media:upload:svg")) {
    throw new ForbiddenError("Only admins can upload SVG files.");
  }

  const rule = UPLOAD_RULES[body.contentType];
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${rule.kind}/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${rule.ext}`;

  const [row] = await getDb()
    .insert(schema.media)
    .values({
      key,
      url: publicUrlFor(key),
      filename: body.filename,
      mimeType: body.contentType,
      size: body.size,
      kind: rule.kind,
      uploadedById: user.id,
    })
    .returning({ id: schema.media.id, url: schema.media.url });

  const uploadUrl = await presignPut(key, body.contentType, body.size);
  return NextResponse.json({ mediaId: row!.id, uploadUrl, publicUrl: row!.url });
});
