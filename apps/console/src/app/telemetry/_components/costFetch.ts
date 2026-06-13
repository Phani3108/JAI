/**
 * Telemetry-local cost fetcher.
 *
 * The frozen `api.ts` exposes `fetchCosts(by)` but its `CostDimension` type only
 * admits `agent | tenant_id`. The telemetry dashboard needs the full four-way
 * pivot the control plane supports (`/costs?by=…`), so this route inlines its own
 * typed fetcher rather than editing the shared lib. It reuses `API_BASE` and the
 * `CostRow` shape from `api.ts` so the contract stays identical.
 */

import { API_BASE, type CostRow } from "@/lib/api";

/** The four pivots GET /costs accepts. */
export type TelemDimension = "agent" | "tenant_id" | "model_group" | "run_id";

export interface TelemDimensionMeta {
  value: TelemDimension;
  /** Toggle label (short). */
  label: string;
  /** Column header for the dimension key. */
  keyHeader: string;
}

export const TELEM_DIMENSIONS: readonly TelemDimensionMeta[] = [
  { value: "agent", label: "agent", keyHeader: "agent" },
  { value: "tenant_id", label: "tenant", keyHeader: "tenant" },
  { value: "model_group", label: "model", keyHeader: "model group" },
  { value: "run_id", label: "run", keyHeader: "run id" },
] as const;

/** Accept a bare list or a wrapped one ({costs|rows|items|data:[...]}) — mirrors api.ts. */
function asRows(data: unknown): CostRow[] {
  if (Array.isArray(data)) return data as CostRow[];
  if (data && typeof data === "object") {
    for (const key of ["costs", "rows", "items", "data"]) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as CostRow[];
    }
  }
  return [];
}

/** GET /costs?by=<dim>. Throws on network/HTTP failure (caller falls back offline). */
export async function fetchCostsBy(by: TelemDimension): Promise<CostRow[]> {
  const res = await fetch(`${API_BASE}/costs?by=${by}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET /costs?by=${by} -> HTTP ${res.status}`);
  }
  return asRows(await res.json());
}

/** Coerce a CostRow's possibly-string numeric field to a finite number. */
export function num(v: number | string | undefined | null): number {
  const n = typeof v === "string" ? Number(v) : v;
  return n === undefined || n === null || Number.isNaN(n) ? 0 : n;
}
