export class AuthError extends Error {
  constructor(message = "Sign in to continue.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Your role doesn't allow this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Shape every server action returns, so Formik can map field errors back onto inputs. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
