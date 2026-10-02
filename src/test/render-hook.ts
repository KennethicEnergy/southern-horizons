import { act, createElement, type ComponentType, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

type RenderHookOptions = {
  /** Wraps the hook in a provider, e.g. a <Formik> form. */
  wrapper?: ComponentType<{ children: ReactNode }>;
};

/**
 * Minimal hook renderer for tests that run in a DOM environment
 * (add `// @vitest-environment happy-dom` at the top of the test file).
 */
export const renderHook = <P extends object, R>(useHook: (props: P) => R, initialProps: P, { wrapper }: RenderHookOptions = {}) => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(document.createElement("div"));
  const result: { current: R | undefined } = { current: undefined };

  const Probe = (props: P) => {
    result.current = useHook(props);
    return null;
  };

  const rerender = (props: P) =>
    act(() => {
      const probe = createElement(Probe, props);
      root.render(wrapper ? createElement(wrapper, null, probe) : probe);
    });
  rerender(initialProps);

  return { result, rerender, unmount: () => act(() => root.unmount()) };
};
