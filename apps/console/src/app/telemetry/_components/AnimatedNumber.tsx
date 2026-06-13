"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  /** The target value. The component eases from its current display value to this. */
  value: number;
  /** Map the (eased) numeric value to display text. */
  format: (n: number) => string;
  /** Tween duration in ms. */
  duration?: number;
  className?: string;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * AnimatedNumber — eases a metric from its last value to a new one on each poll,
 * so the readout visibly "spins up" like a real instrument. Mono tabular figures
 * keep the width stable while the digits roll. Honors prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 650,
  className = "",
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (fromRef.current === value) return;

    const from = fromRef.current;
    const to = value;
    // Reduced motion → snap on the first frame (effective duration 0).
    const dur = prefersReducedMotion() ? 0 : duration;
    const start = performance.now();

    const tick = (now: number) => {
      const t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur);
      const eased = easeOutCubic(t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
