import "server-only";
import { auth } from "@/auth";
import { can, type Permission } from "@/lib/rbac";
import { AuthError, ForbiddenError } from "@/lib/errors";
import type { Role } from "@/db/schema";

export type SessionUser = { id: string; role: Role; name?: string | null; email?: string | null };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return session.user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
}

/** Layer 2: every server action and route handler calls this. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) throw new ForbiddenError();
  return user;
}
