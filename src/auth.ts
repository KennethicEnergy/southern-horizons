import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { getDb, schema } from "@/db";
import { loginSchema } from "@/lib/validations/auth";
import { isRole } from "@/lib/rbac";

const ROLE_REFRESH_MS = 5 * 60 * 1000;

/** Google sign-in is offered only once AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are set. */
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/** Invite-only: an active, non-deleted user row must already exist for this email. */
async function findInvitedUser(email: string) {
  const [user] = await getDb()
    .select()
    .from(schema.users)
    .where(
      and(
        sql`lower(${schema.users.email}) = ${email.toLowerCase()}`,
        isNull(schema.users.deletedAt),
        eq(schema.users.isActive, true),
      ),
    )
    .limit(1);
  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(googleEnabled ? [Google] : []),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await findInvitedUser(parsed.data.email);
        // Google-only members have no password to check.
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await getDb().update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /** Turns away Google accounts nobody invited. Returning a path redirects there. */
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified !== true) return "/login?error=GoogleEmailUnverified";
      return (await findInvitedUser(profile.email)) ? true : "/login?error=NotInvited";
    },
    /**
     * Role lives in the JWT, so re-read it from the database every few minutes.
     * A demoted or deactivated user loses access without waiting for token expiry.
     */
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);
      // Google hands us its own account id; swap in our user's id and role.
      if (params.account?.provider === "google" && params.user?.email) {
        const user = await findInvitedUser(params.user.email);
        if (!user) return null;
        await getDb().update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.roleCheckedAt = Date.now();
        return token;
      }
      // An unknown role (e.g. issued before positions were renamed) is re-read right away.
      const stale = !token.roleCheckedAt || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS || !isRole(token.role);
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
