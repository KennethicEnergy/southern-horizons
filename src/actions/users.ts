"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { audit } from "@/lib/audit";
import { roleLabel } from "@/lib/rbac";
import { checkDeactivation, checkNewMember, checkRoleChange } from "@/lib/positions";
import { findPositionHolder, guardPositionWrite } from "@/lib/position-holders";
import { inviteSchema, setActiveSchema, setRoleSchema, type InviteValues } from "@/lib/validations/user";
import type { AssignableRole } from "@/types/rbac";
import type { ActionResult } from "@/lib/errors";
import { runAction } from "./_helpers";

const findMember = async (userId: string) => {
  const [member] = await getDb()
    .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return member ?? null;
};

/**
 * Adds someone to the members list so their Google account can sign in.
 * No email is sent; the President tells them to sign in with Google.
 */
export const inviteUser = async (values: InviteValues): Promise<ActionResult> =>
  runAction(async (): Promise<ActionResult> => {
    const actor = await requirePermission("user:manage");
    const data = inviteSchema.parse(values);
    const email = data.email.toLowerCase();
    const db = getDb();

    // The unique email index includes deleted rows, so check them too.
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`lower(${schema.users.email}) = ${email}`)
      .limit(1);
    if (existing) {
      return { ok: false, message: "This email is already on the members list.", fieldErrors: { email: "Already a member." } };
    }

    const refusal = checkNewMember({ role: data.role, holder: await findPositionHolder(data.role) });
    if (refusal) return { ok: false, message: refusal, fieldErrors: { role: refusal } };

    const inserted = await guardPositionWrite(data.role, () =>
      db.insert(schema.users).values({ name: data.name, email, role: data.role, passwordHash: null }).returning({ id: schema.users.id }),
    );
    if (!inserted.ok) return { ok: false, message: inserted.message };
    const [user] = inserted.value;

    await audit({ actorId: actor.id, action: "user.invite", entityType: "user", entityId: user!.id, changes: { email, role: data.role } });
    revalidatePath("/admin/users");
    return { ok: true, message: `${data.name} can now sign in with Google using ${email}.` };
  });

/**
 * Changes a member's position. Takes effect within 5 minutes (the role refresh in auth.ts).
 * Nobody can change their own position, the Super Admin's row is untouchable, and
 * only one person at a time may be President (see src/lib/positions.ts).
 */
export const setUserRole = async (input: { userId: string; role: AssignableRole }): Promise<ActionResult> =>
  runAction(async () => {
    const actor = await requirePermission("user:manage");
    const data = setRoleSchema.parse(input);

    const before = await findMember(data.userId);
    if (!before) return { ok: false, message: "That member no longer exists." };

    const refusal = checkRoleChange({
      actorId: actor.id,
      target: before,
      nextRole: data.role,
      holder: await findPositionHolder(data.role, data.userId),
    });
    if (refusal) return { ok: false, message: refusal };
    if (before.role === data.role) return { ok: true, message: `${before.name} is already ${roleLabel(data.role)}.` };

    const updated = await guardPositionWrite(data.role, () =>
      getDb().update(schema.users).set({ role: data.role }).where(eq(schema.users.id, data.userId)),
    );
    if (!updated.ok) return { ok: false, message: updated.message };

    await audit({
      actorId: actor.id,
      action: "user.role",
      entityType: "user",
      entityId: data.userId,
      changes: { from: before.role, to: data.role },
    });
    revalidatePath("/admin/users");
    return { ok: true, message: `${before.name} is now ${roleLabel(data.role)}. It applies within 5 minutes.` };
  });

/** Deactivated members are signed out within 5 minutes (see the role refresh in auth.ts). */
export const setUserActive = async (input: { userId: string; active: boolean }): Promise<ActionResult> =>
  runAction(async () => {
    const actor = await requirePermission("user:manage");
    const data = setActiveSchema.parse(input);

    const target = await findMember(data.userId);
    if (!target) return { ok: false, message: "That member no longer exists." };
    const refusal = checkDeactivation({ actorId: actor.id, target });
    if (refusal) return { ok: false, message: refusal };

    await getDb().update(schema.users).set({ isActive: data.active }).where(eq(schema.users.id, data.userId));
    await audit({
      actorId: actor.id,
      action: data.active ? "user.reactivate" : "user.deactivate",
      entityType: "user",
      entityId: data.userId,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  });
