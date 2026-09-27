import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = { title: "Backoffice", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!can(user.role, "admin:access")) redirect("/");

  return (
    <div className="min-h-dvh bg-sky lg:flex">
      <AdminSidebar user={user} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
