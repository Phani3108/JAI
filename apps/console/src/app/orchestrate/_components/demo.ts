/**
 * Mission control — shared types + the offline scripted demo.
 *
 * When POST /orchestrate is reachable we replay the *real* hops returned by the
 * control plane, staged with delays so the fan-out reads as a live mission.
 * When it's offline we synthesize a believable "reference run" over the fleet
 * (clearly labeled in the UI) so the page is still a compelling demo.
 *
 * Nothing here imports React — it's pure data/logic, safe in any tree.
 */

import type { OrchestrateHop, OrchestrateResult } from "@/lib/api";

/** Procurement categories offered in the intake form. */
export const CATEGORIES = [
  "IT Hardware",
  "Professional Services",
  "Logistics & Freight",
  "Marketing",
  "Facilities & MRO",
  "Raw Materials",
  "Travel",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** A persona = role acting within a tenant. */
export interface Persona {
  role: string;
  tenantId: string;
}

/** The intake an operator submits to launch a mission. */
export interface MissionIntake {
  title: string;
  category: string;
  estValueUsd: number;
  persona: Persona;
}

/** Per-hop animation phase, driven by the staged scheduler. */
export type HopPhase = "pending" | "running" | "done";

/** A hop annotated with its current reveal phase (UI-only). */
export interface StagedHop extends OrchestrateHop {
  phase: HopPhase;
}

/** Where the whole mission sits in its lifecycle. */
export type MissionPhase =
  | "idle"
  | "dispatching" // request in flight (or demo warming up)
  | "running" // hops streaming in
  | "settled"; // award / gate / done resolved

/** The live, staged view of a mission the timeline renders. */
export interface MissionState {
  source: "live" | "reference";
  phase: MissionPhase;
  result: OrchestrateResult;
  /** Hops with reveal phases; length grows as the mission "streams". */
  hops: StagedHop[];
  /** True once every hop has reached `done` and the outcome is revealed. */
  outcomeReady: boolean;
}

/** Roll up total cost across the hops revealed so far. */
export function rollupCost(hops: StagedHop[]): number {
  return hops.reduce((sum, h) => sum + (Number(h.cost_usd) || 0), 0);
}

/** Count denied / failed hops (drives the mission verdict tone). */
export function countDenied(hops: StagedHop[]): number {
  return hops.filter((h) => !h.ok).length;
}

// --------------------------------------------------------- reference run ----

/**
 * Build a believable scripted orchestration over the reference fleet. The shape
 * exactly matches a real POST /orchestrate response so the timeline code is
 * identical for live and reference runs.
 *
 * The script adapts a little to the intake: a high est. value trips the award
 * approval gate (pauses) rather than auto-awarding; low value awards outright.
 */
export function buildReferenceRun(intake: MissionIntake): OrchestrateResult {
  const runId = `run_${randId()}`;
  const traceId = `trc_${randId()}`;
  const eventId = `evt_${randId()}`;
  const big = intake.estValueUsd >= 250_000;

  const supplier = pickSupplier(intake.category);
  // award lands a bit under the estimate — the savings story
  const awardTotal = Math.round(intake.estValueUsd * (0.86 + Math.random() * 0.06));

  const hops: OrchestrateHop[] = [
    {
      from_agent: "human",
      to_agent: "agent-orchestrator",
      skill_id: "intent.route",
      ok: true,
      cost_usd: 0.0021,
      summary: `Parsed intake "${truncate(intake.title, 42)}" → routed to ${
        big ? "4" : "3"
      } specialists.`,
    },
    {
      from_agent: "agent-orchestrator",
      to_agent: "agent-intake-triage",
      skill_id: "intake.classify",
      ok: true,
      cost_usd: 0.0014,
      summary: `Classified as ${intake.category} · urgency medium · enriched with cost-center.`,
    },
    {
      from_agent: "agent-orchestrator",
      to_agent: "agent-risk-sentinel",
      skill_id: "risk.screen",
      ok: true,
      cost_usd: 0.0018,
      summary: `Screened category & incumbents — no sanctions hits, concentration nominal.`,
    },
    {
      from_agent: "agent-orchestrator",
      to_agent: "agent-spend-analyst",
      skill_id: "spend.rollup",
      ok: true,
      cost_usd: 0.0016,
      summary: `${intake.category} spend ${fmtK(
        intake.estValueUsd * 3.2,
      )}/yr · tail fragmented · ~${big ? "12" : "8"}% savings flagged.`,
    },
    {
      from_agent: "agent-orchestrator",
      to_agent: "agent-sourcing",
      skill_id: "rfx.draft",
      ok: true,
      cost_usd: 0.0027,
      summary: `Drafted RFx for ${intake.category}, invited ${
        3 + (big ? 2 : 1)
      } qualified suppliers.`,
    },
    {
      from_agent: "agent-sourcing",
      to_agent: "mcp-sourcing-events",
      skill_id: "bid.collect",
      ok: true,
      cost_usd: 0.0009,
      summary: `Collected ${3 + (big ? 2 : 1)} sealed bids · normalized to common scorecard.`,
    },
    {
      from_agent: "agent-sourcing",
      to_agent: "mcp-sourcing-events",
      skill_id: "bid.rank",
      ok: true,
      cost_usd: 0.0012,
      summary: `Ranked bids — ${supplier} best on price+lead-time at ${fmtK(awardTotal)}.`,
    },
    {
      from_agent: "agent-sourcing",
      to_agent: "agent-orchestrator",
      skill_id: "award.recommend",
      ok: !big, // big spend can't auto-award — needs the gate
      cost_usd: 0.0011,
      summary: big
        ? `Recommendation exceeds $250k mandate — escalating to approval gate.`
        : `Within mandate — recommending award to ${supplier}.`,
    },
  ];

  return {
    run_id: runId,
    trace_id: traceId,
    event_id: eventId,
    status: big ? "paused" : "awarded",
    hops,
    award: big ? null : { supplier_id: supplier, total_usd: awardTotal },
    paused_gate: big ? "award.approval" : null,
  };
}

/** Deterministic-ish supplier pick per category, for flavor. */
function pickSupplier(category: string): string {
  const pools: Record<string, string[]> = {
    "IT Hardware": ["SUP-ARDENT-014", "SUP-NORTHGRID-082", "SUP-VANTAGE-117"],
    "Professional Services": ["SUP-MERIDIAN-203", "SUP-CALDERA-061"],
    "Logistics & Freight": ["SUP-PORTSIDE-330", "SUP-RAILHEAD-128"],
    Marketing: ["SUP-BRIGHTLINE-450", "SUP-AXIOM-022"],
    "Facilities & MRO": ["SUP-IRONGATE-191", "SUP-BASTION-077"],
    "Raw Materials": ["SUP-CRUCIBLE-505", "SUP-FOUNDRY-310"],
    Travel: ["SUP-WAYPOINT-260", "SUP-ATLAS-044"],
  };
  const pool = pools[category] ?? ["SUP-RAMPART-001", "SUP-KEYSTONE-009"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function randId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}
