import { z } from "zod";
import { assignableRoleSchema } from "./user";


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
  /** Honeypot: real people never see or fill this. Not length-checked, so the action can quietly ignore bots. */
  website: z.string().max(500).optional(),
});

export type ApplicationValues = z.infer<typeof applicationSchema>;

export const applicationReviewSchema = z.discriminatedUnion("decision", [
  z.object({ applicationId: z.uuid(), decision: z.literal("approved"), role: assignableRoleSchema }),
  z.object({ applicationId: z.uuid(), decision: z.literal("rejected") }),
]);

export type ApplicationReview = z.infer<typeof applicationReviewSchema>;
