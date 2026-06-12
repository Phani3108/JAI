-- JAI bootstrap: one Postgres instance, logically partitioned.
-- Each part owns exactly one schema namespace and never queries another part's
-- schema directly (ADR-003). LiteLLM gets its own database for virtual keys.

CREATE DATABASE litellm;

\connect jai

CREATE EXTENSION IF NOT EXISTS vector;

-- Schema namespaces, one per part
CREATE SCHEMA IF NOT EXISTS blackbox;   -- jai-blackbox: hash-chained audit events
CREATE SCHEMA IF NOT EXISTS meter;      -- jai-meter: cost ledger
CREATE SCHEMA IF NOT EXISTS cortex;     -- jai-cortex: semantic layer + vectors (P1)
CREATE SCHEMA IF NOT EXISTS engine;     -- jai-engine: runtime checkpoints
CREATE SCHEMA IF NOT EXISTS foundry;    -- jai-foundry: seeded Borealis entities
CREATE SCHEMA IF NOT EXISTS registry;   -- jai-registry: agent cards + status (P3)
