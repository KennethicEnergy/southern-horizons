import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | undefined;

/**
 * Lazily created so `next build` works without DATABASE_URL
 * (pages that query the DB are rendered at request time).
 */
export function getDb(): Database {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    instance = drizzle(neon(url), { schema, casing: "snake_case" });
  }
  return instance;
}

export { schema };

/** Lets public pages build without a database (e.g. first CI build); they fill in on revalidation. */
export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);
