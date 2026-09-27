import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HorizonMark } from "@/components/site/horizon-mark";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
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
          <div className="mt-6">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">Need an account? Ask an admin to add you.</p>
      </div>
    </div>
  );
}
