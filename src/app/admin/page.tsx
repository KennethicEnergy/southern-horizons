import Link from "next/link";
import { and, count, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can, canPerformAction, isApprover, requiresApproval } from "@/lib/rbac";
import { countPendingBy, countPendingFor } from "@/lib/approvals/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/ui/button";

async function countWhere(
  table: typeof schema.posts | typeof schema.donations | typeof schema.contactMessages | typeof schema.memberApplications,
  where: ReturnType<typeof and>,
) {
  const [row] = await getDb().select({ n: count() }).from(table).where(where);
  return row?.n ?? 0;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const cards: { label: string; value: number; href: string; hint: string }[] = [];

  const canAdd = canPerformAction(user.role, "add");

  if (canAdd) {
    cards.push({
      label: "Your drafts",
      value: await countWhere(schema.posts, and(eq(schema.posts.authorId, user.id), eq(schema.posts.status, "draft"), isNull(schema.posts.deletedAt))),
      href: "/admin/posts?status=draft",
      hint: "Posts you haven't submitted yet",
    });
  }
  if (canAdd && requiresApproval(user.role)) {
    cards.push({
      label: "Your requests waiting",
      value: await countPendingBy(user.id),
      href: "/admin/approvals",
      hint: "Changes waiting for approval",
    });
  }
  if (isApprover(user.role)) {
    cards.push({
      label: "Waiting for your approval",
      value: await countPendingFor(user.role),
      href: "/admin/approvals",
      hint: "New posts, edits, and deletes from officers",
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
  if (can(user.role, "user:manage")) {
    cards.push({
      label: "Member applications",
      value: await countWhere(schema.memberApplications, eq(schema.memberApplications.status, "pending")),
      href: "/admin/users",
      hint: "From the Become a member form",
    });
  }
  if (can(user.role, "message:view")) {
    cards.push({
      label: "Unread messages",
      value: await countWhere(schema.contactMessages, eq(schema.contactMessages.isRead, false)),
      href: "/admin/messages",
      hint: "From the contact form",
    });
  }

  return (
    <>
      <AdminPageHeader
        title={`Hi, ${user.name?.split(" ")[0] ?? "there"}`}
        description="Here's what needs your attention."
        actions={canAdd ? <ButtonLink href="/admin/posts/new">Write a post</ButtonLink> : null}
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
