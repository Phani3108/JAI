import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Headline (e.g. "no runs yet"). */
  title: ReactNode;
  /** Optional supporting line. */
  hint?: ReactNode;
  /** Optional glyph / icon node above the title. */
  icon?: ReactNode;
  /** Optional action (button/link). */
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — a calm placeholder for "nothing here yet" zones. Centered,
 * muted, with an optional hint and action. Never a jarring blank.
 */
export function EmptyState({
  title,
  hint,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 px-6 py-12 text-center ${className}`}
    >
      {icon && <div className="text-ink-ghost">{icon}</div>}
      <p className="text-sm text-ink-muted">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-ink-faint">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
