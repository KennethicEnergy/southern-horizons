import "server-only";
import { auth } from "@/auth";
import { can, canPerformAction } from "@/lib/rbac";
import { AuthError, ForbiddenError } from "@/lib/errors";
import type { ContentAction, Permission, Role } from "@/types/rbac";

/** `image` is the Google profile photo; Auth.js carries it in the token as `picture`. Password accounts have none. */
export type SessionUser = { id: string; role: Role; name?: string | null; email?: string | null; image?: string | null };

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return session.user;
};

export const requireUser = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
};

/** Layer 2: every server action and route handler calls this or requireAction. */
export const requirePermission = async (permission: Permission): Promise<SessionUser> => {
  const user = await requireUser();
  if (!can(user.role, permission)) throw new ForbiddenError();
  return user;
};

/** Checks the position may do the action at all. Whether it then needs approval is the caller's next question. */
export const requireAction = async (action: ContentAction): Promise<SessionUser> => {
  const user = await requireUser();
  if (!canPerformAction(user.role, action)) throw new ForbiddenError(`Your position can't ${action} content.`);
  return user;
};
