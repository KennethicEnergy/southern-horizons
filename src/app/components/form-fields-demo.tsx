"use client";

import { Form, Formik } from "formik";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/ui/form-fields";
import { Specimen } from "./showcase";

const campaigns = [
  { value: "bags", label: "School bags 2026" },
  { value: "cleanup", label: "Coastal clean-up" },
];

/**
 * Field states come from Formik: `initialErrors` + `initialTouched` show the error state
 * the way a failed submit would. Names double as element ids, so each one is unique.
 */
export function FormFieldsDemo() {
  return (
    <Formik
      initialValues={{
        textEmpty: "",
        textHint: "",
        textFilled: "Juan dela Cruz",
        textError: "juan@",
        textDisabled: "Locked value",
        areaEmpty: "",
        areaError: "Hi",
        selectPlaceholder: "",
        selectFilled: "bags",
        selectError: "",
        checkOff: false,
        checkOn: true,
      }}
      initialErrors={{
        textError: "Enter a valid email address.",
        areaError: "Tell us a bit more (at least 10 characters).",
        selectError: "Choose a campaign.",
      }}
      initialTouched={{ textError: true, areaError: true, selectError: true }}
      onSubmit={() => {}}
    >
      <Form className="grid gap-6 md:grid-cols-2">
        <Specimen label="TextField — empty with placeholder">
          <TextField name="textEmpty" label="Full name" placeholder="e.g. Maria Santos" />
        </Specimen>
        <Specimen label="TextField — with hint">
          <TextField name="textHint" label="Reference number" hint="The 13-digit number on your GCash or bank receipt." />
        </Specimen>
        <Specimen label="TextField — filled">
          <TextField name="textFilled" label="Full name" />
        </Specimen>
        <Specimen label="TextField — error">
          <TextField name="textError" label="Email" type="email" hint="Hidden while an error shows." />
        </Specimen>
        <Specimen label="TextField — disabled">
          <TextField name="textDisabled" label="Campaign" disabled />
        </Specimen>
        <Specimen label="SelectField — placeholder">
          <SelectField name="selectPlaceholder" label="Campaign" placeholder="Choose one" options={campaigns} />
        </Specimen>
        <Specimen label="SelectField — selected">
          <SelectField name="selectFilled" label="Campaign" options={campaigns} />
        </Specimen>
        <Specimen label="SelectField — error">
          <SelectField name="selectError" label="Campaign" placeholder="Choose one" options={campaigns} />
        </Specimen>
        <Specimen label="TextArea — empty">
          <TextArea name="areaEmpty" label="Message" placeholder="How can we help?" rows={3} />
        </Specimen>
        <Specimen label="TextArea — error">
          <TextArea name="areaError" label="Message" rows={3} />
        </Specimen>
        <Specimen label="CheckboxField — unchecked / checked">
          <div className="space-y-3">
            <CheckboxField name="checkOff" label="Give anonymously" />
            <CheckboxField name="checkOn" label="Email me when my donation is confirmed" />
          </div>
        </Specimen>
      </Form>
    </Formik>
  );
}
