import "server-only";
import { getDb, schema } from "@/db";

export async function audit(entry: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
}) {
  await getDb().insert(schema.auditLogs).values(entry);
}
