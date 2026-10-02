"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useState } from "react";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";
import { sendContactMessage } from "@/actions/contact";
import { actionIcons } from "@/config/icons";
import { toastResult } from "@/stores/toast-store";
import { FormAlert, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

/** Errors stay beside the form so they can be fixed; a sent message clears it and confirms with a toast. */
export const ContactForm = ({ defaultSubject = "" }: { defaultSubject?: string }) => {
  const [error, setError] = useState<string | null>(null);
  const initialValues: ContactValues = { name: "", email: "", subject: defaultSubject, message: "", website: "" };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(contactSchema)}
      onSubmit={async (values, { resetForm, setErrors }) => {
        setError(null);
        const res = await sendContactMessage(values);
        if (!res.ok) {
          setError(res.message);
          if (res.fieldErrors) setErrors(res.fieldErrors);
          return;
        }
        resetForm();
        toastResult(res, "Message sent.");
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Name" autoComplete="name" />
            <TextField name="email" label="Email" type="email" autoComplete="email" />
          </div>
          <TextField name="subject" label="Subject" />
          <TextArea name="message" label="Message" rows={6} />
          {/* Honeypot, hidden from people and screen readers */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {error ? <FormAlert tone="error">{error}</FormAlert> : null}
          <Button type="submit" size="lg" icon={actionIcons.send} className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
