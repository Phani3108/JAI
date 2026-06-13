import { COLORS, withAlpha } from "@/lib/theme";

interface GaugeRingProps {
  /** Progress, 0..1 (clamped). E.g. a scorecard pass-rate. */
  value: number;
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Arc color. Defaults to a pass-rate ramp (red → amber → green). */
  color?: string;
  /** Center label; defaults to the percentage. Pass null to hide. */
  label?: React.ReactNode | null;
  /** Small caption under the value. */
  caption?: string;
  className?: string;
}

/** Red below 0.6, amber to 0.85, green above — for unspecified gauge colors. */
function rampColor(v: number): string {
  if (v >= 0.85) return COLORS.ok;
  if (v >= 0.6) return COLORS.warn;
  return COLORS.danger;
}

/**
 * GaugeRing — an SVG arc dial for a 0..1 ratio (pass-rate, utilization, health).
 * A 270° sweep with a soft track, an animated stroke-dashoffset fill, and a
 * centered readout. Pure SVG, theme-driven.
 */
export function GaugeRing({
  value,
  size = 84,
  thickness = 7,
  color,
  label,
  caption,
  className = "",
}: GaugeRingProps) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const stroke = color ?? rampColor(v);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 270° arc, gap at the bottom (rotate so the gap sits south).
  const sweep = 0.75; // fraction of full circle the track spans
  const circumference = 2 * Math.PI * r;
  const trackLen = circumference * sweep;
  const fillLen = trackLen * v;

  const dash = (len: number) => `${len} ${circumference}`;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(135 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={withAlpha(stroke, 0.12)}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={dash(trackLen)}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={dash(fillLen)}
            style={{
              transition: "stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)",
              filter: `drop-shadow(0 0 4px ${withAlpha(stroke, 0.5)})`,
            }}
          />
        </g>
        {label !== null && (
          <text
            x={cx}
            y={caption ? cy - 1 : cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className="metric"
            style={{ fill: COLORS.ink, fontSize: size * 0.24, fontWeight: 600 }}
          >
            {label ?? `${Math.round(v * 100)}%`}
          </text>
        )}
        {caption && (
          <text
            x={cx}
            y={cy + size * 0.16}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: COLORS.inkFaint,
              fontSize: size * 0.12,
              letterSpacing: "0.08em",
            }}
          >
            {caption}
          </text>
        )}
      </svg>
    </div>
  );
}
