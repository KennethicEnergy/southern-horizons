import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(120),
  email: z.email("Enter a valid email address."),
  subject: z.string().trim().min(3, "Add a subject.").max(160),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters).").max(2000),
  /** Honeypot: real people never see or fill this. Not length-checked, so the action can quietly ignore bots. */
  website: z.string().max(500).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
