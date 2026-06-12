# ADR-003: Single Postgres, schema-per-part ("shared instance, shared nothing logically")

**Status:** Accepted · June 2026

## Context

The platform needs: relational entities (suppliers, contracts, POs), vectors (pgvector),
full-text search, runtime checkpoints, an append-only audit log, and a cost ledger.
Dedicated stores per concern (vector DB, event store, etc.) are production optimizations,
not architecture requirements — and they would break the one-command quickstart.

## Decision

One Postgres 16 instance (pgvector image). Each part owns exactly one schema namespace
(`blackbox`, `meter`, `cortex`, `engine`, `foundry`, `registry`) plus LiteLLM's own
database for virtual keys. **No part queries another part's schema.** Data crosses part
boundaries only through published APIs. Migrations live with the owning part.

Data has gravity: the semantic layer (`cortex`) is the hardest part to ever rip out, so
it is designed as schemas + adapters from day one — never a shared database other parts
reach into.

## Consequences

- `docker compose up` is the entire infrastructure story.
- A part extracted to its own service takes its schema with it (dump/restore of one
  namespace) — extraction stays cheap.
- Cross-schema joins are forbidden even where convenient — accepted.
