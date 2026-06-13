"use client";

import { motion } from "motion/react";

import { COLORS, withAlpha } from "@/lib/theme";

import { examplePrompts, roleLabel } from "./personas";

interface ExamplePromptsProps {
  role: string;
  onPick: (text: string) => void;
  /** Condensed single-row chip layout (shown beneath an active conversation). */
  compact?: boolean;
}

/**
 * ExamplePrompts — persona-aware starter prompts. The set changes with the
 * selected role; lower roles get a deliberate permission-probe (flagged with a
 * warn dot) so a refusal is one click away.
 *
 * Two layouts: a labelled card grid for the empty state, and a compact chip
 * row for keeping the starters reachable beneath a live conversation.
 */
export function ExamplePrompts({
  role,
  onPick,
  compact = false,
}: ExamplePromptsProps) {
  const prompts = examplePrompts(role);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {prompts.map((p, i) => {
          const probe = p.probesPermission ?? false;
          const tint = probe ? COLORS.warn : COLORS.accent;
          return (
            <button
              key={`${role}-c-${i}`}
              type="button"
              onClick={() => onPick(p.text)}
              title={p.hint}
              className="focus-ring group flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:text-ink"
              style={{ borderColor: COLORS.line }}
            >
              <span
                className="inline-block h-1 w-1 shrink-0 rounded-full transition-transform group-hover:scale-125"
                style={{ background: tint }}
                aria-hidden
              />
              <span className="max-w-[15rem] truncate">{p.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="label-cap mb-2.5">try as {roleLabel(role)}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p, i) => {
          const probe = p.probesPermission ?? false;
          const tint = probe ? COLORS.warn : COLORS.accent;
          return (
            <motion.button
              key={`${role}-${i}`}
              type="button"
              onClick={() => onPick(p.text)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -2 }}
              className="focus-ring panel-2 group relative overflow-hidden rounded-md px-3 py-2.5 text-left transition-colors hover:border-line-strong"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-0.5 opacity-60 transition-opacity group-hover:opacity-100"
                style={{ background: tint }}
              />
              <span className="block text-[13px] leading-snug text-ink">
                {p.text}
              </span>
              {p.hint && (
                <span
                  className="mt-1 flex items-center gap-1.5 text-[10px] leading-none"
                  style={{ color: probe ? COLORS.warn : COLORS.inkFaint }}
                >
                  {probe && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        background: COLORS.warn,
                        boxShadow: `0 0 6px -1px ${withAlpha(COLORS.warn, 0.9)}`,
                      }}
                      aria-hidden
                    />
                  )}
                  {p.hint}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
