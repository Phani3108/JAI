"use client";

import { useCallback, useMemo, useState } from "react";

import { Panel, Pill, SectionHeader, Spinner } from "@/components/ui";
import {
  fetchNetwork,
  fetchRegistry,
  fetchRuns,
  type AgentRecord,
  type RunSummary,
} from "@/lib/api";
import {
  REFERENCE_NETWORK,
  type NetworkNode,
  type NetworkTopology,
} from "@/lib/fleet";
import type { Status } from "@/lib/theme";
import { usePoll } from "@/lib/usePoll";

import { FleetGraph } from "./_components/FleetGraph";
import { HopsTicker } from "./_components/HopsTicker";
import { Legend } from "./_components/Legend";
import { NodeDetail } from "./_components/NodeDetail";
import {
  indexRegistry,
  offlineRegistry,
  resolveNode,
  type NodeView,
} from "./_components/resolve";

export default function NetworkPage() {
  const [selected, setSelected] = useState<string | null>(null);

  // --- live topology (falls back to the reference fleet) ---
  const net = usePoll<NetworkTopology>(fetchNetwork, 8000);
  const topology: NetworkTopology = useMemo(() => {
    const live = net.data;
    if (live && live.nodes.length > 0) return live;
    return REFERENCE_NETWORK;
  }, [net.data]);

  // --- live registry (falls back to fleet-derived records) ---
  const reg = usePoll<AgentRecord[]>(fetchRegistry, 8000);
  const registry: Map<string, AgentRecord> = useMemo(() => {
    if (reg.data && reg.data.length > 0) return indexRegistry(reg.data);
    return offlineRegistry();
  }, [reg.data]);

  // --- live runs for the optional hops ticker ---
  const runsFetch = useCallback(() => fetchRuns(), []);
  const runs = usePoll<RunSummary[]>(runsFetch, 4000);

  // The graph topology offline state: only count the two structural feeds.
  const offline = net.offline || reg.offline;
  // First paint: keep a spinner until at least the topology has resolved once.
  const booting = !net.loaded && net.data === null;

  // Resolve the selected node into a full inspectable view.
  const nodeViews: NodeView[] = useMemo(
    () => topology.nodes.map((n) => resolveNode(n, registry)),
    [topology.nodes, registry],
  );
  const selectedView = useMemo(
    () => nodeViews.find((n) => n.id === selected) ?? null,
    [nodeViews, selected],
  );

  // Status accessor for the graph (registry → status, else active).
  const statusOf = useCallback(
    (id: string): Status => {
      const rec = registry.get(id);
      return (rec?.status as Status) ?? "active";
    },
    [registry],
  );

  // Light up edges whose source agent appears in a recent run — "hot" A2A.
  const hotEdges = useMemo(
    () => deriveHotEdges(topology, runs.data ?? []),
    [topology, runs.data],
  );

  const agentCount = topology.nodes.filter((n) => n.id.startsWith("agent-")).length;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        kicker="network · the fleet"
        title="Fleet"
        subtitle="The agent-to-agent mesh, live. Watch intake flow from the operator through the orchestrator out to the specialists and the MCP services. Click any node to inspect its mandate, autonomy, and scorecard."
        action={
          <div className="flex items-center gap-2">
            <Pill tone="accent">{agentCount} agents</Pill>
            <Pill tone="neutral">{topology.edges.length} links</Pill>
            {offline && (
              <Pill tone="warn" className="whitespace-nowrap">
                reference fleet
              </Pill>
            )}
          </div>
        }
      />

      {offline && (
        <p className="-mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-warn"
            aria-hidden
          />
          live telemetry offline — showing reference fleet
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* --- the graph --- */}
        <Panel
          accent="NETWORK"
          grid
          flush
          title="fleet mesh"
          action={
            <span className="metric text-[10px] tracking-wider text-ink-faint">
              a2a · live
            </span>
          }
        >
          {booting ? (
            <div className="flex h-[480px] items-center justify-center">
              <Spinner label="resolving fleet topology…" />
            </div>
          ) : (
            <div className="px-2 pt-3 pb-1">
              <FleetGraph
                nodes={topology.nodes as NetworkNode[]}
                edges={topology.edges}
                selected={selected}
                statusOf={statusOf}
                hotEdges={hotEdges}
                onSelect={(id) => setSelected((s) => (s === id ? null : id))}
              />
            </div>
          )}
          <div className="border-t border-line">
            <HopsTicker runs={runs.data ?? []} offline={runs.offline} />
          </div>
          <div className="border-t border-line">
            <Legend />
          </div>
        </Panel>

        {/* --- the inspector --- */}
        <Panel
          accent={selectedView ? selectedView.system : "none"}
          title="node inspector"
          action={
            selected ? (
              <button
                onClick={() => setSelected(null)}
                className="focus-ring rounded px-1.5 py-0.5 font-mono text-[10px] text-ink-faint transition-colors hover:text-ink"
              >
                clear
              </button>
            ) : undefined
          }
          flush
        >
          <NodeDetail node={selectedView} offline={offline} />
        </Panel>
      </div>
    </div>
  );
}

/**
 * Mark an edge "hot" when its source agent shows up in a recent run — a cheap,
 * graceful way to make the live mesh react to real activity. Best-effort: if
 * runs lack an agent field, no edges light up (the ambient packets still flow).
 */
function deriveHotEdges(
  topology: NetworkTopology,
  runs: RunSummary[],
): Set<string> {
  const activeAgents = new Set<string>();
  for (const r of runs.slice(0, 12)) {
    const a = (r.agent as string | null | undefined) ?? null;
    if (a) activeAgents.add(a);
  }
  const hot = new Set<string>();
  if (activeAgents.size === 0) return hot;
  for (const e of topology.edges) {
    if (activeAgents.has(e.source) || activeAgents.has(e.target)) {
      hot.add(`${e.source}->${e.target}`);
    }
  }
  return hot;
}
