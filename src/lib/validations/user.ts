import { z } from "zod";
import { ASSIGNABLE_ROLES } from "@/config/roles";

/** A position the backoffice may hand out. Super Admin is refused here, even from a crafted request. */
export const assignableRoleSchema = z.enum(ASSIGNABLE_ROLES, { message: "Pick a position." });

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Enter their name.").max(100),
  email: z.email("Enter a valid email address."),
  role: assignableRoleSchema,
});

export type InviteValues = z.infer<typeof inviteSchema>;

export const setRoleSchema = z.object({
  userId: z.uuid(),
  role: assignableRoleSchema,
});

export const setActiveSchema = z.object({
  userId: z.uuid(),
  active: z.boolean(),
});
