import { AUTONOMY_COLORS, AUTONOMY_LABELS, COLORS } from "@/lib/theme";

interface AutonomyMeterProps {
  /** Autonomy level 1..5. */
  level: number;
  /** Show the textual level label (e.g. "act · approval"). */
  showLabel?: boolean;
  /** Segment size. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * AutonomyMeter — a five-segment bar (L1–L5) on the violet autonomy ramp.
 * Filled segments up to `level` glow; the rest are dim rails. The visual
 * shorthand for "how much leash does this agent have".
 */
export function AutonomyMeter({
  level,
  showLabel = true,
  size = "md",
  className = "",
}: AutonomyMeterProps) {
  const lvl = Math.max(1, Math.min(5, Math.round(level || 1)));
  const segW = size === "sm" ? 10 : 16;
  const segH = size === "sm" ? 5 : 6;
  const gap = 2;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center" style={{ gap }}>
        {[1, 2, 3, 4, 5].map((i) => {
          const on = i <= lvl;
          const color = AUTONOMY_COLORS[lvl];
          return (
            <span
              key={i}
              className="rounded-[2px]"
              style={{
                width: segW,
                height: segH,
                background: on ? color : COLORS.lineStrong,
                boxShadow: on ? `0 0 6px -1px ${color}` : "none",
                transition: "background 0.3s",
              }}
            />
          );
        })}
      </div>
      <span
        className="metric text-[11px]"
        style={{ color: AUTONOMY_COLORS[lvl] }}
      >
        L{lvl}
      </span>
      {showLabel && (
        <span className="text-[11px] text-ink-faint">{AUTONOMY_LABELS[lvl]}</span>
      )}
    </div>
  );
}
