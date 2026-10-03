import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Role } from "@/types/rbac";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { can, roleLabel } from "@/lib/rbac";
import { checkDeactivation, isAssignableRole } from "@/lib/positions";
import { formatDateTime } from "@/lib/dates";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InviteForm } from "@/components/admin/invite-form";
import { MemberActiveToggle } from "@/components/admin/member-active-toggle";
import { MemberRoleSelect } from "@/components/admin/member-role-select";
import { ApplicationReviewButtons } from "@/components/admin/application-review";
import { PermissionMatrix } from "@/components/admin/permission-matrix";

export default async function MembersPage() {
  const actor = await requireUser();
  const canManage = can(actor.role, "user:manage");
  // Everyone in the backoffice can see who the members are; only the President can change them.
  const members = await getDb()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      lastLoginAt: schema.users.lastLoginAt,
    })
    .from(schema.users)
    .where(canManage ? isNull(schema.users.deletedAt) : and(isNull(schema.users.deletedAt), eq(schema.users.isActive, true)))
    .orderBy(asc(schema.users.name));

  if (!canManage) return <MemberDirectory members={members} actorId={actor.id} />;

  const applications = await getDb()
    .select()
    .from(schema.memberApplications)
    .where(eq(schema.memberApplications.status, "pending"))
    .orderBy(asc(schema.memberApplications.createdAt));

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Only people on this list can sign in. Invite someone, then tell them to choose Continue with Google on the sign-in page."
      />

      <section className="mb-8 rounded-xl bg-white p-6">
        <h2 className="text-xl font-semibold">
          Applications{applications.length > 0 ? ` (${applications.length})` : ""}
        </h2>
        <p className="mt-1 text-ink-soft">
          From the public <Link href="/join" className="text-sea hover:underline">Become a member</Link> form. Approving one adds them to the members list with the position you pick.
        </p>
        {applications.length === 0 ? (
          <p className="mt-4 text-ink-soft">No applications waiting.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {applications.map((a) => (
              <li key={a.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-ink-soft">
                    {a.email}
                    {a.phone ? ` · ${a.phone}` : ""} · applied {formatDateTime(a.createdAt)}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-[0.95rem]">{a.message}</p>
                </div>
                <ApplicationReviewButtons applicationId={a.id} name={a.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white p-6">
        <h2 className="text-xl font-semibold">Invite a member</h2>
        <div className="mt-4">
          <InviteForm />
        </div>
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[44rem] text-left text-[0.95rem]">
          <thead className="border-b border-line text-sm text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Member</th>
              <th scope="col" className="px-5 py-3 font-medium">Position</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Access</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((m) => (
              <tr key={m.id} className={m.isActive ? "" : "text-ink-soft"}>
                <td className="px-5 py-3.5">
                  {m.name}
                  <span className="block text-sm text-ink-soft">{m.email}</span>
                </td>
                <td className="px-5 py-3.5">
                  {/* Your own row and the Super Admin's are read-only; the server actions refuse them too. */}
                  {m.id !== actor.id && isAssignableRole(m.role) ? (
                    <MemberRoleSelect userId={m.id} name={m.name} role={m.role} />
                  ) : (
                    roleLabel(m.role)
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm">
                  {!m.isActive ? (
                    <span className="inline-flex rounded-full bg-sky px-2.5 py-0.5 font-medium text-ink-soft">Deactivated</span>
                  ) : m.lastLoginAt ? (
                    <span className="text-ink-soft">Last signed in {formatDateTime(m.lastLoginAt)}</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-sun-mist px-2.5 py-0.5 font-medium text-sun-ink ring-1 ring-inset ring-sun-deep">
                      Invited, not signed in yet
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {checkDeactivation({ actorId: actor.id, target: m }) === null ? (
                    <MemberActiveToggle userId={m.id} name={m.name} active={m.isActive} />
                  ) : (
                    <span className="text-sm text-ink-soft">{m.id === actor.id ? "You" : "Protected"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 rounded-xl bg-white p-6">
        <h2 className="text-xl font-semibold">What each position can do</h2>
        <p className="mt-1 text-ink-soft">For posts. Changes that need approval wait in Approvals until they&apos;re approved.</p>
        <div className="mt-4">
          <PermissionMatrix />
        </div>
      </section>
    </>
  );
}

/** Read-only view for everyone but the President: names and positions only, no emails. */
function MemberDirectory({ members, actorId }: { members: { id: string; name: string; role: Role }[]; actorId: string }) {
  return (
    <>
      <AdminPageHeader title="Members" description="Everyone who can sign in to the backoffice. Ask the President to change someone's position." />
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[28rem] text-left text-[0.95rem]">
          <thead className="border-b border-line text-sm text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Member</th>
              <th scope="col" className="px-5 py-3 font-medium">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3.5">
                  {m.name}
                  {m.id === actorId ? <span className="ml-2 text-sm text-ink-soft">(you)</span> : null}
                </td>
                <td className="px-5 py-3.5">{roleLabel(m.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
