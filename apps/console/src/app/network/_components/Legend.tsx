import { SYSTEMS, SYSTEM_META, systemHue } from "@/lib/theme";

/**
 * The graph legend — system hues plus the three node-role glyphs. Sits under
 * the graph so a reader can decode colors and shapes at a glance.
 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 px-4 py-3 font-mono text-[10px]">
      <span className="label-cap">systems</span>
      {SYSTEMS.map((sys) => {
        const hue = systemHue(sys);
        return (
          <span key={sys} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: hue, boxShadow: `0 0 6px -1px ${hue}` }}
              aria-hidden
            />
            <span style={{ color: hue }}>{sys}</span>
            <span className="text-ink-ghost">{SYSTEM_META[sys].tagline}</span>
          </span>
        );
      })}

      <span className="mx-1 hidden h-3 w-px bg-line lg:inline-block" aria-hidden />

      <span className="label-cap">nodes</span>
      <RoleGlyph kind="human" label="operator" />
      <RoleGlyph kind="agent" label="agent" />
      <RoleGlyph kind="service" label="service / mcp" />
    </div>
  );
}

function RoleGlyph({
  kind,
  label,
}: {
  kind: "human" | "agent" | "service";
  label: string;
}) {
  const c = "var(--ink-faint)";
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-muted">
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
        {kind === "agent" && (
          <circle cx={7} cy={7} r={5} fill="none" stroke={c} strokeWidth={1.5} />
        )}
        {kind === "service" && (
          <rect
            x={2.5}
            y={2.5}
            width={9}
            height={9}
            rx={2}
            fill="none"
            stroke={c}
            strokeWidth={1.5}
          />
        )}
        {kind === "human" && (
          <path
            d="M7 1.5 L12 7 L7 12.5 L2 7 Z"
            fill="none"
            stroke={c}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span className="text-ink-ghost">{label}</span>
    </span>
  );
}
