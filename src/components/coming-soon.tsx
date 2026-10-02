"use client";

import { motion } from "motion/react";
import { Heart } from "@/components/ui/heart";

const ease = [0.22, 1, 0.36, 1] as const;

/** Temporary home screen until the creator flow lands (PR 4). */
export function ComingSoon() {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_40%,var(--color-blush)_0%,transparent_70%)]"
      />

      <div className="flex max-w-sm flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
          className="text-rose"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart size={44} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="mt-8 font-display text-4xl leading-tight font-light text-wine italic sm:text-5xl"
        >
          Something sweet is on its way
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="mt-4 text-base text-muted"
        >
          Little surprises for the people you love.
        </motion.p>
      </div>
    </main>
  );
}
