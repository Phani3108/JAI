# JAI — A Modular Agentic Platform for Procurement

> Built like a car: every part has its own name, a standalone use case, and a complete
> structure of its own — and each can be ripped out and plugged into another system over
> open protocols (MCP, A2A). Assembled together, they form an autonomous procurement
> network that runs like a well-oiled machine.
>
> **Read the founding [VISION](docs/VISION.md).**

*Not affiliated with Jaggaer, Inc. or its JAI product. All data is synthetic
([Borealis Manufacturing](docs/adr/ADR-003-single-postgres.md) is a fictional company);
all domain models are generic.*

## The Parts Catalog

```
JAI — the vehicle
│
├── 1. POWERTRAIN — intelligence supply
│   ├── jai-gateway      · multi-model LLM router: model groups, fallbacks, per-(tenant, agent)
│   │                      virtual keys & budgets                       parts/gateway
│   ├── jai-manifest     · declarative agent spec + validator — the "part drawing" every
│   │                      agent follows (autonomy L1–L5, tools, HITL gates)  parts/manifest
│   └── jai-engine       · manifest→runtime compiler (LangGraph today, swappable tomorrow —
│                          proven by a second runtime)                  parts/engine
│
├── 2. CHASSIS — knowledge
│   ├── jai-cortex       · permission-aware procurement semantic layer + hybrid retrieval
│   └── jai-foundry      · deterministic synthetic-data factory          parts/foundry
│
├── 3. DRIVETRAIN — domain capability (the plug-and-play layer)
│   └── 5 MCP servers: supplier-master · sourcing-events · contracts · spend-analytics · intake
│       (mock-backed now; hexagonal adapters swap to any real S2P system's REST APIs)
│
├── 4. SAFETY — trust (the moat-grade system)
│   ├── jai-blackbox     · hash-chained tamper-evident audit chain       parts/blackbox
│   ├── jai-governor     · policy engine: permission inheritance, spend mandates
│   ├── jai-dyno         · eval harness, scorecards, autonomy promotion gates  parts/dyno
│   ├── jai-brakes       · HITL approval gates + kill switches
│   └── jai-meter        · per-action cost ledger                        parts/meter
│
├── 5. NETWORK — the fleet
│   ├── jai-registry     · agent cards, status, autonomy levels, scorecards
│   ├── jai-mesh         · A2A interop + context propagation
│   └── agents/          · supplier-intel · sourcing · risk-sentinel · spend-analyst · negotiator
│
└── 6. COCKPIT — human interface
    └── jai-console      · chat, run timeline, approvals inbox, cost dashboard, registry
```

Every part ships with its own README, standalone demo, version, and tests. Parts
communicate only through published contracts — enforced by import-linter in CI.

## Quickstart

```sh
cp .env.example .env        # add real API keys, or leave JAI_MOCK=1 for keyless mode
make up                     # postgres + pgvector + LiteLLM gateway (docker compose)
make seed                   # generate + load the Borealis Manufacturing dataset
make smoke                  # Demo 0: an agent runs from a manifest through the gateway,
                            # writing audit events and cost-ledger rows
```

Runs fully keyless: with `JAI_MOCK=1` every model call is served by the gateway's mock
path, so the platform — audit chain, ledger, manifests, evals — is testable with zero
API spend.

## Why this exists

Procurement is drowning in agent demos and starving for **governed autonomy**. The scarce
assets are measurable outcomes per agent and trust infrastructure — permission inheritance,
tamper-evident audit, eval-gated autonomy promotion, cost-per-task accounting. JAI builds
those as first-class parts, then assembles agents on top of them.

Strategy docs: [docs/strategy/](docs/strategy/) · Architecture decisions: [docs/adr/](docs/adr/)

## License

Apache-2.0 — see [LICENSE](LICENSE).
