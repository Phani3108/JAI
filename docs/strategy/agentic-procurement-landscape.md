# Agentic Procurement — Competitive Landscape

> State of AI in source-to-pay software, researched June 2026. Public sources only.

## The four patterns the market converged on (2025–2026)

1. **No-code agent studios** — Coupa Navi Agent Studio (GA May 2026), Oracle AI Agent
   Studio, Ivalua IVA Studio (beta June 2026), GEP Qi Studio, Levelpath, Icertis.
2. **MCP as the integration substrate** — Ivalua, GEP, and SAP (with Anthropic) are
   explicitly MCP-based. Tool access via open protocol is now table stakes.
3. **A2A coordination layers** — Coupa Navi Connect (Sept 2026), Tonkean. Agent-to-agent
   interop matters because customers will run agents from multiple vendors.
4. **Intake/orchestration as the control point** — whoever owns the request front door
   orchestrates everyone else's agents. Coupa bought Tonkean (May 2026, est. hundreds of
   $M) for exactly this position; Zip built a $2.2B company on it.

## Vendor moves (selected, dated)

| Vendor | What shipped | Notes |
|---|---|---|
| **Coupa** | Navi agents (May 2025), 4 GA agents (Nov 2025), Compose "agentic-as-a-service" + Agent Studio (May 2026), Navi Connect A2A (Sept 2026) | Acquired Cirtuo, Scoutbee, Rossum, Tonkean — assembling an "agentic trade network." 2026 Gartner S2P Leader (highest execution, 3rd year) |
| **SAP Ariba** | Rebuilt natively on BTP (release 2602, Feb 2026); Joule Sourcing/Bid-Analysis agents GA Q1 2026; Claude as primary reasoning layer via MCP (Sapphire 2026) | Meters via AI Units (~$0.40/unit list; agent steps at 3–8× copilot rates) |
| **Oracle** | Fusion Agentic Applications incl. Sourcing Command Center (Mar–Apr 2026); AI Agent Studio | Counter-positions: agents **bundled at no extra cost** |
| **Ivalua** | IVA Studio beta (June 2026): one governed agent, platform permission inheritance, MCP, LLM-agnostic | The reference governance pattern: *the agent inherits the human's permissions and cannot exceed them; every action logged* |
| **Zycus** | Merlin Agentic AI Platform (Feb 2025); autonomous negotiation agents for tail spend | "Intake-to-outcomes" positioning |
| **GEP** | Qi — "procurement's first true agentic orchestration platform" on QUANTUM | 2026 Gartner Leader |
| **Icertis** | Vera AI + 3 contract agents (Sept 2025) | ~$350M ARR; contracts wedge |

## Where autonomous value is actually proven (not agent-washed)

| Capability | Proof point |
|---|---|
| **Autonomous negotiation** | Pactum @ Walmart: 3% avg cost gain, +35 days payment terms, 68% supplier close rate; $54M Series C (June 2025), 50+ Global 2000 customers |
| **Autonomous sourcing** | Globality @ BMS: RFP cycle 6 months → 27 days |
| **Approval orchestration** | Zip: $355B spend processed (2025); 50+ agents; OpenAI is a customer |

Everything else is largely assist/copilot value so far. **Measurable outcomes per agent
are the scarce asset** — Gartner predicts >40% of agentic projects canceled by 2027, and
MIT NANDA found ~95% of GenAI pilots deliver no P&L impact. The differentiator is not
having agents; it is *proving* them (eval pass rates, autonomous-completion rates,
cost-per-task, zero policy violations — the scorecard discipline this repo builds in).

## Analyst frame

- 2026 Gartner S2P MQ Leaders: Coupa, SAP, GEP, Oracle, Ivalua.
- Gartner: 90% of B2B buying AI-agent-intermediated by 2028 ($15T); 40% of procurement
  teams with ≥1 agent by 2028; but only 20% with data maturity for multi-agent AI by 2027.
- The strategic risk for any suite vendor: being "orchestrated from above" by an
  intake-layer agent network and reduced to a system of record. The defense is protocol
  position — expose your modules as the MCP tools every agent calls, so you remain the
  system of *action*.
