# Dexta Buyer Signal production handover

## Application

- Current recovery deployment: https://dexta-buyer-signal-c1wux1u2e-bud-a1-os.vercel.app/
- Repository: https://github.com/BudBudness/Dexta_Buyer_Signal
- Release pull request: https://github.com/BudBudness/Dexta_Buyer_Signal/pull/2

## Verified so far

The current Vercel deployment previously reached READY and its homepage returned HTTP 200. An earlier Linux workflow completed dependency installation, production dependency audit, application tests and production build: https://github.com/BudBudness/Dexta_Buyer_Signal/actions/runs/40029784532.

The web-app CI run for the current code revision is in progress or must be checked at https://github.com/BudBudness/Dexta_Buyer_Signal/actions. A successful homepage response does not prove live authentication, backend access or persisted business operations.

## Architecture and required configuration

The frontend is hosted on Vercel and the application backend runs on Convex. Authentication uses native Convex Auth Google OAuth; it no longer relies on a platform OAuth handoff.

Configure these values in the correct service, never in source control:

- `VITE_CONVEX_URL`: production Convex deployment URL, configured in Vercel.
- `CONVEX_SITE_URL`: the Convex Auth site URL for the production deployment, configured in Convex.
- `AUTH_GOOGLE_ID`: Google OAuth client ID, configured in Convex.
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret, configured in Convex.
- `DEXTA_OWNER_EMAIL`: exact verified email authorized for one-time owner bootstrap, configured in Convex.

The Google OAuth client must allow the production Convex Auth callback URL shown in the Convex Auth setup instructions for this deployment. Do not put the Google client secret in Vercel's client-exposed environment variables.

Owner bootstrap deliberately fails closed unless `DEXTA_OWNER_EMAIL` is configured and matches the authenticated email. Do not enable unrestricted first-user ownership.

## Owner onboarding

1. The Dexta owner chooses their Google account and confirms the verified email during handover.
2. Configure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `CONVEX_SITE_URL`, and `DEXTA_OWNER_EMAIL` in the production Convex deployment. Confirm `VITE_CONVEX_URL` in Vercel.
3. Deploy the Convex functions and open the application.
4. The owner signs in. Bootstrap is allowed only if the configured email matches and the staff table is empty.
5. Verify the owner record, protected queries and owner-only actions.
6. Using approved test data, create a sample client request and verify it persists after refresh and appears in the correct workflow. Test related vehicle, quote and deal operations where implemented.
7. Test with a separate non-owner account and verify it cannot bootstrap or access owner-only actions. Remove test data and record the release SHA and test results.

## Release blockers

- The current revision needs a passing web-app CI run after the authentication change.
- Live Convex OAuth configuration, owner authorization and end-to-end persistence have not yet been verified.
- Release pull request #2 remains open and is not merged into `main`.

## Safe release rule

Do not claim full production verification until the current commit passes CI, the deployed build is confirmed, the configured owner signs in successfully, unauthorized access is denied, and a test business workflow persists in the backend.
