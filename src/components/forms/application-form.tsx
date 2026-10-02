"use client";

import Link from "next/link";
import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useState } from "react";
import { applicationSchema, type ApplicationValues } from "@/lib/validations/application";
import { submitApplication } from "@/actions/applications";
import { CheckboxField, FormAlert, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormValues = Omit<ApplicationValues, "consent"> & { consent: boolean };

export function ApplicationForm() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="rounded-2xl bg-leaf-mist p-8 text-leaf">
        <h2 className="text-2xl font-semibold">Application sent</h2>
        <p className="mt-2 text-ink">{done}</p>
        <Link href="/" className="mt-6 inline-block text-sea hover:underline">
          Back to the home page
        </Link>
      </div>
    );
  }

  return (
    <Formik<FormValues>
      initialValues={{ name: "", email: "", phone: "", message: "", consent: false, website: "" }}
      validationSchema={toFormikValidationSchema(applicationSchema)}
      onSubmit={async (values, { setErrors }) => {
        setError(null);
        const res = await submitApplication(values as ApplicationValues);
        if (res.ok) return setDone(res.message ?? "Thanks for applying!");
        setError(res.message);
        if (res.fieldErrors) setErrors(res.fieldErrors);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Full name" autoComplete="name" />
            <TextField name="phone" label="Mobile number (optional)" type="tel" autoComplete="tel" />
          </div>
          <TextField
            name="email"
            label="Google email"
            type="email"
            autoComplete="email"
            hint="Use the Gmail or Google account you'll sign in with once approved."
          />
          <TextArea
            name="message"
            label="How would you like to help?"
            rows={5}
            placeholder="e.g. writing posts, taking photos, handling donations, joining drives…"
          />
          <CheckboxField name="consent" label="I agree that Southern Horizons can keep these details to review my application." />
          {/* Honeypot, hidden from people and screen readers */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {error ? <FormAlert tone="error">{error}</FormAlert> : null}
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send application"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
