import "server-only";
import { ZodError } from "zod";
import { AuthError, ForbiddenError, zodFieldErrors, type ActionResult } from "@/lib/errors";

/** Converts thrown errors into an ActionResult so forms can display them. */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError || err instanceof ForbiddenError) return { ok: false, message: err.message };
    if (err instanceof ZodError) {
      return { ok: false, message: "Check the highlighted fields.", fieldErrors: zodFieldErrors(err.issues) };
    }
    console.error(err);
    return { ok: false, message: "Something went wrong on our side. Try again." };
  }
}
