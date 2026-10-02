# Dexta Buyer Signal — Architecture

## System

```
                 ┌───────────────────────────┐
                 │ PUBLIC / AUTHORIZED /      │
                 │ FIRST-PARTY DATA SOURCES  │
                 └─────────────┬─────────────┘
                               ↓
                    ┌────────────────────┐
                    │ SOURCE INGESTION   │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ SIGNAL DETECTION   │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ RELEVANCE FILTER   │
                    └─────────┬──────────┘
                              ↓
                 ┌───────────────────────────┐
                 │ ENTITY + VEHICLE PARSING  │
                 └─────────────┬─────────────┘
                               ↓
                 ┌───────────────────────────┐
                 │ CONTACT / PERMISSION      │
                 │ CONTEXT EXTRACTION        │
                 └─────────────┬─────────────┘
                               ↓
                    ┌────────────────────┐
                    │ DEDUP / RESOLUTION │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ INTENT SCORING     │
                    └─────────┬──────────┘
                              ↓
                 ┌───────────────────────────┐
                 │ EVIDENCE-BACKED PROSPECT │
                 └─────────────┬─────────────┘
                               ↓
              ┌────────────────┴────────────────┐
              ↓                                 ↓
       QUALIFICATION                        ALERT / EXPORT
              ↓                                 ↓
          OUTREACH                         SALES WORKFLOW
              ↓                                 ↓
              └──────────── CONVERSION ─────────┘
                              ↓
                     MODEL FEEDBACK LOOP
```

## Runtime platform

### Macaly
- Product dashboard
- Prospect explorer
- Search/filter UI
- Evidence viewer
- Lead lifecycle controls
- Hosting/publishing

### Convex
- Prospect records
- Source metadata
- Realtime queries
- Backend mutations/actions
- Indexes
- Future scheduled intelligence state

### GitHub
- Product source of truth
- Intelligence engine source
- Data contracts
- Tests
- GitHub Actions
- Versioned datasets/evidence metadata
- Scheduled discovery/orchestration

## Future intelligence-engine modules

```
intelligence/
├── discovery/
├── adapters/
├── normalization/
├── buyer_detection/
├── seller_filter/
├── vehicle_extraction/
├── location_extraction/
├── budget_extraction/
├── contact_context/
├── entity_resolution/
├── deduplication/
├── scoring/
├── evidence/
├── quality/
└── evaluation/
```

## Source adapters

Each adapter must expose a common normalized event contract:

- source
- source_type
- source_identifier
- source_url
- observed_at
- raw_text_or_permitted_excerpt
- author/public identity fields when legitimately available
- public/authorized contact fields
- authorization/permission context

## Data contract

A prospect contains:

- identity/public identifier
- source/evidence
- location
- vehicle requirement
- budget
- import requirement
- intent text
- intent score
- urgency
- confidence
- contact context
- lifecycle status
- first/last seen

## Security

- No secrets in browser code.
- No unauthorized source access.
- No private-data inference.
- Least-privilege source credentials.
- Audit source authorization.
- Preserve provenance.
- Separate raw evidence from derived fields.
- Do not log sensitive credentials or unnecessary personal data.

## Scaling path

MVP: Convex + GitHub-native datasets.

When ingestion volume or transactional requirements justify it, storage can be separated from the application layer without changing the normalized data contract.
