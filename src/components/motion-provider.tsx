"use client";

import { MotionConfig } from "motion/react";

/**
 * App-wide motion defaults. `reducedMotion="user"` makes every motion
 * component honour the OS "reduce motion" setting automatically.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
