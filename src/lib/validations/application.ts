import { z } from "zod";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/db/schema";

const roles = Object.keys(ROLE_LABELS) as [Role, ...Role[]];

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(120),
  email: z.email("Enter the Gmail or Google account you'll sign in with."),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Use numbers only, e.g. 0917 123 4567.")
    .optional(),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters).").max(1500),
  consent: z.literal(true, { message: "Please agree so we can keep your application on file." }),
  /** Honeypot: real people never see or fill this. */
  website: z.string().max(0).optional(),
});

export type ApplicationValues = z.infer<typeof applicationSchema>;

export const applicationReviewSchema = z.discriminatedUnion("decision", [
  z.object({ applicationId: z.uuid(), decision: z.literal("approved"), role: z.enum(roles) }),
  z.object({ applicationId: z.uuid(), decision: z.literal("rejected") }),
]);

export type ApplicationReview = z.infer<typeof applicationReviewSchema>;
