"use client";

import { AnimatePresence, motion } from "motion/react";

import { Panel, Pill } from "@/components/ui";
import { COLORS, withAlpha } from "@/lib/theme";
import { HopCard } from "./HopCard";
import { MissionOutcome } from "./MissionOutcome";
import { rollupCost, type MissionState } from "./demo";

interface MissionTimelineProps {
  state: MissionState;
}

/**
 * The live mission timeline. A shared trace header runs the whole thing; hops
 * stream in one by one as the orchestrator fans out; the outcome (award / gate)
 * resolves at the end. The trace_id is the through-line — one trace, every hop.
 */
export function MissionTimeline({ state }: MissionTimelineProps) {
  const { result, hops, phase, source, outcomeReady } = state;
  const runningTotal = rollupCost(hops);
  const dispatching = phase === "dispatching";

  return (
    <Panel
      grid
      accent={source === "reference" ? "NETWORK" : "COCKPIT"}
      title={
        <div className="flex items-center gap-2">
          <span className="label-cap">mission trace</span>
          {source === "reference" ? (
            <Pill tone="autonomy">reference run</Pill>
          ) : (
            <Pill tone="accent">live</Pill>
          )}
        </div>
      }
      action={
        <div className="flex items-center gap-3">
          <span className="metric text-[11px] text-ink-faint">
            cost{" "}
            <motion.span
              key={runningTotal}
              initial={{ color: COLORS.accent }}
              animate={{ color: COLORS.ink }}
              transition={{ duration: 0.8 }}
              className="font-semibold"
            >
              ${runningTotal.toFixed(4)}
            </motion.span>
          </span>
        </div>
      }
    >
      {/* trace through-line header */}
      <TraceHeader
        traceId={result.trace_id}
        runId={result.run_id}
        hopCount={hops.length}
        totalHops={result.hops.length}
        phase={phase}
      />

      {/* the hops */}
      <div className="mt-4">
        {dispatching ? (
          <Dispatching />
        ) : (
          <ol>
            <AnimatePresence>
              {hops.map((hop, i) => (
                <HopCard
                  key={`${hop.skill_id}-${i}`}
                  hop={hop}
                  index={i}
                  isLast={i === result.hops.length - 1}
                />
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>

      {/* outcome */}
      <AnimatePresence>
        {outcomeReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <MissionOutcome state={state} />
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function TraceHeader({
  traceId,
  runId,
  hopCount,
  totalHops,
  phase,
}: {
  traceId: string;
  runId: string;
  hopCount: number;
  totalHops: number;
  phase: MissionState["phase"];
}) {
  const settled = phase === "settled";
  const pct = totalHops > 0 ? (hopCount / totalHops) * 100 : 0;

  return (
    <div className="rounded-md border border-line bg-base-2/60 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="label-cap">trace</span>
          <span className="metric text-xs text-accent">{traceId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="label-cap">run</span>
          <span className="metric text-xs text-ink-muted">{runId}</span>
        </div>
        <span className="ml-auto metric text-[11px] text-ink-faint">
          {settled ? "complete" : `hop ${hopCount}/${totalHops}`}
        </span>
      </div>
      {/* progress rail */}
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line-strong">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${COLORS.accentDim}, ${COLORS.accent})`,
            boxShadow: `0 0 8px -1px ${COLORS.accent}`,
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/** The "request in flight" beat before hops appear. */
function Dispatching() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="relative h-10 w-10">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: withAlpha(COLORS.accent, 0.5) }}
            animate={{ scale: [0.4, 1.4], opacity: [0.7, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
        <span
          className="absolute inset-[14px] rounded-full"
          style={{ background: COLORS.accent, boxShadow: `0 0 12px ${COLORS.accent}` }}
        />
      </div>
      <p className="metric text-xs tracking-wide text-ink-faint">
        dispatching to orchestrator…
      </p>
    </div>
  );
}
