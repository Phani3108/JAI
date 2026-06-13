"use client";

import { AnimatePresence, motion } from "motion/react";

import { LiveDot } from "@/components/ui";
import type { RunSummary } from "@/lib/api";
import { fmtTs } from "@/lib/api";
import { COLORS, outcomeColor } from "@/lib/theme";

interface HopsTickerProps {
  runs: RunSummary[];
  /** True when /runs is unreachable — the ticker hides itself quietly. */
  offline: boolean;
}

/**
 * A quiet live ticker of recent fleet activity. Reads GET /runs and shows the
 * most recent runs (agent → outcome → when). Entirely optional and graceful:
 * if /runs is empty or offline it renders nothing rather than an error.
 */
export function HopsTicker({ runs, offline }: HopsTickerProps) {
  const recent = runs
    .filter((r) => r.run_id)
    .slice(0, 8);

  if (offline || recent.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="inline-flex shrink-0 items-center gap-1.5">
        <LiveDot live size={6} />
        <span className="label-cap">live hops</span>
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="flex gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence initial={false}>
            {recent.map((r) => (
              <motion.span
                key={r.run_id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2 py-1 font-mono text-[10px]"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: outcomeFor(r), boxShadow: `0 0 5px -1px ${outcomeFor(r)}` }}
                  aria-hidden
                />
                <span className="text-ink-muted">{agentOf(r)}</span>
                {eventsOf(r) != null && (
                  <span className="text-ink-ghost">· {eventsOf(r)} ev</span>
                )}
                <span className="text-ink-ghost">· {whenOf(r)}</span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        {/* edge fade so the row dissolves rather than hard-clipping */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10"
          style={{
            background: `linear-gradient(to right, transparent, ${COLORS.panel})`,
          }}
        />
      </div>
    </div>
  );
}

function agentOf(r: RunSummary): string {
  const a = (r.agent as string | null | undefined) ?? null;
  if (a) return a;
  return String(r.run_id).slice(0, 12);
}

function outcomeFor(r: RunSummary): string {
  const o = r["outcome"];
  return typeof o === "string" ? outcomeColor(o) : COLORS.inkFaint;
}

function eventsOf(r: RunSummary): number | null {
  const e = (r["events"] ?? r["event_count"]) as unknown;
  return typeof e === "number" ? e : null;
}

function whenOf(r: RunSummary): string {
  const ts = (r["last_ts"] ?? r["first_ts"] ?? r["started_at"]) as
    | string
    | undefined;
  return fmtTs(ts);
}
