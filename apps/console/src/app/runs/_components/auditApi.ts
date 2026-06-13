/**
 * Route-local fetcher for GET /audit/verify.
 *
 * The shared src/lib/api.ts is frozen for phase 2, and it does not (yet) export
 * an audit-verify helper, so per the phase-2 rules this small helper is inlined
 * here in the route folder rather than editing the shared module. It mirrors the
 * style of api.ts (throws on failure; the caller catches and degrades quietly).
 *
 * Contract: GET /audit/verify -> { ok: boolean, checked: number }
 */

import { API_BASE } from "@/lib/api";

/** Result of GET /audit/verify — the tamper-evidence sweep over the hash chain. */
export interface AuditVerifyResult {
  ok: boolean;
  checked: number;
}

export async function fetchAuditVerify(): Promise<AuditVerifyResult> {
  const res = await fetch(`${API_BASE}/audit/verify`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET /audit/verify -> HTTP ${res.status}`);
  }
  const data = (await res.json()) as Partial<AuditVerifyResult>;
  return {
    ok: Boolean(data?.ok),
    checked: typeof data?.checked === "number" ? data.checked : 0,
  };
}
