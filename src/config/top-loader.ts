import type { NextTopLoaderProps } from "nextjs-toploader";
import { brandColors } from "./brand";

/** Route-change progress bar. Sea reads clearly against the white headers; the spinner is dropped as noise. */
export const topLoaderProps = {
  color: brandColors.sea,
  height: 3,
  showSpinner: false,
  shadow: false,
} as const satisfies NextTopLoaderProps;
