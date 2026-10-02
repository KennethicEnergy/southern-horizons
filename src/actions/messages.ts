"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "@/lib/errors";
import { runAction } from "./_helpers";

const setReadSchema = z.object({ messageId: z.uuid(), read: z.boolean() });

/** Marks a contact message read or unread. The sidebar badge and dashboard count unread ones. */
export async function setMessageRead(input: { messageId: string; read: boolean }): Promise<ActionResult> {
  return runAction(async () => {
    await requirePermission("message:view");
    const data = setReadSchema.parse(input);
    const [row] = await getDb()
      .update(schema.contactMessages)
      .set({ isRead: data.read })
      .where(eq(schema.contactMessages.id, data.messageId))
      .returning({ id: schema.contactMessages.id });
    if (!row) return { ok: false, message: "That message no longer exists." };
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}
