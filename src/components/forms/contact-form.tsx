"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useState } from "react";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";
import { sendContactMessage } from "@/actions/contact";
import { FormAlert, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const initialValues: ContactValues = { name: "", email: "", subject: defaultSubject, message: "", website: "" };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(contactSchema)}
      onSubmit={async (values, { resetForm, setErrors }) => {
        setStatus(null);
        const res = await sendContactMessage(values);
        if (res.ok) {
          resetForm();
          setStatus({ tone: "success", text: res.message ?? "Message sent." });
        } else {
          setStatus({ tone: "error", text: res.message });
          if (res.fieldErrors) setErrors(res.fieldErrors);
        }
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
          {status ? <FormAlert tone={status.tone}>{status.text}</FormAlert> : null}
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
