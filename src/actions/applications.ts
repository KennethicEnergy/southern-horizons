"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { audit } from "@/lib/audit";
import { ROLE_LABELS } from "@/lib/rbac";
import {
  applicationReviewSchema,
  applicationSchema,
  type ApplicationReview,
  type ApplicationValues,
} from "@/lib/validations/application";
import type { ActionResult } from "@/lib/errors";
import { runAction } from "./_helpers";

const THANKS = "Thanks for applying! An admin will review it. Once approved, sign in with Google using the email you gave us.";

/** Public: anyone can apply. The reply never reveals whether the email is already a member or has applied. */
export async function submitApplication(values: ApplicationValues): Promise<ActionResult> {
  return runAction(async () => {
    const data = applicationSchema.parse(values);
    // Honeypot filled in: pretend success so bots don't learn anything.
    if (data.website) return { ok: true, message: THANKS };

    // TODO: verify a Cloudflare Turnstile token here if spam shows up.
    const email = data.email.toLowerCase();
    const db = getDb();
    const [member] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`lower(${schema.users.email}) = ${email}`)
      .limit(1);
    const [pending] = await db
      .select({ id: schema.memberApplications.id })
      .from(schema.memberApplications)
      .where(and(eq(schema.memberApplications.email, email), eq(schema.memberApplications.status, "pending")))
      .limit(1);
    if (member || pending) return { ok: true, message: THANKS };

    await db.insert(schema.memberApplications).values({
      name: data.name,
      email,
      phone: data.phone || null,
      message: data.message,
    });
    revalidatePath("/admin/users");
    return { ok: true, message: THANKS };
  });
}

/** Admin: approving invites the applicant with the chosen role; rejecting just closes it. */
export async function reviewApplication(input: ApplicationReview): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("user:manage");
    const data = applicationReviewSchema.parse(input);
    const db = getDb();

    // Claim it first so two admins can't review the same application twice.
    const [application] = await db
      .update(schema.memberApplications)
      .set({ status: data.decision, reviewedById: actor.id, reviewedAt: new Date() })
      .where(and(eq(schema.memberApplications.id, data.applicationId), eq(schema.memberApplications.status, "pending")))
      .returning({ name: schema.memberApplications.name, email: schema.memberApplications.email });
    if (!application) return { ok: false, message: "This application was already reviewed." };

    let message = `${application.name}'s application was rejected.`;
    if (data.decision === "approved") {
      const [existing] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(sql`lower(${schema.users.email}) = ${application.email}`)
        .limit(1);
      if (existing) {
        message = `${application.email} is already on the members list, so no new account was needed.`;
      } else {
        const [user] = await db
          .insert(schema.users)
          .values({ name: application.name, email: application.email, role: data.role, passwordHash: null })
          .returning({ id: schema.users.id });
        await audit({
          actorId: actor.id,
          action: "user.invite",
          entityType: "user",
          entityId: user!.id,
          changes: { email: application.email, role: data.role, fromApplication: data.applicationId },
        });
        message = `${application.name} was added as ${ROLE_LABELS[data.role]} and can sign in with Google using ${application.email}.`;
      }
    }

    await audit({
      actorId: actor.id,
      action: `application.${data.decision}`,
      entityType: "member_application",
      entityId: data.applicationId,
      changes: data.decision === "approved" ? { role: data.role } : undefined,
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true, message };
  });
}
