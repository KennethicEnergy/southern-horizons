import "server-only";
import { revalidatePath } from "next/cache";
import { and, eq, isNull, like, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Post, PostStatus } from "@/db/schema";
import type { ActionResult } from "@/lib/errors";
import type { PostFormValues } from "@/lib/validations/post";
import { slugify } from "@/lib/slug";

/**
 * Writes to posts, shared by direct saves (src/actions/posts.ts) and approved
 * requests (src/lib/posts/approval-handler.ts). Callers check permissions first.
 */

/** Form datetimes have no timezone; they're entered in Philippine time. */
const toDate = (v?: string) => {
  if (!v) return null;
  const hasZone = /(?:[zZ]|[+-]\d\d:\d\d)$/.test(v);
  return new Date(hasZone ? v : `${v.length === 16 ? `${v}:00` : v}+08:00`);
};
const orNull = (v?: string) => (v ? v : null);

const uniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
  const rows = await getDb()
    .select({ slug: schema.posts.slug })
    .from(schema.posts)
    .where(and(like(schema.posts.slug, `${base}%`), excludeId ? ne(schema.posts.id, excludeId) : undefined));
  const taken = new Set(rows.map(({ slug }) => slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

const revalidatePost = (...slugs: string[]) => {
  revalidatePath("/");
  revalidatePath("/news");
  for (const slug of new Set(slugs)) revalidatePath(`/news/${slug}`);
};

export const findPost = async (postId: string): Promise<Post | undefined> => {
  const [post] = await getDb()
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, postId), isNull(schema.posts.deletedAt)))
    .limit(1);
  return post;
};

/** Updates must hang off an event. Returns a form error, or null when fine. */
export const checkParentEvent = async ({ type, parentId }: PostFormValues): Promise<ActionResult | null> => {
  if (type !== "update" || !parentId) return null;
  const [parent] = await getDb().select({ type: schema.posts.type }).from(schema.posts).where(eq(schema.posts.id, parentId)).limit(1);
  if (parent?.type === "event") return null;
  return { ok: false, message: "Updates must belong to an event.", fieldErrors: { parentId: "Pick an event." } };
};

export const persistPost = async ({
  data,
  status,
  existing,
  authorId,
}: {
  data: PostFormValues;
  status: PostStatus;
  existing?: Post;
  authorId: string;
}): Promise<{ id: string; slug: string }> => {
  const db = getDb();
  const slug = await uniqueSlug(data.slug || slugify(data.title) || "post", existing?.id);
  const record = {
    slug,
    title: data.title,
    excerpt: orNull(data.excerpt),
    type: data.type,
    status,
    content: data.content,
    coverMediaId: orNull(data.coverMediaId),
    coverFocusX: data.coverFocusX,
    coverFocusY: data.coverFocusY,
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
    const [created] = await db.insert(schema.posts).values({ ...record, authorId }).returning({ id: schema.posts.id });
    id = created!.id;
  }

  // neon-http batches run in a single transaction.
  await db.batch([
    db.delete(schema.postMedia).where(eq(schema.postMedia.postId, id)),
    ...data.attachmentIds.map((mediaId, sortOrder) => db.insert(schema.postMedia).values({ postId: id, mediaId, sortOrder })),
  ] as unknown as Parameters<typeof db.batch>[0]);

  revalidatePost(slug, existing?.slug ?? slug);
  return { id, slug };
};

export const setPostStatus = async ({ id, slug, publishedAt }: Post, status: PostStatus): Promise<void> => {
  await getDb()
    .update(schema.posts)
    .set({ status, publishedAt: status === "published" ? (publishedAt ?? new Date()) : publishedAt })
    .where(eq(schema.posts.id, id));
  revalidatePost(slug);
};

/** Soft delete: the row stays for the audit trail. */
export const softDeletePost = async ({ id, slug }: Post): Promise<void> => {
  await getDb().update(schema.posts).set({ deletedAt: new Date() }).where(eq(schema.posts.id, id));
  revalidatePost(slug);
};
