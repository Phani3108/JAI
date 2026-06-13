import type { ReactNode } from "react";

import { systemHue, type System } from "@/lib/theme";

interface PanelProps {
  children: ReactNode;
  /** Optional title rendered in the panel header. */
  title?: ReactNode;
  /** Optional right-aligned header slot (e.g. a control, count, or LiveDot). */
  action?: ReactNode;
  /** Draw a colored corner accent bar; pass a system to tint it. */
  accent?: System | "accent" | "none";
  /** Use the dense telemetry-grid backdrop (for hero / viz panels). */
  grid?: boolean;
  className?: string;
  /** Removes inner padding on the body (for tables / full-bleed viz). */
  flush?: boolean;
}

/**
 * Panel — the core titled instrument surface. Every screen is built from these.
 * A hairline-bordered raised card with an optional header and corner accent.
 */
export function Panel({
  children,
  title,
  action,
  accent = "none",
  grid = false,
  className = "",
  flush = false,
}: PanelProps) {
  const accentColor =
    accent === "none"
      ? undefined
      : accent === "accent"
        ? "var(--accent)"
        : systemHue(accent);

  return (
    <section
      className={`panel relative overflow-hidden ${grid ? "telem-grid" : ""} ${className}`}
    >
      {accentColor && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(to right, ${accentColor}, transparent 60%)`,
          }}
        />
      )}
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          {typeof title === "string" ? (
            <span className="label-cap">{title}</span>
          ) : (
            title
          )}
          {action}
        </header>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}
