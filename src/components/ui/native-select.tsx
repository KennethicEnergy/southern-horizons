import type { ComponentProps } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./icon";

type NativeSelectProps = ComponentProps<"select"> & { wrapperClassName?: string };

/**
 * A native <select> with our own chevron. The browser's built-in arrow ignores padding and sits
 * against the border, and its line-height can't be set, so we turn it off and reserve pr-10 for ours.
 * Style it from outside with left padding (pl-*), never px-*, so the chevron's space stays reserved.
 */
export const NativeSelect = ({ className = "", wrapperClassName = "", children, ...props }: NativeSelectProps) => (
  <div className={`relative ${wrapperClassName}`}>
    <select className={`w-full cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed ${className}`} {...props}>
      {children}
    </select>
    <Icon icon={ArrowDown01Icon} size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
  </div>
);
