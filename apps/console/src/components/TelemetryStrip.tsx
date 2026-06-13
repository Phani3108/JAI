"use client";

import { fetchHealth, type Health } from "@/lib/api";
import { REFERENCE_FLEET, REFERENCE_PART_COUNT } from "@/lib/fleet";
import { usePoll } from "@/lib/usePoll";
import { LiveDot } from "@/components/ui";

const SYSTEM_COUNT = REFERENCE_FLEET.length;

/**
 * The right-aligned LIVE TELEMETRY STRIP in the cockpit top bar.
 * Polls GET /health every 5s: a pulsing LiveDot for the control-plane link,
 * the postgres status, and a static fleet census (systems · parts) sourced
 * from the reference fleet so the strip is meaningful even while offline.
 */
export function TelemetryStrip() {
  const { data, offline, loaded } = usePoll<Health>(fetchHealth, 5000);
  const online = loaded && !offline && data?.status === "ok";

  return (
    <div className="hidden items-center gap-4 md:flex">
      {/* fleet census — always meaningful */}
      <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-ink-faint">
        <span>
          <span className="text-ink-muted">{SYSTEM_COUNT}</span> SYS
        </span>
        <span className="text-line-strong">/</span>
        <span>
          <span className="text-ink-muted">{REFERENCE_PART_COUNT}</span> PARTS
        </span>
      </div>

      <span className="h-4 w-px bg-line" aria-hidden />

      {/* control-plane link */}
      <div className="flex items-center gap-2">
        <LiveDot
          live={online}
          label={online ? "LIVE" : loaded ? "OFFLINE" : "…"}
        />
        {loaded && (
          <span
            className="metric text-[10px]"
            title={online ? "control plane reachable" : "control plane unreachable"}
            style={{ color: "var(--ink-ghost)" }}
          >
            {online
              ? data?.postgres
                ? "pg·ok"
                : "pg·—"
              : "telemetry offline"}
          </span>
        )}
      </div>
    </div>
  );
}
