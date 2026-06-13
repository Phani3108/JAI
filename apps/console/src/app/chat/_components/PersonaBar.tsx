"use client";

import { SystemBadge } from "@/components/ui";
import { COLORS, withAlpha } from "@/lib/theme";
import type { Meta } from "@/lib/api";

import { roleLabel, roleScope } from "./personas";

interface PersonaBarProps {
  meta: Meta | null;
  role: string;
  tenant: string;
  offline: boolean;
  onRole: (role: string) => void;
  onTenant: (tenant: string) => void;
}

const ROLE_ORDER = ["requester", "category_manager", "cpo"] as const;

/** A labelled instrument <select> styled onto the cockpit tokens. */
function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="label-cap">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring metric appearance-none rounded-md border border-line bg-panel-2 py-1.5 pl-2.5 pr-7 text-[13px] text-ink transition-colors hover:border-line-strong"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-ink-faint"
          fill="none"
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );
}

/**
 * PersonaBar — the cockpit's identity dial. Picks the role × tenant the agent
 * answers as, and surfaces exactly what that persona is allowed to see. This is
 * the permission story made visible: change the role, change the answers.
 */
export function PersonaBar({
  meta,
  role,
  tenant,
  offline,
  onRole,
  onTenant,
}: PersonaBarProps) {
  const roles = meta?.roles ?? [...ROLE_ORDER];
  // Keep the canonical order when the API returns the same set.
  const orderedRoles = ROLE_ORDER.every((r) => roles.includes(r))
    ? [...ROLE_ORDER]
    : roles;

  const tenants =
    meta?.tenants ?? [{ id: "TEN-0001", name: "Borealis North America" }];

  const scope = roleScope(role);

  return (
    <div className="panel relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(to right, ${withAlpha(
            COLORS.autonomy,
            0.8,
          )}, transparent 55%)`,
        }}
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <SystemBadge system="NETWORK" />
          <span className="metric text-[13px] font-medium text-ink">
            agent-supplier-intel
          </span>
        </div>

        <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />

        <Selector
          label="acting as"
          value={role}
          onChange={onRole}
          options={orderedRoles.map((r) => ({ value: r, label: roleLabel(r) }))}
        />
        <Selector
          label="tenant"
          value={tenant}
          onChange={onTenant}
          options={tenants.map((t) => ({ value: t.id, label: t.name }))}
        />

        <span
          className="metric ml-auto text-[10px] tracking-wider"
          style={{ color: offline ? COLORS.warn : COLORS.inkFaint }}
        >
          {offline ? "meta offline · reference personas" : "persona-scoped"}
        </span>
      </div>

      {scope && (
        <div className="flex items-start gap-2 border-t border-line/70 bg-base-2/40 px-4 py-2.5">
          <ShieldGlyph />
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Answers are scoped to{" "}
            <span className="metric text-autonomy">{roleLabel(role)}</span>{" "}
            permissions — {scope}. Permission checks run{" "}
            <span className="text-ink">below the model</span>; ask for something
            out of scope and you&rsquo;ll see a refusal, not a leak.
          </p>
        </div>
      )}
    </div>
  );
}

function ShieldGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-autonomy"
      fill="none"
    >
      <path
        d="M8 1.5 13 3.5v4.2c0 3-2 5.2-5 6.8-3-1.6-5-3.8-5-6.8V3.5L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M5.8 8 7.3 9.5 10.2 6.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
