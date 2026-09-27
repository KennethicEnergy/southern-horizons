"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "@/lib/errors";
import { donationPledgeSchema, donationReviewSchema, type DonationPledgeValues } from "@/lib/validations/donation";
import { audit } from "@/lib/audit";
import { runAction } from "./_helpers";

/** Public: a donor reports a QR Ph payment. The treasurer confirms it against the bank record. */
export async function submitDonation(values: DonationPledgeValues): Promise<ActionResult<{ amount: number }>> {
  return runAction(async () => {
    const data = donationPledgeSchema.parse(values);
    const db = getDb();

    const [item] = await db
      .select({ item: schema.donationItems, campaignStatus: schema.campaigns.status, campaignSlug: schema.campaigns.slug })
      .from(schema.donationItems)
      .innerJoin(schema.campaigns, eq(schema.campaigns.id, schema.donationItems.campaignId))
      .where(and(eq(schema.donationItems.id, data.itemId), eq(schema.donationItems.campaignId, data.campaignId)))
      .limit(1);

    if (!item) return { ok: false, message: "That donation option isn't available anymore." };
    if (item.campaignStatus !== "active") return { ok: false, message: "This campaign isn't accepting donations right now." };

    const [dupe] = await db
      .select({ id: schema.donations.id })
      .from(schema.donations)
      .where(
        and(
          eq(schema.donations.campaignId, data.campaignId),
          eq(schema.donations.referenceNumber, data.referenceNumber),
          inArray(schema.donations.status, ["pending", "confirmed"]),
        ),
      )
      .limit(1);
    if (dupe) {
      return {
        ok: false,
        message: "We already have a donation with this reference number.",
        fieldErrors: { referenceNumber: "This reference number was already submitted." },
      };
    }

    // The amount is always computed on the server. Never trust a client-sent total.
    const amount = item.item.unitAmount * data.quantity;
    await db.insert(schema.donations).values({
      campaignId: data.campaignId,
      itemId: data.itemId,
      quantity: data.quantity,
      amount,
      donorName: data.isAnonymous ? null : data.donorName,
      donorEmail: data.donorEmail || null,
      isAnonymous: data.isAnonymous,
      referenceNumber: data.referenceNumber,
      message: data.message || null,
      channel: "qrph_static",
    });

    return { ok: true, data: { amount }, message: "Thank you. We'll confirm your donation once it appears in our account." };
  });
}

export async function reviewDonation(input: { donationId: string; decision: "confirmed" | "rejected"; note?: string }): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requirePermission("donation:review");
    const data = donationReviewSchema.parse(input);
    const db = getDb();

    const [row] = await db
      .update(schema.donations)
      .set({ status: data.decision, reviewedById: user.id, reviewedAt: new Date(), reviewNote: data.note || null })
      .where(and(eq(schema.donations.id, data.donationId), eq(schema.donations.status, "pending")))
      .returning({ campaignId: schema.donations.campaignId, amount: schema.donations.amount });

    if (!row) return { ok: false, message: "This donation was already reviewed." };

    await audit({
      actorId: user.id,
      action: `donation.${data.decision}`,
      entityType: "donation",
      entityId: data.donationId,
      changes: { amount: row.amount, note: data.note },
    });

    revalidatePath("/admin/donations");
    revalidatePath("/transparency");
    revalidatePath("/campaigns", "layout");
    revalidatePath("/");
    return { ok: true, message: data.decision === "confirmed" ? "Donation confirmed." : "Donation rejected." };
  });
}
