import type { CSSProperties } from "react";

/**
 * Inline style for a `.parallax` layer (see globals.css): how far it drifts while its scope scrolls past.
 * Positive sinks back (moves slower than the page), negative floats forward.
 */
export const parallaxStyle = (shift: number) => ({ "--parallax-shift": `${shift}px` }) as CSSProperties;
