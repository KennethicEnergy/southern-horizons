import "server-only";
import { and, eq, isNull, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isSingleHolderRole, isSingleHolderViolation, positionTakenMessage } from "@/lib/positions";
import type { Role } from "@/types/rbac";

const { users } = schema;

/**
 * Whoever holds a one-person position (Super Admin, President), other than `exceptUserId`.
 * Deactivated members keep their seat until someone changes their position.
 */
export const findPositionHolder = async (role: Role, exceptUserId?: string) => {
  if (!isSingleHolderRole(role)) return null;
  const [holder] = await getDb()
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.role, role), isNull(users.deletedAt), exceptUserId ? ne(users.id, exceptUserId) : undefined))
    .limit(1);
  return holder ?? null;
};

type GuardedWrite<T> = { ok: true; value: T } | { ok: false; message: string };

/**
 * Runs a write that may give someone `role`. If two changes raced past the checks and the
 * users_single_holder_idx index turned this one away, returns the friendly refusal instead of throwing.
 */
export const guardPositionWrite = async <T>(role: Role, write: () => Promise<T>): Promise<GuardedWrite<T>> => {
  try {
    return { ok: true, value: await write() };
  } catch (error) {
    if (isSingleHolderViolation(error)) return { ok: false, message: positionTakenMessage(role) };
    throw error;
  }
};
