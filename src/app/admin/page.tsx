import Link from "next/link";
import { and, count, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/ui/button";

async function countWhere(table: typeof schema.posts | typeof schema.donations | typeof schema.contactMessages, where: ReturnType<typeof and>) {
  const [row] = await getDb().select({ n: count() }).from(table).where(where);
  return row?.n ?? 0;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const cards: { label: string; value: number; href: string; hint: string }[] = [];

  if (can(user.role, "post:create")) {
    cards.push({
      label: "Your drafts",
      value: await countWhere(schema.posts, and(eq(schema.posts.authorId, user.id), eq(schema.posts.status, "draft"), isNull(schema.posts.deletedAt))),
      href: "/admin/posts?status=draft",
      hint: "Posts you haven't submitted yet",
    });
  }
  if (can(user.role, "post:publish")) {
    cards.push({
      label: "Waiting for review",
      value: await countWhere(schema.posts, and(eq(schema.posts.status, "in_review"), isNull(schema.posts.deletedAt))),
      href: "/admin/posts?status=in_review",
      hint: "Submitted by content creators",
    });
  }
  if (can(user.role, "donation:review")) {
    cards.push({
      label: "Donations to confirm",
      value: await countWhere(schema.donations, eq(schema.donations.status, "pending")),
      href: "/admin/donations",
      hint: "Match these against the bank record",
    });
  }
  if (can(user.role, "message:view")) {
    cards.push({
      label: "Unread messages",
      value: await countWhere(schema.contactMessages, eq(schema.contactMessages.isRead, false)),
      href: "/admin",
      hint: "From the contact form",
    });
  }

  return (
    <>
      <AdminPageHeader
        title={`Hi, ${user.name?.split(" ")[0] ?? "there"}`}
        description="Here's what needs your attention."
        actions={can(user.role, "post:create") ? <ButtonLink href="/admin/posts/new">Write a post</ButtonLink> : null}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl bg-white p-5 hover:ring-2 hover:ring-sea/30">
            <p className="text-ink-soft">{c.label}</p>
            <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{c.value}</p>
            <p className="mt-2 text-sm text-ink-soft">{c.hint}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
