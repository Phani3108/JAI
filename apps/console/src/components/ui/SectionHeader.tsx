import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: ReactNode;
  /** A short subtitle / description beneath the title. */
  subtitle?: ReactNode;
  /** Tiny mono kicker above the title (e.g. a route name or system). */
  kicker?: ReactNode;
  /** Right-aligned controls (filters, toggles, actions). */
  action?: ReactNode;
  className?: string;
}

/**
 * SectionHeader — the page / section masthead. A kicker + title + subtitle on the
 * left, optional controls on the right. Used at the top of every route.
 */
export function SectionHeader({
  title,
  subtitle,
  kicker,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-4 ${className}`}
    >
      <div>
        {kicker && <div className="label-cap mb-1.5 text-accent">{kicker}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
