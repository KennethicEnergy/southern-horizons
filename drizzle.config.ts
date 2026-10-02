import { defineConfig } from "drizzle-kit";

// Same env file as `pnpm db:seed`; variables already set in the shell win.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. CI): rely on the environment.
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct connection; the pooled one (PgBouncer) breaks session state.
  dbCredentials: { url: (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)! },
  strict: true,
});
