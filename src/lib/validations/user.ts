import { z } from "zod";
import { ROLE_KEYS } from "@/config/roles";

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Enter their name.").max(100),
  email: z.email("Enter a valid email address."),
  role: z.enum(ROLE_KEYS, { message: "Pick a position." }),
});

export type InviteValues = z.infer<typeof inviteSchema>;

export const setRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(ROLE_KEYS, { message: "Pick a position." }),
});

export const setActiveSchema = z.object({
  userId: z.uuid(),
  active: z.boolean(),
});
