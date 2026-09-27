import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Layer 1 of 3: gate /admin to signed-in users.
 * Permission checks happen again in server actions and route handlers (layer 2),
 * and the UI hides controls the user can't use (layer 3, cosmetic only).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
