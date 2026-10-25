# Dexta Buyer Signal — release and client handover

## Current verified preview

- Preview URL for the latest verified application code: https://dexta-buyer-signal-plrdu9vmb-bud-a1-os.vercel.app/
- Repository: https://github.com/BudBudness/Dexta_Buyer_Signal
- Release pull request: https://github.com/BudBudness/Dexta_Buyer_Signal/pull/2
- Code commit verified by CI and deployed to the preview: `10feea7f157b0bee80bce599cd8689829dddd99d`
- CI run: https://github.com/BudBudness/Dexta_Buyer_Signal/actions/runs/40206489707

This is a Vercel preview deployment, not yet the production release. The production target still points to an older deployment. Do not present the preview as a fully production-verified client handover until the Convex authentication configuration and live application workflows have been verified.

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

## Remaining release gates

- Confirm Google OAuth credentials and `DEXTA_OWNER_EMAIL` are configured in the production Convex deployment.
- Complete a live Google sign-in using the authorized owner account.
- Verify owner authorization, denial for a non-owner, and persisted buyer-signal workflows against the live backend.
- Confirm the latest commit's CI is green, then merge PR #2 and promote the verified commit to production. Do not bypass branch protection.

**Release decision:** not yet production-ready until the live Convex authentication and workflow checks pass.
