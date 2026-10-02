import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import { HorizonMark } from "@/components/site/horizon-mark";
import { LoginForm } from "@/components/forms/login-form";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-fields";
import { loginWithGoogle } from "@/actions/auth";
import { googleEnabled } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

/** Auth.js and our signIn callback redirect here with ?error=… */
const errorMessages: Record<string, string> = {
  NotInvited: "This Google account hasn't been invited. Ask an admin to add your email to the members list.",
  GoogleEmailUnverified: "Google hasn't verified this account's email address, so we can't sign you in with it.",
  AccessDenied: "This account isn't allowed to sign in. Ask an admin to check your membership.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; callbackUrl?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  const { error, callbackUrl } = await searchParams;
  const errorMessage = error ? (errorMessages[error] ?? "Sign-in didn't work. Try again, or use your email and password.") : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sky px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <HorizonMark />
          <span className="font-display text-lg font-semibold">{site.name}</span>
        </Link>
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-[0_1px_0_var(--color-line)]">
          <h1 className="text-2xl font-semibold">Volunteer sign in</h1>
          <p className="mt-1.5 text-ink-soft">For members managing posts and donations.</p>
          {errorMessage ? (
            <div className="mt-6">
              <FormAlert tone="error">{errorMessage}</FormAlert>
            </div>
          ) : null}
          {googleEnabled ? (
            <>
              <form action={loginWithGoogle} className="mt-6">
                <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
                <Button type="submit" variant="outline" size="lg" className="w-full">
                  <HugeiconsIcon icon={GoogleIcon} size={20} aria-hidden="true" />
                  Continue with Google
                </Button>
              </form>
              <div className="my-6 flex items-center gap-3 text-sm text-ink-soft">
                <span className="h-px flex-1 bg-line" />
                or use your password
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          ) : null}
          <div className={googleEnabled ? "" : "mt-6"}>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">Need an account? Ask an admin to invite you.</p>
      </div>
    </div>
  );
}
