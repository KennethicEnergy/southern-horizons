"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  DashboardSquare01Icon,
  Home01Icon,
  Idea01Icon,
  Image01Icon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  MoneyReceiveSquareIcon,
  News01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { can, canPerformAction, isApprover, roleLabel } from "@/lib/rbac";
import type { Role } from "@/types/rbac";
import { HorizonMark } from "@/components/site/horizon-mark";
import { useAdminUi } from "@/stores/admin-ui-store";
import { logout } from "@/actions/auth";

const canAdd = (role: Role) => canPerformAction(role, "add");

const nav: { href: string; label: string; icon: typeof Home01Icon; visible: (role: Role) => boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardSquare01Icon, visible: (role) => can(role, "admin:access") },
  { href: "/admin/posts", label: "Posts", icon: News01Icon, visible: canAdd },
  { href: "/admin/approvals", label: "Approvals", icon: CheckmarkBadge01Icon, visible: (role) => isApprover(role) || canAdd(role) },
  { href: "/admin/media", label: "Media", icon: Image01Icon, visible: canAdd },
  { href: "/admin/donations", label: "Donations", icon: MoneyReceiveSquareIcon, visible: (role) => can(role, "donation:view") },
  { href: "/admin/messages", label: "Messages", icon: Mail01Icon, visible: (role) => can(role, "message:view") },
  { href: "/admin/users", label: "Members", icon: UserGroupIcon, visible: (role) => can(role, "admin:access") },
  // TEMPORARY: see the note on `suggestions` in src/db/schema.ts.
  { href: "/admin/suggestions", label: "Suggestions", icon: Idea01Icon, visible: (role) => can(role, "admin:access") },
];

/**
 * Where the mobile back button goes: the section list for a page inside it
 * (e.g. /admin/posts/123/edit → Posts), or the dashboard for a section list itself.
 */
function parentOf(pathname: string): { href: string; label: string } | null {
  if (pathname === "/admin") return null;
  const section = nav.find((n) => n.href !== "/admin" && pathname.startsWith(`${n.href}/`));
  return section ? { href: section.href, label: section.label } : { href: "/admin", label: "Dashboard" };
}

/** `badges` maps a nav href to a count shown beside it, e.g. pending member applications. */
export function AdminSidebar({ user, badges = {} }: { user: { name?: string | null; role: Role }; badges?: Record<string, number> }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useAdminUi();
  const items = nav.filter(({ visible }) => visible(user.role)); // Layer 3: cosmetic only.
  const totalBadges = Object.values(badges).reduce((a, n) => a + n, 0);
  const parent = parentOf(pathname);

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-2 lg:hidden">
        <div className="flex min-w-0 items-center gap-1">
          {parent ? (
            <Link
              href={parent.href}
              onClick={closeSidebar}
              aria-label={`Back to ${parent.label}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-sky"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
            </Link>
          ) : null}
          <Link href="/admin" onClick={closeSidebar} className={`flex items-center gap-2 font-display font-semibold ${parent ? "" : "pl-2"}`}>
            <HorizonMark className="size-6" /> Backoffice
          </Link>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={totalBadges > 0 ? `Toggle menu, ${totalBadges} waiting` : "Toggle menu"}
          aria-expanded={sidebarOpen}
          className="relative p-2"
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} />
          {totalBadges > 0 ? <span aria-hidden="true" className="absolute right-1 top-1 size-2.5 rounded-full bg-sea" /> : null}
        </button>
      </div>
      <aside
        className={`${sidebarOpen ? "block" : "hidden"} border-r border-line bg-white lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-64 lg:shrink-0`}
      >
        <div className="flex h-full flex-col p-4">
          <Link href="/admin" className="hidden items-center gap-2.5 px-2 py-2 lg:flex">
            <HorizonMark className="size-7" />
            <span className="font-display font-semibold">Backoffice</span>
          </Link>
          <nav aria-label="Backoffice" className="mt-4 flex-1 space-y-1">
            {items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] ${
                    active ? "bg-sea-mist font-medium text-sea-deep" : "text-ink-soft hover:bg-sky hover:text-ink"
                  }`}
                >
                  <HugeiconsIcon icon={item.icon} size={20} />
                  {item.label}
                  {badges[item.href] ? (
                    <span className="ml-auto rounded-full bg-sea px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                      {badges[item.href]}
                      <span className="sr-only"> waiting</span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] text-ink-soft hover:bg-sky hover:text-ink">
              <HugeiconsIcon icon={Home01Icon} size={20} />
              View site
            </Link>
          </nav>
          <div className="border-t border-line px-2 pt-4">
            <p className="truncate font-medium">{user.name}</p>
            <p className="text-sm text-ink-soft">{roleLabel(user.role)}</p>
            <form action={logout}>
              <button type="submit" className="mt-3 flex items-center gap-2 text-sm text-ink-soft hover:text-danger">
                <HugeiconsIcon icon={Logout01Icon} size={18} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
