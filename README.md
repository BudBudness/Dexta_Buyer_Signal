# Dexta Buyer Signal

**Public & Authorized Vehicle Buyer-Intent Intelligence Platform**

> Discover → Understand → Qualify → Connect

Dexta Buyer Signal detects public, authorized-private, and first-party signals that indicate someone is actively looking to purchase or import a vehicle. It turns those signals into structured, evidence-backed prospects.

## Scope

- Uganda first; geography is extensible.
- All vehicle makes and models.
- Public web signals, authorized partner/CRM/API data, and first-party opt-in leads.
- Evidence preservation, buyer/seller separation, deduplication, intent scoring and qualification.
- No unauthorized private-data access, credential abuse, access-control bypass, deanonymization, leaked/stolen datasets, or guessed private contact details.

## Current stack

- **Macaly** — application UI, hosting and product workspace.
- **TanStack Start + React + Vite + Tailwind** — web application.
- **Convex** — live application data and backend functions.
- **GitHub** — source-of-truth repository, engineering lifecycle and future scheduled intelligence jobs.

## Product pipeline

Public / authorized source → ingestion → buyer-signal detection → relevance filter → entity extraction → vehicle requirement extraction → contact/permission context → deduplication → intent scoring → evidence-backed prospect → qualification → outreach → conversion feedback.

## Status

MVP dashboard and live Convex dataset are implemented in the Macaly workspace. The GitHub repository is the engineering/product source-of-truth for the system specification and subsequent intelligence-engine development.

## Data boundary

Only data that is public, legitimately authorized, user-owned, licensed, consent-based, or first-party may enter the platform.

## Core prospect fields

Identity, source, source URL, observation time, location, make/model, year range, budget/currency, vehicle requirements, import requirement, intent text, intent strength, urgency, source confidence, contact confidence, permission context, lifecycle status and evidence.
