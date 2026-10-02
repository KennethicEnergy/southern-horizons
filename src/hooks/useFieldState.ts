"use client";

import { useField } from "formik";

/** Formik state for one field: the props to spread on the input, and its error once the field has been touched. */
export const useFieldState = (name: string) => {
  const [field, { touched, error }] = useField(name);
  return { field, error: touched ? error : undefined };
};
