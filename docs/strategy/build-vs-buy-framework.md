# Build vs. Buy — a Layered Framework for Enterprise AI

> How to decide what to build, what to buy, and what to standardize on. Public document.

## The layer rule

Decide per layer, not per project. The stack has five layers with different churn rates
and different lock-in costs:

| Layer | Churn | Position | Rationale |
|---|---|---|---|
| **Models** | Weeks–months | **Buy, multi-source** | Frontier capability is a commodity you rent. Never couple product code to one provider — route through a gateway by model *group* |
| **Protocols** (MCP, A2A, OpenAI-compatible HTTP, JSON Schema) | Years | **Standardize** | Protocols are where network effects accrue. Betting on protocols is low-regret; they outlive frameworks |
| **Frameworks** (orchestration: LangGraph et al.) | Months | **Use, but quarantine** | Pick today's production leader, confine it to one module behind a compile seam, prove portability with a second runtime |
| **Trust layer** (audit, policy, evals, metering, HITL) | Slow | **Build** | This is the moat-grade layer: it encodes *your* governance, *your* domain policies, *your* pricing optionality. Hardest to retrofit, never differentiated by vendors enough to trust |
| **Domain capability** (your product's tools/data as MCP servers) | Slow | **Build** | This IS the product. Expose it over protocols so every agent — yours or the customer's — acts through you |

## Decision tests

For any proposed component, ask in order:

1. **Is it a protocol?** → adopt the open standard, contribute if gaps.
2. **Does it touch governance, audit, or money?** → build (own the trust layer).
3. **Is it domain knowledge/workflow?** → build, expose via MCP.
4. **Is it commodity infrastructure with a credible OSS leader?** (gateway, tracing,
   eval tooling) → adopt OSS, self-host if data-sensitive; pay for hosted only when ops
   cost exceeds license cost.
5. **Is it a frontier capability race?** (models, embeddings, OCR) → buy, multi-source,
   benchmark quarterly.

## Anti-patterns

- **Framework-as-architecture:** letting an orchestration framework's abstractions leak
  into agent definitions, evals, or tools. (Antidote: declarative manifests + a compiler.)
- **Buying the trust layer:** outsourcing audit/governance to a vendor's black box that
  your regulators and customers will hold *you* accountable for.
- **Building the model:** fine-tuning before exhausting prompting + retrieval + routing;
  pre-training anything.
- **Single-provider "partnership":** discounts now, hostage later. Multi-model is both
  the resilience story and the negotiation position.
- **Demo-ware accumulation:** five pilots with no eval harness. One narrow production
  win with a scorecard and a kill switch beats them all.
