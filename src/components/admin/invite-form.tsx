"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inviteSchema, type InviteValues } from "@/lib/validations/user";
import { inviteUser } from "@/actions/users";
import { DEFAULT_ROLE, ROLE_OPTIONS } from "@/config/roles";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { FormAlert, SelectField, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export const InviteForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <Formik<InviteValues>
      initialValues={{ name: "", email: "", role: DEFAULT_ROLE }}
      validationSchema={toFormikValidationSchema(inviteSchema)}
      onSubmit={async (values, { resetForm, setErrors }) => {
        setError(null);
        const res = await inviteUser(values);
        if (!res.ok) {
          setError(res.message);
          if (res.fieldErrors) setErrors(res.fieldErrors);
          return;
        }
        resetForm();
        toastResult(res, "Invited.");
        router.refresh();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          <div className="grid gap-5 md:grid-cols-[1fr_1.3fr_0.8fr]">
            <TextField name="name" label="Name" autoComplete="off" />
            <TextField name="email" label="Google email" type="email" autoComplete="off" hint="The address they sign in to Google with." />
            <SelectField name="role" label="Position" options={ROLE_OPTIONS} />
          </div>
          {error ? <FormAlert tone="error">{error}</FormAlert> : null}
          <Button type="submit" icon={actionIcons.join} disabled={isSubmitting}>
            {isSubmitting ? "Inviting…" : "Invite"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
