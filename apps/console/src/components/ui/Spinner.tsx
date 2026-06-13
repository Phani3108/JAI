import { COLORS } from "@/lib/theme";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  /** Optional label rendered beside the spinner. */
  label?: string;
}

/**
 * Spinner — a minimal SVG arc spinner in the telemetry accent. Pure CSS rotation,
 * no client JS required.
 */
export function Spinner({
  size = 16,
  color = COLORS.accent,
  className = "",
  label,
}: SpinnerProps) {
  const spinner = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ animationDuration: "0.8s" }}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeOpacity={0.18}
        strokeWidth="3"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!label) return <span className={className}>{spinner}</span>;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {spinner}
      <span className="text-xs text-ink-faint">{label}</span>
    </span>
  );
}
