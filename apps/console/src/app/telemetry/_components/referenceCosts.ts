/**
 * Deterministic reference cost telemetry for the offline fallback.
 *
 * When the control plane is unreachable AND no live data was ever received, the
 * telemetry dashboard would otherwise be blank. Per the design brief it must show
 * the reference fleet with a quiet "offline" note instead of a crash or void. We
 * synthesize a stable, plausible cost snapshot from the reference fleet so the
 * instruments still read like a populated cockpit (values are seeded → identical
 * every render, so nothing flickers).
 */

import type { CostRow } from "@/lib/api";
import { REFERENCE_AGENTS } from "@/lib/fleet";

import type { TelemDimension } from "./costFetch";

/** Tiny deterministic hash → [0,1). */
function seed01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned → 0..1
  return ((h >>> 0) % 100000) / 100000;
}

function rowFor(key: string, scale: number): CostRow {
  const r = seed01(key);
  const r2 = seed01(`${key}#2`);
  const calls = Math.round((3 + r * 40) * scale);
  const input = Math.round((800 + r * 9000) * scale) * Math.max(1, calls);
  const output = Math.round((200 + r2 * 2600) * scale) * Math.max(1, calls);
  // crude blended price: ~$3/M in, ~$15/M out
  const cost = (input / 1_000_000) * 3 + (output / 1_000_000) * 15;
  return {
    key,
    calls,
    input_tokens: input,
    output_tokens: output,
    cost_usd: Number(cost.toFixed(6)),
  };
}

const REF_TENANTS = ["acme-mfg", "globex", "initech"];
const REF_MODEL_GROUPS = ["frontier", "balanced", "fast", "embed"];

/** A stable reference snapshot for the given pivot. Sorted by cost desc. */
export function referenceCosts(by: TelemDimension): CostRow[] {
  let keys: string[];
  let scale = 1;
  switch (by) {
    case "agent":
      keys = REFERENCE_AGENTS.map((a) => a.name);
      break;
    case "tenant_id":
      keys = REF_TENANTS;
      scale = 3.2;
      break;
    case "model_group":
      keys = REF_MODEL_GROUPS;
      scale = 2.6;
      break;
    case "run_id":
      keys = Array.from(
        { length: 7 },
        (_, i) => `run_${(seed01(`run${i}`) * 1e9).toString(36).slice(0, 8)}`,
      );
      scale = 0.6;
      break;
  }
  return keys
    .map((k) => rowFor(k, scale))
    .sort((a, b) => Number(b.cost_usd) - Number(a.cost_usd));
}
