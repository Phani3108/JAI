"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { postOrchestrate, type OrchestrateResult } from "@/lib/api";
import {
  buildReferenceRun,
  type MissionIntake,
  type MissionState,
  type StagedHop,
} from "./demo";

/** Timing of the staged reveal (ms). Kept brisk so the demo reads as live. */
const DISPATCH_DELAY = 650; // "request in flight" beat before hops appear
const HOP_RUN_MS = 520; // a hop sits in "running" before it resolves
const HOP_GAP_MS = 260; // gap between successive hops starting
const OUTCOME_DELAY = 700; // beat before award/gate resolves

interface UseMission {
  state: MissionState | null;
  busy: boolean;
  launch: (intake: MissionIntake) => void;
  reset: () => void;
}

/**
 * Drives a mission: POSTs the intake (falling back to a scripted reference run
 * when /orchestrate is offline), then *stages* the resulting hops onto a
 * timeline — each appearing, running, then resolving — so the orchestrator's
 * fan-out animates in. All timers are cleaned up on reset/unmount.
 */
export function useMission(): UseMission {
  const [state, setState] = useState<MissionState | null>(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState(null);
    setBusy(false);
  }, [clearTimers]);

  /** Stage a resolved result onto the animated timeline. */
  const stage = useCallback(
    (result: OrchestrateResult, source: "live" | "reference") => {
      const total = result.hops.length;

      // Seed: dispatching, no hops revealed yet.
      setState({
        source,
        phase: "dispatching",
        result,
        hops: [],
        outcomeReady: false,
      });

      after(DISPATCH_DELAY, () => {
        setState((s) =>
          s ? { ...s, phase: "running" } : s,
        );
        // Reveal each hop in sequence: appears as "running", then "done".
        result.hops.forEach((hop, i) => {
          const startAt = i * (HOP_RUN_MS + HOP_GAP_MS);
          after(startAt, () => {
            setState((s) =>
              s
                ? {
                    ...s,
                    hops: [...s.hops, { ...hop, phase: "running" } as StagedHop],
                  }
                : s,
            );
          });
          after(startAt + HOP_RUN_MS, () => {
            setState((s) =>
              s
                ? {
                    ...s,
                    hops: s.hops.map((h, j) =>
                      j === i ? { ...h, phase: "done" } : h,
                    ),
                  }
                : s,
            );
          });
        });

        // After the last hop resolves, reveal the outcome.
        const allDoneAt =
          (total - 1) * (HOP_RUN_MS + HOP_GAP_MS) + HOP_RUN_MS + OUTCOME_DELAY;
        after(allDoneAt, () => {
          setState((s) =>
            s ? { ...s, phase: "settled", outcomeReady: true } : s,
          );
          setBusy(false);
        });
      });
    },
    [after],
  );

  const launch = useCallback(
    (intake: MissionIntake) => {
      clearTimers();
      setBusy(true);
      setState(null);

      const body = {
        title: intake.title,
        category: intake.category,
        est_value_usd: intake.estValueUsd,
        tenant_id: intake.persona.tenantId,
        role: intake.persona.role,
      };

      postOrchestrate(body)
        .then((result) => {
          // Guard against an empty/degenerate live response — fall back so the
          // demo never shows an empty timeline.
          if (!result.hops || result.hops.length === 0) {
            stage(buildReferenceRun(intake), "reference");
          } else {
            stage(result, "live");
          }
        })
        .catch(() => {
          stage(buildReferenceRun(intake), "reference");
        });
    },
    [clearTimers, stage],
  );

  useEffect(() => clearTimers, [clearTimers]);

  return { state, busy, launch, reset };
}
