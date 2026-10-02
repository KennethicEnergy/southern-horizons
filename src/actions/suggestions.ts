"use server";

/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import { can } from "@/lib/rbac";
import { suggestionSchema, type SuggestionValues } from "@/lib/validations/suggestion";
import type { ActionResult } from "@/lib/errors";
import { runAction } from "./_helpers";

const idSchema = z.uuid();

/** Anyone in the backoffice can add a suggestion. */
export async function addSuggestion(values: SuggestionValues): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requirePermission("admin:access");
    const data = suggestionSchema.parse(values);
    await getDb().insert(schema.suggestions).values({ title: data.title, description: data.description ?? "", createdById: user.id });
    revalidatePath("/admin/suggestions");
    return { ok: true, message: "Suggestion added." };
  });
}

/** Only the person who wrote it, or the President, can tick it off or delete it. */
async function ownSuggestion(suggestionId: string) {
  const user = await requirePermission("admin:access");
  const id = idSchema.parse(suggestionId);
  const [row] = await getDb()
    .select({ createdById: schema.suggestions.createdById })
    .from(schema.suggestions)
    .where(eq(schema.suggestions.id, id))
    .limit(1);
  if (!row) return { id, allowed: false as const, message: "That suggestion no longer exists." };
  if (row.createdById !== user.id && !can(user.role, "user:manage")) {
    return { id, allowed: false as const, message: "Only the person who added it, or the President, can change it." };
  }
  return { id, allowed: true as const };
}

export async function setSuggestionDone(input: { suggestionId: string; done: boolean }): Promise<ActionResult> {
  return runAction(async () => {
    const check = await ownSuggestion(input.suggestionId);
    if (!check.allowed) return { ok: false, message: check.message };
    await getDb().update(schema.suggestions).set({ isDone: z.boolean().parse(input.done) }).where(eq(schema.suggestions.id, check.id));
    revalidatePath("/admin/suggestions");
    return { ok: true };
  });
}

export async function deleteSuggestion(suggestionId: string): Promise<ActionResult> {
  return runAction(async () => {
    const check = await ownSuggestion(suggestionId);
    if (!check.allowed) return { ok: false, message: check.message };
    await getDb().delete(schema.suggestions).where(eq(schema.suggestions.id, check.id));
    revalidatePath("/admin/suggestions");
    return { ok: true };
  });
}
