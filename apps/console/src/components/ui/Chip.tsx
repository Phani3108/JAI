import type { ReactNode } from "react";

import { COLORS, withAlpha } from "@/lib/theme";

interface ChipProps {
  children: ReactNode;
  /** Optional leading icon / glyph node. */
  icon?: ReactNode;
  /** Tint color (defaults to neutral ink). */
  color?: string;
  /** Native title tooltip (e.g. a citation snippet). */
  title?: string;
  className?: string;
}

/**
 * Chip — a compact tag for skills, citations, categories. Smaller and quieter
 * than a Pill; meant to appear in clusters. Mono, hairline, faintly tinted.
 */
export function Chip({
  children,
  icon,
  color = COLORS.inkMuted,
  title,
  className = "",
}: ChipProps) {
  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center gap-1 truncate rounded-md border px-1.5 py-0.5 font-mono text-[10px] leading-none ${className}`}
      style={{
        color,
        borderColor: withAlpha(color, 0.28),
        background: withAlpha(color, 0.07),
      }}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
