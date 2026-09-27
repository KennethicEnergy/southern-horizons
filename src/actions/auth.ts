"use server";

import { AuthError as NextAuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { ActionResult } from "@/lib/errors";

export async function login(values: LoginValues): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Enter your email and password." };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { ok: true };
  } catch (err) {
    if (err instanceof NextAuthError) return { ok: false, message: "That email and password don't match an account." };
    throw err;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
