import { COLORS, withAlpha } from "@/lib/theme";

interface SparklineProps {
  /** The series. Needs >= 2 points to draw a line. */
  data: number[];
  width?: number;
  height?: number;
  /** Stroke color (defaults to telemetry accent). */
  color?: string;
  /** Fill the area under the line with a faint gradient. */
  fill?: boolean;
  /** Mark the last point with a dot. */
  endDot?: boolean;
  className?: string;
}

/**
 * Sparkline — a tiny pure-SVG trend line. No dependencies, reads theme colors.
 * Normalizes the series into the viewBox; flat or single-point series render a
 * baseline. Used inside Stat and anywhere a number deserves a heartbeat.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = COLORS.accent,
  fill = true,
  endDot = true,
  className = "",
}: SparklineProps) {
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  if (data.length === 0) {
    return <svg width={width} height={height} className={className} aria-hidden />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + h - ((v - min) / span) * h;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];
  const areaPath = `M ${pad},${pad + h} L ${line.replace(/ /g, " L ")} L ${(
    pad + (data.length > 1 ? w : 0)
  ).toFixed(2)},${pad + h} Z`;

  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={withAlpha(color, 0.28)} />
              <stop offset="100%" stopColor={withAlpha(color, 0)} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {endDot && (
        <circle cx={lastX} cy={lastY} r={2.2} fill={color}>
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}
