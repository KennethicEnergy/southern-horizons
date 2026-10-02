"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inviteSchema, type InviteValues } from "@/lib/validations/user";
import { inviteUser } from "@/actions/users";
import { DEFAULT_ROLE, ROLE_OPTIONS } from "@/config/roles";
import { FormAlert, SelectField, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function InviteForm() {
  const router = useRouter();
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  return (
    <Formik<InviteValues>
      initialValues={{ name: "", email: "", role: DEFAULT_ROLE }}
      validationSchema={toFormikValidationSchema(inviteSchema)}
      onSubmit={async (values, { resetForm, setErrors }) => {
        setStatus(null);
        const res = await inviteUser(values);
        if (res.ok) {
          resetForm();
          setStatus({ tone: "success", text: res.message ?? "Invited." });
          router.refresh();
        } else {
          setStatus({ tone: "error", text: res.message });
          if (res.fieldErrors) setErrors(res.fieldErrors);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          <div className="grid gap-5 md:grid-cols-[1fr_1.3fr_0.8fr]">
            <TextField name="name" label="Name" autoComplete="off" />
            <TextField name="email" label="Google email" type="email" autoComplete="off" hint="The address they sign in to Google with." />
            <SelectField name="role" label="Position" options={ROLE_OPTIONS} />
          </div>
          {status ? <FormAlert tone={status.tone}>{status.text}</FormAlert> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Inviting…" : "Invite"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
