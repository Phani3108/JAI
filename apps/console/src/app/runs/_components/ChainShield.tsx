"use client";

import { COLORS, withAlpha } from "@/lib/theme";

type ShieldState = "verified" | "broken" | "checking" | "offline";

interface ChainShieldProps {
  /** null while the first verify is in flight. */
  ok: boolean | null;
  /** Number of events the sweep covered. */
  checked: number;
  /** True when the verify endpoint is unreachable (degrade quietly). */
  offline: boolean;
  /** True until the first poll resolves (ok or fail). */
  loaded: boolean;
}

const STATE_META: Record<
  ShieldState,
  { color: string; label: string; sub: (n: number) => string }
> = {
  verified: {
    color: COLORS.ok,
    label: "CHAIN VERIFIED",
    sub: (n) => `${n.toLocaleString()} events · no tamper`,
  },
  broken: {
    color: COLORS.danger,
    label: "CHAIN BROKEN",
    sub: (n) => `tamper detected · ${n.toLocaleString()} checked`,
  },
  checking: {
    color: COLORS.accent,
    label: "VERIFYING",
    sub: () => "sweeping hash chain…",
  },
  offline: {
    color: COLORS.inkFaint,
    label: "VERIFY OFFLINE",
    sub: () => "audit sweep unreachable",
  },
};

/**
 * ChainShield — the tamper-evidence readout. A bespoke SVG shield with a chain
 * link / check glyph that turns green when GET /audit/verify reports {ok:true}.
 * Pulses faintly while verified to signal a live, continuously-checked ledger.
 */
export function ChainShield({ ok, checked, offline, loaded }: ChainShieldProps) {
  const state: ShieldState = !loaded
    ? "checking"
    : offline
      ? "offline"
      : ok === false
        ? "broken"
        : ok === true
          ? "verified"
          : "checking";

  const { color, label, sub } = STATE_META[state];
  const verified = state === "verified";

  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2"
      style={{
        borderColor: withAlpha(color, 0.4),
        background: withAlpha(color, 0.07),
        boxShadow: verified ? `0 0 18px -6px ${withAlpha(color, 0.7)}` : undefined,
      }}
    >
      <svg
        width={30}
        height={34}
        viewBox="0 0 30 34"
        fill="none"
        aria-hidden
        className="shrink-0"
        style={
          verified
            ? { animation: "pulse-dot 2.6s ease-in-out infinite" }
            : undefined
        }
      >
        {/* shield body */}
        <path
          d="M15 1.5 L27 5.4 V16 C27 24.5 21.6 29.7 15 32.5 C8.4 29.7 3 24.5 3 16 V5.4 Z"
          fill={withAlpha(color, 0.1)}
          stroke={color}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {state === "checking" ? (
          /* indeterminate scan arc */
          <g style={{ transformOrigin: "15px 16px" }} className="animate-spin">
            <path
              d="M15 9 A7 7 0 0 1 22 16"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : state === "broken" ? (
          /* fractured chain — an X over a link */
          <>
            <path
              d="M10 11 L20 21 M20 11 L10 21"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        ) : state === "offline" ? (
          /* hollow link */
          <circle
            cx={15}
            cy={16}
            r={4.5}
            stroke={color}
            strokeWidth={1.8}
            fill="none"
            strokeDasharray="2 2.4"
          />
        ) : (
          /* verified check */
          <path
            d="M9.5 16.2 L13.4 20 L20.8 11.6"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              filter: `drop-shadow(0 0 4px ${withAlpha(color, 0.6)})`,
            }}
          />
        )}
      </svg>

      <div className="leading-tight">
        <div
          className="metric text-[11px] font-semibold tracking-wider"
          style={{ color }}
        >
          {label}
        </div>
        <div className="mt-0.5 text-[10px] text-ink-faint">{sub(checked)}</div>
      </div>
    </div>
  );
}
