import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaThumb } from "@/components/admin/media-thumb";
import { MediaUploadPanel } from "@/components/admin/media-upload-panel";

export default async function MediaPage() {
  await requirePermission("media:upload");
  const items = await getDb()
    .select()
    .from(schema.media)
    .where(and(isNull(schema.media.deletedAt), eq(schema.media.verified, true)))
    .orderBy(desc(schema.media.createdAt))
    .limit(120);

  return (
    <>
      <AdminPageHeader title="Media" description="Photos, videos, and documents shared across posts and campaigns." />
      <MediaUploadPanel />
      {items.length === 0 ? (
        <p className="mt-8 text-ink-soft">Nothing uploaded yet.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <li key={m.id} className="rounded-xl bg-white p-2">
              <a href={m.url} target="_blank" rel="noopener noreferrer">
                <MediaThumb media={m} className="aspect-square w-full" />
              </a>
              <p className="mt-2 truncate px-1 text-sm" title={m.filename}>
                {m.filename}
              </p>
              <p className="px-1 text-xs text-ink-soft">{formatDate(m.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
