"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { EmptyState, SectionHeader } from "@/components/ui";
import { COLORS, withAlpha } from "@/lib/theme";
import { API_BASE } from "@/lib/api";
import { usePoll } from "@/lib/usePoll";

import { GateCard } from "./_components/GateCard";
import { fmtUsdFull, moneyAtStake, type Approval } from "./_components/types";

async function fetchApprovals(): Promise<Approval[]> {
  const res = await fetch(`${API_BASE}/approvals`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /approvals -> ${res.status}`);
  return (await res.json()) as Approval[];
}

/**
 * /approvals — GATES.
 *
 * The human-in-the-loop inbox for jai-brakes. Every row is an agent run that hit
 * a policy gate (over-mandate award, RFx publish) and PAUSED ITSELF DURABLY mid-
 * flight; it is sitting in Postgres waiting on a verdict. Approving or rejecting
 * here is what lets the parked run resume — that's the story the page tells.
 *
 * Polls GET /approvals (~3s). Decisions POST /approvals/{id}/decide and are
 * optimistically removed (a verdict-tinted resolve animation), confirmed by the
 * next poll. Falls back to a quiet "telemetry offline" note, never a crash.
 */
export default function ApprovalsPage() {
  const [decided, setDecided] = useState<number[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const { data, offline, loaded } = usePoll<Approval[]>(fetchApprovals, 3000);

  // Shared clock so each card's "Nm waiting" age advances together, once a second.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const decide = useCallback(
    async (id: number, approve: boolean): Promise<void> => {
      try {
        await fetch(`${API_BASE}/approvals/${id}/decide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approver: "console.user",
            approve,
            note: approve ? "approved from console" : "rejected from console",
          }),
        });
      } finally {
        // Optimistic: drop it now; the next poll confirms it's gone server-side.
        setDecided((d) => (d.includes(id) ? d : [...d, id]));
      }
    },
    [],
  );

  // Hide anything we've optimistically decided. The `decided` set only ever needs
  // ids the server is *still* returning (those are the in-flight removals); once a
  // poll drops an id it's gone from `data` regardless, so we never have to prune.
  const rows = (data ?? []).filter((a) => !decided.includes(a.id));

  const totalAtStake = rows.reduce(
    (sum, a) => sum + (moneyAtStake(a).amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="cockpit · human-in-the-loop"
        title="Gates"
        subtitle="Runs that hit a policy gate pause themselves durably and wait here. Your verdict is what resumes a parked agent — approve to let it proceed, reject to keep it halted."
        action={
          offline && loaded ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]"
              style={{
                borderColor: withAlpha(COLORS.autonomy, 0.35),
                color: COLORS.autonomy,
                background: withAlpha(COLORS.autonomy, 0.1),
              }}
              title="GET /approvals is unreachable — showing the last known queue."
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: COLORS.autonomy }}
              />
              live telemetry offline
            </span>
          ) : (
            <CountBadge count={rows.length} totalUsd={totalAtStake} />
          )
        }
      />

      {!loaded ? (
        <div className="panel telem-grid">
          <SkeletonStack />
        </div>
      ) : rows.length === 0 ? (
        <div className="panel telem-grid">
          <EmptyState
            icon={<ClearGlyph />}
            title="No runs are waiting on you"
            hint={
              <>
                When an agent hits a publish or over-mandate award gate it parks
                here. Run{" "}
                <code className="metric rounded bg-panel-2 px-1.5 py-0.5 text-ink-muted">
                  make demo-p2
                </code>{" "}
                to send a sourcing run into a gate and watch it land.
              </>
            }
          />
        </div>
      ) : (
        <motion.ul layout className="space-y-3.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {rows.map((a, i) => (
              <GateCard
                key={a.id}
                approval={a}
                onDecide={decide}
                index={i}
                now={now}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

/** Live pending count + aggregate stake, rendered in the masthead action slot. */
function CountBadge({ count, totalUsd }: { count: number; totalUsd: number }) {
  const live = count > 0;
  const color = live ? COLORS.warn : COLORS.ok;
  return (
    <div className="flex items-center gap-3">
      {count > 0 && (
        <span className="metric hidden text-[11px] text-ink-faint sm:inline">
          {fmtUsdFull(totalUsd)} at stake
        </span>
      )}
      <span
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
        style={{
          borderColor: withAlpha(color, 0.4),
          background: withAlpha(color, 0.1),
        }}
      >
        <span className="relative inline-flex h-2 w-2" aria-hidden>
          {live && (
            <span
              className="absolute inset-0 rounded-full opacity-60 animate-[pulse-dot_1.8s_ease-in-out_infinite]"
              style={{ background: color }}
            />
          )}
          <span
            className="relative inline-block h-2 w-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px -1px ${color}` }}
          />
        </span>
        <span className="metric text-[13px] font-semibold" style={{ color }}>
          {count}
        </span>
        <span className="label-cap">{count === 1 ? "gate" : "gates"}</span>
      </span>
    </div>
  );
}

/** A calm loading shimmer while the first poll is in flight. */
function SkeletonStack() {
  return (
    <div className="space-y-3 p-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-28 rounded-lg border border-line bg-panel-2"
          style={{
            backgroundImage:
              "linear-gradient(100deg, transparent 20%, rgb(255 255 255 / 0.03) 50%, transparent 80%)",
            backgroundSize: "200% 100%",
          }}
        >
          <span
            className="block h-full w-full rounded-lg animate-[shimmer_1.6s_linear_infinite]"
            style={{
              backgroundImage:
                "linear-gradient(100deg, transparent 30%, rgb(34 211 238 / 0.04) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ClearGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="13" stroke={COLORS.inkGhost} strokeWidth="1.4" />
      <path
        d="M10.5 16.5 14.5 20.5l7.5-9"
        stroke={COLORS.ok}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}
