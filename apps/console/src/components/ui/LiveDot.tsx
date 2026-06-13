import { COLORS } from "@/lib/theme";

interface LiveDotProps {
  /** Online → pulsing accent/ok; offline → static danger. */
  live?: boolean;
  /** Override the dot color. */
  color?: string;
  size?: number;
  /** Optional label (e.g. "LIVE" / "OFFLINE"). */
  label?: string;
  className?: string;
}

/**
 * LiveDot — a pulsing telemetry dot with a soft halo. The heartbeat of the
 * cockpit: green/pulsing when the control plane answers, rose/static when not.
 */
export function LiveDot({
  live = true,
  color,
  size = 8,
  label,
  className = "",
}: LiveDotProps) {
  const c = color ?? (live ? COLORS.ok : COLORS.danger);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="relative inline-flex"
        style={{ width: size, height: size }}
        aria-hidden
      >
        {live && (
          <span
            className="absolute inset-0 rounded-full opacity-60 animate-[pulse-dot_1.8s_ease-in-out_infinite]"
            style={{ background: c }}
          />
        )}
        <span
          className="relative inline-block rounded-full"
          style={{
            width: size,
            height: size,
            background: c,
            boxShadow: `0 0 8px -1px ${c}`,
          }}
        />
      </span>
      {label && (
        <span className="metric text-[10px] tracking-wider" style={{ color: c }}>
          {label}
        </span>
      )}
    </span>
  );
}
