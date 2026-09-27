import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError, ForbiddenError, zodFieldErrors } from "@/lib/errors";

/** Maps thrown errors to consistent JSON responses for API routes. */
export function withErrors<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) return NextResponse.json({ message: err.message }, { status: 401 });
      if (err instanceof ForbiddenError) return NextResponse.json({ message: err.message }, { status: 403 });
      if (err instanceof ZodError) {
        const fieldErrors = zodFieldErrors(err.issues);
        return NextResponse.json(
          { message: Object.values(fieldErrors)[0] ?? "Check the highlighted fields.", fieldErrors },
          { status: 422 },
        );
      }
      console.error(err);
      return NextResponse.json({ message: "Something went wrong on our side. Try again." }, { status: 500 });
    }
  };
}
