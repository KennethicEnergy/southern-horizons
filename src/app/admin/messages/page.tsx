import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { formatDateTime } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const tabs = [
  { value: "unread", label: "Unread" },
  { value: "all", label: "All" },
] as const;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "message:view")) redirect("/admin");
  const { show: raw } = await searchParams;
  const show = tabs.find((t) => t.value === raw)?.value ?? "unread";

  const messages = await getDb()
    .select({
      id: schema.contactMessages.id,
      name: schema.contactMessages.name,
      email: schema.contactMessages.email,
      subject: schema.contactMessages.subject,
      message: schema.contactMessages.message,
      isRead: schema.contactMessages.isRead,
      createdAt: schema.contactMessages.createdAt,
    })
    .from(schema.contactMessages)
    .where(show === "unread" ? eq(schema.contactMessages.isRead, false) : undefined)
    .orderBy(desc(schema.contactMessages.createdAt))
    .limit(200);

  return (
    <>
      <AdminPageHeader title="Messages" description="From the contact form on the public site. Opening a message marks it as read." />
      <nav aria-label="Filter messages" className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/messages?show=${t.value}`}
            aria-current={t.value === show ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm ${t.value === show ? "bg-ink text-white" : "bg-white text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-ink-soft">
          {show === "unread" ? "All caught up. New messages from the contact form appear here." : "No messages yet."}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl bg-white">
          {messages.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/messages/${m.id}`} className="grid gap-1 px-5 py-4 hover:bg-sky sm:grid-cols-[1fr_auto] sm:gap-6">
                <div className="min-w-0">
                  <p className={`flex items-center gap-2 ${m.isRead ? "" : "font-semibold"}`}>
                    {m.isRead ? null : <span className="size-2 shrink-0 rounded-full bg-sea" aria-hidden="true" />}
                    <span className="truncate">{m.subject}</span>
                    {m.isRead ? null : <span className="sr-only">(unread)</span>}
                  </p>
                  <p className="truncate text-sm text-ink-soft">
                    {m.name} · {m.email} — {m.message}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(m.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
