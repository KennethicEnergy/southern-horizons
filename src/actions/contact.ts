"use server";

import { getDb, schema } from "@/db";
import type { ActionResult } from "@/lib/errors";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";
import { runAction } from "./_helpers";

export async function sendContactMessage(values: ContactValues): Promise<ActionResult> {
  return runAction(async () => {
    const data = contactSchema.parse(values);
    // Honeypot filled in: pretend success so bots don't learn anything.
    if (data.website) return { ok: true, message: "Message sent." };

    // TODO: verify a Cloudflare Turnstile token here, and email the team (e.g. via Resend).
    await getDb().insert(schema.contactMessages).values({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    return { ok: true, message: "Message sent. We usually reply within two working days." };
  });
}
