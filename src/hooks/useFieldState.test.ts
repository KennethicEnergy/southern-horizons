// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { Formik } from "formik";
import { renderHook } from "@/test/render-hook";
import { useFieldState } from "@/hooks/useFieldState";

const formWith = ({ touched }: { touched: boolean }) => {
  const FormWrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      Formik,
      {
        initialValues: { email: "juan@" },
        initialErrors: { email: "Enter a valid email address." },
        initialTouched: { email: touched },
        onSubmit: () => {},
      },
      children,
    );
  return FormWrapper;
};

describe("useFieldState", () => {
  it("returns the field's Formik props", () => {
    const { result } = renderHook(({ name }) => useFieldState(name), { name: "email" }, { wrapper: formWith({ touched: false }) });
    expect(result.current?.field).toMatchObject({ name: "email", value: "juan@" });
  });

  it("hides the error until the field is touched", () => {
    const { result } = renderHook(({ name }) => useFieldState(name), { name: "email" }, { wrapper: formWith({ touched: false }) });
    expect(result.current?.error).toBeUndefined();
  });

  it("shows the error once the field is touched", () => {
    const { result } = renderHook(({ name }) => useFieldState(name), { name: "email" }, { wrapper: formWith({ touched: true }) });
    expect(result.current?.error).toBe("Enter a valid email address.");
  });
});
