/** Compact number formatters for telemetry readouts. */

/** 1234 → "1.2k", 1_200_000 → "1.2M". Plain ints below 1000. */
export function fmtCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return Math.round(n).toLocaleString();
  if (abs < 1_000_000) return `${(n / 1000).toFixed(abs < 10_000 ? 1 : 0)}k`;
  if (abs < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

/** USD with adaptive precision; compacts large totals (e.g. "$1.2k"). */
export function fmtUsdCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `$${fmtCompact(n)}`;
  if (abs >= 1) return `$${n.toFixed(2)}`;
  if (abs === 0) return "$0.00";
  return `$${n.toFixed(4)}`;
}

/** Axis-friendly USD: round magnitudes get no cents. */
export function fmtUsdAxis(n: number): string {
  if (n === 0) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1000) return `$${fmtCompact(n)}`;
  if (abs >= 1) return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
  return `$${n.toFixed(3)}`;
}
