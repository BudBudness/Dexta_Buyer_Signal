# Cloudflare Migration Plan — Dexta Buyer Signal

Status: target architecture and release specification. This document does not claim a production migration, data export or live deployment.

## Target platform
- Cloudflare Workers for the application/API runtime, with a static frontend where possible.
- D1 for owner workspace, buyer requests, lead records, source observations, workflow state and audit events.
- R2 for evidence snapshots and generated reports with immutable object keys and checksums.
- Queues for scheduled discovery and long-running ingestion jobs, with idempotent run state in D1.
- Cloudflare Access with MFA for the owner/admin workspace. Public customer request-reference lookup remains narrowly scoped and reveals status metadata only.
- GitHub Actions for deterministic build, tests, scheduled research orchestration and release records.
- Termux for authorized local operator workflows.

## Provider retirement
- Replace Vercel hosting and deployment assumptions with Cloudflare Workers/Pages deployment.
- Replace Convex functions, persistence and Convex Auth with D1-backed server-side repositories and explicit authorization.
- Remove Google OAuth dependency. Use Cloudflare Access for the single-owner administrative surface; any future multi-user identity must use an independently specified, non-Google application identity flow.
- Preserve existing public buyer-request intake and owner-only access boundaries. Do not expose private customer details through public references.
- Do not add a third-party search source until its terms permit the intended use and its endpoint, rate limits, provenance and data-retention policy are documented.

## Data migration and integrity
- Inventory Convex tables, indexes, functions, auth identities, scheduled jobs, files and production data before migration.
- Export and checksum all authorized Convex data and files before any cutover. Validate row counts, references, timestamps, state transitions and restore from the export.
- D1 schema and migration scripts must preserve deduplication, source provenance, lead status, customer-request privacy and audit history.
- R2 evidence objects require content hashes, source URLs, observed-at timestamps and retention rules.
- No export or recovery is claimed by this plan. Never delete or disable Convex resources until a verified export, restore drill and rollback window are complete.

## Acceptance gates
1. Enumerate all Convex schema/functions/auth/cron/storage dependencies and map each to D1, R2, Queues or Worker code.
2. Export, checksum and restore the existing production data in a non-production target.
3. Verify owner authentication with MFA and denial of unauthorized identities.
4. Verify public request-reference lookup returns only permitted status fields; private customer data stays owner-only.
5. Verify discovery source authorization, evidence lineage, deduplication and interrupted-write recovery.
6. Verify D1 backup restore, R2 object recovery and queue retry/idempotency.
7. Run production browser E2E and cut over only after rollback is proven.

## Current limitations
The existing handover describes Vercel + Convex + Google OAuth. It reports frontend CI/preview checks but explicitly leaves live Google sign-in, production Convex configuration, discovery source activation and customer-request workflow verification outstanding. Cloudflare resources and production deployment require an authorized Cloudflare control-plane session.
