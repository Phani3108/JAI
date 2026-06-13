import type { ReactNode } from "react";

import {
  COLORS,
  OUTCOME_COLORS,
  STATUS_COLORS,
  withAlpha,
  type Outcome,
  type Status,
} from "@/lib/theme";

type Tone = "ok" | "warn" | "danger" | "info" | "accent" | "neutral" | "autonomy";

const TONE_COLORS: Record<Tone, string> = {
  ok: COLORS.ok,
  warn: COLORS.warn,
  danger: COLORS.danger,
  info: COLORS.info,
  accent: COLORS.accent,
  autonomy: COLORS.autonomy,
  neutral: COLORS.inkFaint,
};

interface PillProps {
  children: ReactNode;
  /** Pick a semantic tone, OR pass `status` / `outcome` to derive it. */
  tone?: Tone;
  /** Derive color from an agent/part status. */
  status?: Status | string;
  /** Derive color from an audit outcome. */
  outcome?: Outcome | string;
  /** Override the color directly (e.g. a system hue). */
  color?: string;
  /** Solid filled chip vs. tinted outline (default). */
  solid?: boolean;
  className?: string;
}

/**
 * Pill — a small status badge. Color comes from `status`, `outcome`, `tone`, or an
 * explicit `color`, resolved through the shared theme so every badge agrees.
 */
export function Pill({
  children,
  tone = "neutral",
  status,
  outcome,
  color,
  solid = false,
  className = "",
}: PillProps) {
  const resolved =
    color ??
    (status !== undefined
      ? (STATUS_COLORS[status as Status] ?? COLORS.inkFaint)
      : outcome !== undefined
        ? (OUTCOME_COLORS[outcome as Outcome] ?? COLORS.inkFaint)
        : TONE_COLORS[tone]);

  const style = solid
    ? { background: resolved, color: COLORS.base, borderColor: resolved }
    : {
        background: withAlpha(resolved, 0.12),
        color: resolved,
        borderColor: withAlpha(resolved, 0.4),
      };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] leading-none tracking-wide ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
