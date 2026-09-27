import { z } from "zod";

export const donationPledgeSchema = z
  .object({
    campaignId: z.uuid(),
    itemId: z.uuid("Pick what you'd like to give."),
    quantity: z.coerce.number().int("Use a whole number.").min(1, "Give at least 1.").max(1000),
    donorName: z.string().trim().max(120).optional(),
    donorEmail: z.union([z.email("Enter a valid email address."), z.literal("")]).optional(),
    isAnonymous: z.boolean(),
    referenceNumber: z
      .string()
      .trim()
      .min(4, "Enter the reference number from your payment receipt.")
      .max(64),
    message: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.isAnonymous || (v.donorName && v.donorName.length > 1), {
    path: ["donorName"],
    message: "Add your name, or choose to give anonymously.",
  });

export type DonationPledgeValues = z.infer<typeof donationPledgeSchema>;

export const donationReviewSchema = z.object({
  donationId: z.uuid(),
  decision: z.enum(["confirmed", "rejected"]),
  note: z.string().trim().max(300).optional(),
});
