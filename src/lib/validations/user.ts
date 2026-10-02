import { z } from "zod";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/db/schema";

const roles = Object.keys(ROLE_LABELS) as [Role, ...Role[]];

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Enter their name.").max(100),
  email: z.email("Enter a valid email address."),
  role: z.enum(roles, { message: "Pick a role." }),
});

export type InviteValues = z.infer<typeof inviteSchema>;

export const setRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(roles, { message: "Pick a role." }),
});

export const setActiveSchema = z.object({
  userId: z.uuid(),
  active: z.boolean(),
});
