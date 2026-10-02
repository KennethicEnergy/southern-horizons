"use client";

/** TEMPORARY: see the note on `suggestions` in src/db/schema.ts. */

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { suggestionSchema, type SuggestionValues } from "@/lib/validations/suggestion";
import { addSuggestion } from "@/actions/suggestions";
import { FormAlert, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function SuggestionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <Formik<SuggestionValues>
      initialValues={{ title: "", description: "" }}
      validationSchema={toFormikValidationSchema(suggestionSchema)}
      onSubmit={async (values, { resetForm, setErrors }) => {
        setError(null);
        const res = await addSuggestion(values);
        if (!res.ok) {
          setError(res.message);
          if (res.fieldErrors) setErrors(res.fieldErrors);
          return;
        }
        resetForm();
        router.refresh();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4" noValidate>
          <TextField name="title" label="Title" placeholder="e.g. Add a photo gallery to event pages" />
          <TextArea name="description" label="Description (optional)" rows={3} placeholder="What should change, and why?" />
          {error ? <FormAlert tone="error">{error}</FormAlert> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add suggestion"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
