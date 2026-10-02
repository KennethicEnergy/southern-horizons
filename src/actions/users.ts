"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { audit } from "@/lib/audit";
import { ROLE_LABELS } from "@/lib/rbac";
import { inviteSchema, setActiveSchema, setRoleSchema, type InviteValues } from "@/lib/validations/user";
import type { Role } from "@/db/schema";
import type { ActionResult } from "@/lib/errors";
import { runAction } from "./_helpers";

/**
 * Adds someone to the members list so their Google account can sign in.
 * No email is sent; the admin tells them to sign in with Google.
 */
export async function inviteUser(values: InviteValues): Promise<ActionResult> {
  return runAction(async () => {
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

    const [user] = await db
      .insert(schema.users)
      .values({ name: data.name, email, role: data.role, passwordHash: null })
      .returning({ id: schema.users.id });

    await audit({ actorId: actor.id, action: "user.invite", entityType: "user", entityId: user!.id, changes: { email, role: data.role } });
    revalidatePath("/admin/users");
    return { ok: true, message: `${data.name} can now sign in with Google using ${email}.` };
  });
}

/**
 * Changes a member's role. Takes effect within 5 minutes (the role refresh in auth.ts).
 * Admins can't change their own role, so there is always at least one admin left.
 */
export async function setUserRole(input: { userId: string; role: Role }): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("user:manage");
    const data = setRoleSchema.parse(input);
    if (data.userId === actor.id) return { ok: false, message: "You can't change your own role. Ask another admin." };

    const db = getDb();
    const [before] = await db
      .select({ name: schema.users.name, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, data.userId))
      .limit(1);
    if (!before) return { ok: false, message: "That member no longer exists." };
    if (before.role === data.role) return { ok: true, message: `${before.name} is already ${ROLE_LABELS[data.role]}.` };

    await db.update(schema.users).set({ role: data.role }).where(eq(schema.users.id, data.userId));
    await audit({
      actorId: actor.id,
      action: "user.role",
      entityType: "user",
      entityId: data.userId,
      changes: { from: before.role, to: data.role },
    });
    revalidatePath("/admin/users");
    return { ok: true, message: `${before.name} is now ${ROLE_LABELS[data.role]}. It applies within 5 minutes.` };
  });
}

/** Deactivated members are signed out within 5 minutes (see the role refresh in auth.ts). */
export async function setUserActive(input: { userId: string; active: boolean }): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("user:manage");
    const data = setActiveSchema.parse(input);
    if (data.userId === actor.id) return { ok: false, message: "You can't deactivate your own account." };

    const [user] = await getDb()
      .update(schema.users)
      .set({ isActive: data.active })
      .where(eq(schema.users.id, data.userId))
      .returning({ id: schema.users.id });
    if (!user) return { ok: false, message: "That member no longer exists." };

    await audit({
      actorId: actor.id,
      action: data.active ? "user.reactivate" : "user.deactivate",
      entityType: "user",
      entityId: data.userId,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  });
}
