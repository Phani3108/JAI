import { SYSTEM_META, systemHue, withAlpha, type System } from "@/lib/theme";

interface SystemBadgeProps {
  system: System | string;
  /** Show the system tagline after the name. */
  showTagline?: boolean;
  /** Dot only (no label) — for compact rows / legends. */
  dotOnly?: boolean;
  /** Render as a tinted chip rather than bare dot+label. */
  chip?: boolean;
  className?: string;
}

/**
 * SystemBadge — a colored dot + system name in the system's signature hue.
 * Identifies which car system a part belongs to, everywhere it appears.
 */
export function SystemBadge({
  system,
  showTagline = false,
  dotOnly = false,
  chip = false,
  className = "",
}: SystemBadgeProps) {
  const color = systemHue(system);
  const tagline = (SYSTEM_META as Record<string, { tagline: string }>)[system]
    ?.tagline;

  const dot = (
    <span
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px -1px ${color}` }}
      aria-hidden
    />
  );

  if (dotOnly) {
    return (
      <span className={`inline-flex ${className}`} title={String(system)}>
        {dot}
      </span>
    );
  }

  const inner = (
    <>
      {dot}
      <span
        className="font-mono text-[11px] font-medium tracking-wider"
        style={{ color }}
      >
        {system}
      </span>
      {showTagline && tagline && (
        <span className="text-[11px] text-ink-faint">· {tagline}</span>
      )}
    </>
  );

  if (chip) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${className}`}
        style={{ background: withAlpha(color, 0.1), borderColor: withAlpha(color, 0.3) }}
      >
        {inner}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>{inner}</span>
  );
}
