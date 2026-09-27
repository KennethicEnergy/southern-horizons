import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/db/schema";

/**
 * Edge-safe config shared by the proxy (route gate) and the full Auth.js setup.
 * No database or bcrypt imports here.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
