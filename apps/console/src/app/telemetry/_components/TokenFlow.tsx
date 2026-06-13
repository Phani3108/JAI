"use client";

import { COLORS, withAlpha } from "@/lib/theme";

export interface TokenDatum {
  key: string;
  input: number;
  output: number;
}

interface TokenFlowProps {
  data: TokenDatum[];
  /** Format token counts (compact, e.g. 12.4k). */
  format: (n: number) => string;
  max?: number;
  className?: string;
}

const ROW_H = 30;
const LABEL_W = 132;
const TOP_PAD = 10;
const BOT_PAD = 4;

// input = telemetry accent (intake) ; output = autonomy violet (emitted)
const IN_COLOR = COLORS.accent;
const OUT_COLOR = COLORS.autonomy;

/**
 * TokenFlow — a stacked horizontal bar per dimension key showing input vs output
 * token throughput on one rail. Input fills from the left in accent; output
 * continues in violet. The split makes prompt-vs-completion balance legible at a
 * glance, like a fuel/exhaust gauge. Pure SVG.
 */
export function TokenFlow({ data, format, max = 8, className = "" }: TokenFlowProps) {
  const rows = data.slice(0, max);
  const n = rows.length;

  const plotW = 560;
  const chartW = LABEL_W + plotW;
  const chartH = TOP_PAD + n * ROW_H + BOT_PAD;

  const totalMax = rows.reduce((m, d) => Math.max(m, d.input + d.output), 0) || 1;
  const scale = (v: number) => (v / totalMax) * plotW;

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      width="100%"
      className={className}
      role="img"
      aria-label="token throughput, input versus output"
      style={{ display: "block" }}
    >
      {rows.map((d, i) => {
        const y = TOP_PAD + i * ROW_H;
        const barY = y + 7;
        const barH = ROW_H - 14;
        const inW = scale(d.input);
        const outW = scale(d.output);

        return (
          <g key={d.key}>
            <text
              x={LABEL_W - 12}
              y={barY + barH / 2}
              fill={COLORS.inkMuted}
              fontSize={11}
              fontFamily="var(--font-mono)"
              textAnchor="end"
              dominantBaseline="central"
            >
              {d.key.length > 16 ? `${d.key.slice(0, 15)}…` : d.key}
            </text>

            {/* rail */}
            <rect
              x={LABEL_W}
              y={barY}
              width={plotW}
              height={barH}
              rx={3}
              fill={withAlpha(COLORS.ink, 0.025)}
              stroke={COLORS.line}
              strokeWidth={0.75}
            />
            {/* input segment */}
            <rect
              x={LABEL_W}
              y={barY}
              width={Math.max(d.input > 0 ? 1.5 : 0, inW)}
              height={barH}
              rx={3}
              fill={withAlpha(IN_COLOR, 0.85)}
              style={{ transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <title>{`${d.key} · input ${format(d.input)}`}</title>
            </rect>
            {/* output segment */}
            <rect
              x={LABEL_W + inW}
              y={barY}
              width={Math.max(d.output > 0 ? 1.5 : 0, outW)}
              height={barH}
              rx={3}
              fill={withAlpha(OUT_COLOR, 0.85)}
              style={{
                transition:
                  "width 600ms cubic-bezier(0.22, 1, 0.36, 1), x 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <title>{`${d.key} · output ${format(d.output)}`}</title>
            </rect>

            {/* total label, right-flush inside rail */}
            <text
              x={LABEL_W + plotW - 6}
              y={barY + barH / 2}
              fill={COLORS.inkFaint}
              fontSize={9}
              fontFamily="var(--font-mono)"
              textAnchor="end"
              dominantBaseline="central"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {format(d.input + d.output)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const TOKEN_LEGEND = [
  { label: "input", color: IN_COLOR },
  { label: "output", color: OUT_COLOR },
] as const;
