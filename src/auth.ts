import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { getDb, schema } from "@/db";
import { loginSchema } from "@/lib/validations/auth";

const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const db = getDb();
        const [user] = await db
          .select()
          .from(schema.users)
          .where(
            and(
              sql`lower(${schema.users.email}) = ${parsed.data.email.toLowerCase()}`,
              isNull(schema.users.deletedAt),
              eq(schema.users.isActive, true),
            ),
          )
          .limit(1);

        if (!user) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Role lives in the JWT, so re-read it from the database every few minutes.
     * A demoted or deactivated user loses access without waiting for token expiry.
     */
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);
      const stale = !token.roleCheckedAt || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS;
      if (token.id && stale && !params.user) {
        const [fresh] = await getDb()
          .select({ role: schema.users.role, isActive: schema.users.isActive, deletedAt: schema.users.deletedAt })
          .from(schema.users)
          .where(eq(schema.users.id, token.id))
          .limit(1);
        if (!fresh || !fresh.isActive || fresh.deletedAt) return null;
        token.role = fresh.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
  },
});
