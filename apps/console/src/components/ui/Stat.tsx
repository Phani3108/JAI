import type { ReactNode } from "react";

import { COLORS } from "@/lib/theme";
import { Sparkline } from "./Sparkline";

interface StatProps {
  /** Caption above the value. */
  label: ReactNode;
  /** The headline number / string. Rendered in mono tabular figures. */
  value: ReactNode;
  /** Optional trailing unit (e.g. "usd", "ms", "%"). */
  unit?: string;
  /** Optional signed delta; sign drives the up/down color + arrow. */
  delta?: number;
  /** Format the delta (default: +/- with one decimal). */
  formatDelta?: (d: number) => string;
  /** Optional sparkline series shown to the right. */
  spark?: number[];
  /** Sparkline / accent color. */
  color?: string;
  className?: string;
}

/**
 * Stat — a single instrument readout: label, big mono value, optional unit,
 * delta chip, and a trailing sparkline. The console's atomic metric tile.
 */
export function Stat({
  label,
  value,
  unit,
  delta,
  formatDelta = (d) => `${d >= 0 ? "+" : ""}${d.toFixed(1)}`,
  spark,
  color = COLORS.accent,
  className = "",
}: StatProps) {
  const deltaColor =
    delta === undefined || delta === 0
      ? COLORS.inkFaint
      : delta > 0
        ? COLORS.ok
        : COLORS.danger;

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <div className="label-cap">{label}</div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="metric text-2xl font-semibold text-ink">{value}</span>
          {unit && <span className="text-xs text-ink-faint">{unit}</span>}
        </div>
        {delta !== undefined && (
          <div
            className="metric mt-1 flex items-center gap-1 text-[11px]"
            style={{ color: deltaColor }}
          >
            <span aria-hidden>{delta > 0 ? "▲" : delta < 0 ? "▼" : "•"}</span>
            {formatDelta(delta)}
          </div>
        )}
      </div>
      {spark && spark.length > 1 && (
        <Sparkline data={spark} color={color} className="mt-0.5 shrink-0" />
      )}
    </div>
  );
}
