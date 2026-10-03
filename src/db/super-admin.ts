/**
 * Makes one member the Super Admin. The backoffice can't assign this position, by design.
 *
 *   pnpm db:super-admin you@example.com              uses .env.local (your dev branch)
 *   pnpm db:super-admin you@example.com --replace    moves the current Super Admin to Member first
 *
 * Against production, point it at the production env file instead:
 *   pnpm tsx --env-file=.env.production.local src/db/super-admin.ts you@example.com
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import * as schema from "./schema";
import { planSuperAdmin } from "../lib/positions";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const db = drizzle(neon(url), { schema, casing: "snake_case" });
const { users, auditLogs } = schema;

const main = async () => {
  const args = process.argv.slice(2);
  const email = args.find((arg) => !arg.startsWith("--"))?.toLowerCase();
  const replace = args.includes("--replace");
  if (!email) throw new Error("Usage: pnpm db:super-admin <email> [--replace]");

  const member = { id: users.id, name: users.name, role: users.role };
  const [target] = await db
    .select({ ...member, isActive: users.isActive })
    .from(users)
    .where(and(sql`lower(${users.email}) = ${email}`, isNull(users.deletedAt)))
    .limit(1);
  const [current] = await db
    .select(member)
    .from(users)
    .where(and(eq(users.role, "superAdmin"), isNull(users.deletedAt)))
    .limit(1);

  const plan = planSuperAdmin({ target: target ?? null, current: current ?? null, replace });
  if (!plan.ok) throw new Error(plan.error);
  const promoted = target!;

  // One batch is one transaction: the old Super Admin steps down before the new one steps up,
  // so the one-holder index never sees two.
  const demote: BatchItem<"pg">[] = plan.demote
    ? [
        db.update(users).set({ role: "member" }).where(eq(users.id, plan.demote)),
        db.insert(auditLogs).values({
          actorId: null,
          action: "user.role",
          entityType: "user",
          entityId: plan.demote,
          changes: { from: "superAdmin", to: "member", via: "command line" },
        }),
      ]
    : [];
  const [head, ...rest]: BatchItem<"pg">[] = [
    ...demote,
    db.update(users).set({ role: "superAdmin" }).where(eq(users.id, promoted.id)),
    db.insert(auditLogs).values({
      actorId: null,
      action: "user.role",
      entityType: "user",
      entityId: promoted.id,
      changes: { from: promoted.role, to: "superAdmin", via: "command line" },
    }),
  ];
  await db.batch([head!, ...rest]);

  if (plan.demote) console.log(`${current!.name} moved from Super Admin to Member.`);
  console.log(`${promoted.name} is now the Super Admin. It applies within 5 minutes, or at their next sign-in.`);
  if (promoted.role === "president") console.log("The President seat is now empty. Appoint someone under Backoffice → Members.");
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
