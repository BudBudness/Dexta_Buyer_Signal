# Dexta Buyer Signal — Product Constitution

## 1. Product

Dexta Buyer Signal is a vehicle buyer-intent intelligence platform.

It discovers people who are actively looking to buy or import vehicles and converts their signals into structured, evidence-backed prospects.

## 2. Users

- Vehicle importers and dealers
- Vehicle sourcing businesses
- Sales teams
- Referral/agent networks
- Automotive service businesses with legitimate buyer-lead workflows

## 3. Problem

Vehicle businesses often have access to inventory but lack a systematic way to discover and qualify people who are already expressing purchase intent across fragmented public and authorized sources.

## 4. Core workflow

Discover → Understand → Qualify → Connect.

## 5. Boundaries

### Included
- Public buyer requests.
- Publicly supplied business/contact information.
- Authorized partner feeds.
- Authenticated APIs and exports where the operator has permission.
- First-party lead forms and consent-based referrals.
- Licensed datasets where use is permitted.

### Excluded
- Hacked accounts.
- Stolen credentials.
- Leaked databases.
- Bypassing access controls.
- Private-group scraping without authorization.
- Anonymous-user deanonymization.
- Guessing private phone numbers or email addresses.
- Seller-only inventory being classified as buyer intent.

## 6. Buyer definition

A buyer signal indicates that an individual or organization is expressing a current or prospective intention to acquire a vehicle.

Examples:
- looking for
- wanted
- need
- searching for
- want to buy
- want to purchase
- can someone source
- who can import
- need someone to bring
- budget / cash available
- can you source

The engine must distinguish buyer requests from seller listings and generic vehicle discussion.

## 7. Intent scoring

Initial configurable bands:

- 90–100: HOT
- 70–89: HIGH
- 50–69: MEDIUM
- 30–49: WEAK
- 0–29: REJECT

The score is a qualification aid, not a statement of certainty. Conversion outcomes should eventually calibrate the scoring model.

## 8. Evidence

Every prospect should retain:
- source
- source URL or authorized source identifier
- original observed text or permitted excerpt
- observation timestamp
- extraction confidence
- contact permission/context where applicable

## 9. Vehicle model coverage

The engine is model-agnostic. Known makes/models improve extraction but cannot be hard limits. Unknown or newly introduced vehicle names must remain processable.

## 10. Lifecycle

new → reviewed → qualified → contacted → engaged → converted / rejected.

## 11. Success metrics

- Valid buyer-signal rate
- Buyer/seller classification precision
- Qualified-lead rate
- Contactability rate
- Duplicate rate
- Evidence completeness
- Response rate
- Conversion rate
- Time from signal observation to qualification
- Source yield and source health

## 12. Locked product identity

**Dexta Buyer Signal**

**Public & Authorized Vehicle Buyer-Intent Intelligence Platform**

**Discover → Understand → Qualify → Connect**
