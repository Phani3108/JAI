"use client";

import { Sparkline } from "@/components/ui";
import { COLORS } from "@/lib/theme";

export interface LiveChannel {
  label: string;
  /** Rolling series, oldest → newest. */
  series: number[];
  /** Current value, already formatted. */
  current: string;
  color: string;
}

interface LiveStripProps {
  channels: LiveChannel[];
  className?: string;
}

/**
 * LiveStrip — a compact row of live sparklines, one per tracked channel (spend,
 * calls, tokens). Each shows the rolling poll window with a pulsing end-dot, the
 * way a vehicle's trip computer streams its recent readings.
 */
export function LiveStrip({ channels, className = "" }: LiveStripProps) {
  return (
    <div
      className={`grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 ${className}`}
    >
      {channels.map((ch) => {
        const enough = ch.series.length > 1;
        return (
          <div key={ch.label} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="label-cap">{ch.label}</div>
              <div
                className="metric mt-1 text-base font-semibold"
                style={{ color: ch.color }}
              >
                {ch.current}
              </div>
            </div>
            {enough ? (
              <Sparkline
                data={ch.series}
                color={ch.color}
                width={104}
                height={32}
                className="shrink-0"
              />
            ) : (
              <span
                className="metric shrink-0 text-[10px] tracking-wider"
                style={{ color: COLORS.inkGhost }}
              >
                acquiring…
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
