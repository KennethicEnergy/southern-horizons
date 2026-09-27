"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, like, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { PostStatus } from "@/db/schema";
import { requirePermission, requireUser } from "@/lib/session";
import { can, canOnPost } from "@/lib/rbac";
import { ForbiddenError, type ActionResult } from "@/lib/errors";
import { postFormSchema, type PostFormValues } from "@/lib/validations/post";
import { slugify } from "@/lib/slug";
import { audit } from "@/lib/audit";
import { runAction } from "./_helpers";

/** Form datetimes have no timezone; they're entered in Philippine time. */
const toDate = (v?: string) => {
  if (!v) return null;
  const hasZone = /(?:[zZ]|[+-]\d\d:\d\d)$/.test(v);
  return new Date(hasZone ? v : `${v.length === 16 ? `${v}:00` : v}+08:00`);
};
const orNull = (v?: string) => (v ? v : null);

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = getDb();
  const rows = await db
    .select({ slug: schema.posts.slug })
    .from(schema.posts)
    .where(and(like(schema.posts.slug, `${base}%`), excludeId ? ne(schema.posts.id, excludeId) : undefined));
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function savePost(
  values: PostFormValues,
  postId?: string,
): Promise<ActionResult<{ id: string; slug: string; status: PostStatus }>> {
  return runAction(async () => {
    const user = await requireUser();
    const data = postFormSchema.parse(values);
    const db = getDb();

    let status: PostStatus = "draft";
    if (data.intent === "submit") {
      if (!can(user.role, "post:submit")) throw new ForbiddenError();
      status = "in_review";
    }
    if (data.intent === "publish") {
      if (!can(user.role, "post:publish")) throw new ForbiddenError("Your role can submit posts for review but not publish them.");
      status = "published";
    }

    const existing = postId
      ? (await db.select().from(schema.posts).where(and(eq(schema.posts.id, postId), isNull(schema.posts.deletedAt))).limit(1))[0]
      : undefined;

    if (postId && !existing) return { ok: false, message: "This post no longer exists." };
    if (existing && !canOnPost(user, "edit", existing)) throw new ForbiddenError("You can't edit this post.");
    if (!existing && !can(user.role, "post:create")) throw new ForbiddenError();

    if (data.type === "update" && data.parentId) {
      const [parent] = await db
        .select({ type: schema.posts.type })
        .from(schema.posts)
        .where(eq(schema.posts.id, data.parentId))
        .limit(1);
      if (parent?.type !== "event") {
        return { ok: false, message: "Updates must belong to an event.", fieldErrors: { parentId: "Pick an event." } };
      }
    }

    const slug = await uniqueSlug(data.slug || slugify(data.title) || "post", existing?.id);
    const record = {
      slug,
      title: data.title,
      excerpt: orNull(data.excerpt),
      type: data.type,
      status,
      content: data.content,
      coverMediaId: orNull(data.coverMediaId),
      parentId: data.type === "update" ? orNull(data.parentId) : null,
      eventStartAt: data.type === "event" ? toDate(data.eventStartAt) : null,
      eventEndAt: data.type === "event" ? toDate(data.eventEndAt) : null,
      location: orNull(data.location),
      publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
    };

    let id: string;
    if (existing) {
      id = existing.id;
      await db.update(schema.posts).set(record).where(eq(schema.posts.id, id));
    } else {
      const [created] = await db
        .insert(schema.posts)
        .values({ ...record, authorId: user.id })
        .returning({ id: schema.posts.id });
      id = created!.id;
    }

    // neon-http batches run in a single transaction.
    await db.batch([
      db.delete(schema.postMedia).where(eq(schema.postMedia.postId, id)),
      ...data.attachmentIds.map((mediaId, sortOrder) =>
        db.insert(schema.postMedia).values({ postId: id, mediaId, sortOrder }),
      ),
    ] as unknown as Parameters<typeof db.batch>[0]);

    await audit({
      actorId: user.id,
      action: existing ? `post.update.${status}` : `post.create.${status}`,
      entityType: "post",
      entityId: id,
      changes: existing ? { from: { status: existing.status, title: existing.title }, to: { status, title: data.title } } : undefined,
    });

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${slug}`);
    if (existing && existing.slug !== slug) revalidatePath(`/news/${existing.slug}`);

    const messages: Record<PostStatus, string> = {
      draft: "Draft saved.",
      in_review: "Submitted for review.",
      published: "Published.",
      archived: "Archived.",
    };
    return { ok: true, message: messages[status], data: { id, slug, status } };
  });
}

export async function deletePost(postId: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requirePermission("admin:access");
    const db = getDb();
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
    if (!post || post.deletedAt) return { ok: false, message: "This post no longer exists." };
    if (!canOnPost(user, "delete", post)) throw new ForbiddenError("You can't delete this post.");

    await db.update(schema.posts).set({ deletedAt: new Date() }).where(eq(schema.posts.id, postId));
    await audit({ actorId: user.id, action: "post.delete", entityType: "post", entityId: postId, changes: { title: post.title } });

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${post.slug}`);
    return { ok: true, message: "Post deleted." };
  });
}
