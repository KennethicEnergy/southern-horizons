"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { login } from "@/actions/auth";
import { FormAlert, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { actionIcons } from "@/config/icons";

export const LoginForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Only follow callback URLs that point back into this site's backoffice.
  const nextPath = () => {
    try {
      const url = new URL(params.get("callbackUrl") ?? "/admin", window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith("/admin")) return url.pathname + url.search;
    } catch {}
    return "/admin";
  };

  return (
    <Formik<LoginValues>
      initialValues={{ email: "", password: "" }}
      validationSchema={toFormikValidationSchema(loginSchema)}
      onSubmit={async (values) => {
        setError(null);
        const res = await login(values);
        if (!res.ok) return setError(res.message);
        router.replace(nextPath());
        router.refresh();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          <TextField name="email" label="Email" type="email" autoComplete="email" />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" />
          {error ? <FormAlert tone="error">{error}</FormAlert> : null}
          <Button type="submit" size="lg" icon={actionIcons.signIn} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
