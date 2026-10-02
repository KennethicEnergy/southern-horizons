import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { countPendingFor } from "@/lib/approvals/queries";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = { title: "Backoffice", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!can(user.role, "admin:access")) redirect("/");

  // Counts for the sidebar badges, only for roles that can act on them.
  const badges: Record<string, number> = {};
  const approvals = await countPendingFor(user.role);
  if (approvals) badges["/admin/approvals"] = approvals;
  if (can(user.role, "user:manage")) {
    const [row] = await getDb()
      .select({ n: count() })
      .from(schema.memberApplications)
      .where(eq(schema.memberApplications.status, "pending"));
    if (row?.n) badges["/admin/users"] = row.n;
  }
  if (can(user.role, "message:view")) {
    const [row] = await getDb()
      .select({ n: count() })
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.isRead, false));
    if (row?.n) badges["/admin/messages"] = row.n;
  }

  return (
    <div className="min-h-dvh bg-sky lg:flex">
      <AdminSidebar user={{ name: user.name, role: user.role }} badges={badges} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
