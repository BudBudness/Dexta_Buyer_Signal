# Dexta Buyer Signal — release and client handover

## Current release status

- Repository: https://github.com/BudBudness/Dexta_Buyer_Signal
- Production domain: https://dexta-buyer-signal-bud-a1-os.vercel.app/
- Owner workspace and client-request app merged to `main` in commit `328b42b3ca9bbc459bd56bb56b4df508cf3b5483`.
- Discovery JSONL newline and empty-source guards merged to `main` in commit `66c8c6e8dc58bc772eb2414439aa277205c92cea`.
- The latest `main` production deployment and live Convex configuration still require verification.

Do not treat a successful frontend build as proof that Convex functions are deployed or that Google OAuth and discovery are operational.

## Architecture

- Source control and CI: GitHub
- Frontend hosting: Vercel
- Authentication and data: existing Convex backend
- Authentication implementation: native Convex Auth Google OAuth. No platform bridge or platform OAuth handoff is used by the application.

## Required deployment configuration

The following values must be configured in the indicated service. Never commit secrets to GitHub or expose client secrets through Vercel `VITE_*` variables.

**Vercel frontend**

- `VITE_CONVEX_URL`: URL of the production Convex deployment.

**Convex backend**

- `CONVEX_SITE_URL`: Convex Auth site URL for this deployment.
- `AUTH_GOOGLE_ID`: Google OAuth client ID.
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret.
- `DEXTA_OWNER_EMAIL`: exact verified Google account email authorized for the one-time owner bootstrap.
- `DEXTA_PUBLIC_SEARCH_ENDPOINT`: HTTPS endpoint for a search provider authorized to return public web search results. The provider accepts a JSON POST body `{"query":"..."}` and returns JSON with a `search_results` array. Each result may contain `title`, `url`, `snippet`, and `source`.
- `DEXTA_PUBLIC_SEARCH_TOKEN`: optional bearer token if required by the selected provider. Keep it in Convex environment variables only.

The Google OAuth client must include the callback URL required by the Convex Auth configuration for the production Convex deployment. Before release, confirm in the Convex dashboard that these values are configured for the production deployment and match the Google OAuth client settings.

## Secure owner onboarding

1. The Dexta owner chooses the Google account they will use for the application.
2. The deployment administrator configures the OAuth credentials and `DEXTA_OWNER_EMAIL` in Convex, then confirms `VITE_CONVEX_URL` in Vercel.
3. Deploy the Convex functions and open the application.
4. The owner signs in. The backend permits bootstrap only when the authenticated email matches `DEXTA_OWNER_EMAIL` and the staff table is empty.
5. The owner record uses the authenticated profile name when available, otherwise the email prefix. No arbitrary first visitor can claim ownership.
6. Verify that the owner can access protected queries and actions, and that a different account cannot bootstrap or access owner-only functionality.
7. With approved test data, create a sample buyer request and verify it persists after refresh and appears in the correct workflow. Verify related vehicle, quote and deal operations where implemented. Remove test data afterwards.

## Verification completed

- Linux dependency installation: pass.
- Production dependency audit: pass.
- Automated web-app tests: pass.
- Production bundle build: pass.
- Vercel preview deployment for commit `10feea7f157b0bee80bce599cd8689829dddd99d`: READY.
- Preview homepage smoke test: HTTP 200 and expected Dexta page title.
- Vercel runtime error query for the last 24 hours: no runtime errors reported.

## Discovery provider and source activation

The discovery action now calls a configurable server-side provider instead of the removed platform-specific search bridge. It deliberately fails with an actionable configuration error when `DEXTA_PUBLIC_SEARCH_ENDPOINT` is absent. No third-party source is enabled by default, and no source is represented as live until an authorized provider is configured and tested.

Only ingest public signals from sources whose access terms permit the intended use, or first-party/partner data with documented authorization. Preserve source URL, observation time and evidence. Do not scrape authenticated/private areas, bypass access controls, or infer private contact details.

## Remaining release gates

- Confirm Google OAuth credentials, `CONVEX_SITE_URL`, and `DEXTA_OWNER_EMAIL` are configured in the production Convex deployment.
- Complete a live Google sign-in using the authorized owner account and verify denial for a non-owner.
- Deploy the current Convex functions; verify that the missing platform search dependency is gone and discovery returns the explicit configuration error until a provider is configured.
- Configure an authorized HTTPS search provider and test one discovery run end-to-end, including evidence, deduplication and persisted leads.
- Confirm latest GitHub Actions and Vercel production deployment are green, then smoke-test the production domain and client-request flow.
- Verify that public request-reference lookup exposes status metadata only; all customer details remain owner-protected.

**Release decision:** not yet production-ready until live authentication, source authorization, discovery persistence and customer-request workflows pass.
