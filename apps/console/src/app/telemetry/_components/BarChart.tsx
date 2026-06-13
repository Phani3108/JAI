"use client";

import { useId } from "react";

import { COLORS, withAlpha } from "@/lib/theme";

export interface BarDatum {
  key: string;
  /** The plotted magnitude (cost in usd). */
  value: number;
  /** Optional secondary readout under the value (e.g. call count). */
  meta?: string;
  /** Per-bar color override (defaults to the accent). */
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  /** Format the numeric value for the right-hand label. */
  format: (n: number) => string;
  /** Cap the number of bars; remainder folds into the running total elsewhere. */
  max?: number;
  className?: string;
}

const ROW_H = 34;
const LABEL_W = 132;
const VALUE_W = 96;
const TOP_PAD = 18;
const BOT_PAD = 6;

/** "Nice" axis ceiling so gridlines land on round numbers. */
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/**
 * BarChart — a bespoke horizontal bar chart tuned to read like a diagnostics
 * readout: a fixed label gutter, a plot area ruled with hairline gridlines, bars
 * that ease to width on data change, and right-flush monospace value labels.
 * Pure SVG, no chart lib.
 */
export function BarChart({ data, format, max = 9, className = "" }: BarChartProps) {
  const gid = useId().replace(/[:]/g, "");
  const rows = data.slice(0, max);
  const n = rows.length;

  // Lay out in a fixed-coordinate viewBox; the SVG scales responsively.
  const plotW = 520;
  const chartW = LABEL_W + plotW + VALUE_W;
  const chartH = TOP_PAD + n * ROW_H + BOT_PAD;

  const dataMax = rows.reduce((m, d) => Math.max(m, d.value), 0);
  const axisMax = niceCeil(dataMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * axisMax);

  const plotX0 = LABEL_W;
  const plotX1 = LABEL_W + plotW;
  const scaleX = (v: number) => (axisMax === 0 ? 0 : (v / axisMax) * plotW);

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      width="100%"
      className={className}
      role="img"
      aria-label="cost by dimension"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`bar-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={withAlpha(COLORS.accent, 0.55)} />
          <stop offset="100%" stopColor={COLORS.accent} />
        </linearGradient>
      </defs>

      {/* vertical hairline gridlines + axis tick labels */}
      {ticks.map((t, i) => {
        const x = plotX0 + scaleX(t);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={TOP_PAD - 6}
              x2={x}
              y2={chartH - BOT_PAD}
              stroke={COLORS.line}
              strokeWidth={1}
              strokeDasharray={i === 0 ? undefined : "2 4"}
              opacity={i === 0 ? 0.9 : 0.55}
            />
            <text
              x={x}
              y={TOP_PAD - 9}
              fill={COLORS.inkFaint}
              fontSize={9}
              fontFamily="var(--font-mono)"
              textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
              style={{ letterSpacing: "0.04em" }}
            >
              {format(t)}
            </text>
          </g>
        );
      })}

      {rows.map((d, i) => {
        const y = TOP_PAD + i * ROW_H;
        const barY = y + 8;
        const barH = ROW_H - 16;
        const w = Math.max(d.value > 0 ? 2 : 0, scaleX(d.value));
        const c = d.color ?? COLORS.accent;
        const fill = d.color ? withAlpha(c, 0.85) : `url(#bar-${gid})`;

        return (
          <g key={d.key}>
            {/* row hover band */}
            <rect
              x={0}
              y={y}
              width={chartW}
              height={ROW_H}
              fill="transparent"
            />
            {/* dimension label */}
            <text
              x={LABEL_W - 12}
              y={barY + barH / 2}
              fill={COLORS.inkMuted}
              fontSize={11}
              fontFamily="var(--font-mono)"
              textAnchor="end"
              dominantBaseline="central"
            >
              {truncate(d.key, 16)}
            </text>

            {/* bar rail */}
            <rect
              x={plotX0}
              y={barY}
              width={plotW}
              height={barH}
              rx={3}
              fill={withAlpha(COLORS.ink, 0.025)}
              stroke={COLORS.line}
              strokeWidth={0.75}
            />
            {/* bar */}
            <rect
              x={plotX0}
              y={barY}
              width={w}
              height={barH}
              rx={3}
              fill={fill}
              style={{
                transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <title>{`${d.key}: ${format(d.value)}`}</title>
            </rect>
            {/* leading-edge glow tick */}
            {w > 3 && (
              <rect
                x={plotX0 + w - 1.5}
                y={barY}
                width={1.5}
                height={barH}
                fill={c}
                opacity={0.9}
                style={{
                  transition: "x 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            )}

            {/* value label */}
            <text
              x={plotX1 + VALUE_W - 4}
              y={barY + barH / 2}
              fill={COLORS.ink}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fontWeight={600}
              textAnchor="end"
              dominantBaseline="central"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {format(d.value)}
            </text>
            {d.meta && (
              <text
                x={plotX1 + 10}
                y={barY + barH / 2}
                fill={COLORS.inkFaint}
                fontSize={9}
                fontFamily="var(--font-mono)"
                dominantBaseline="central"
              >
                {d.meta}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
