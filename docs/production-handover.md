# Dexta Buyer Signal production handover

## Application

- Current recovery deployment: https://dexta-buyer-signal-c1wux1u2e-bud-a1-os.vercel.app/
- Repository: https://github.com/BudBudness/Dexta_Buyer_Signal
- Recovery pull request: https://github.com/BudBudness/Dexta_Buyer_Signal/pull/2

## Verified so far

The Vercel deployment reached READY and its homepage returned HTTP 200. An earlier Linux workflow completed dependency installation, production dependency audit, application tests and production build: https://github.com/BudBudness/Dexta_Buyer_Signal/actions/runs/40029784532.

These checks do not prove live authentication, live Convex connectivity, or persisted business operations. Those remain unverified.

## Architecture and required configuration

The web frontend is hosted on Vercel and the data/auth backend runs on Convex. Frontend environment variables belong in Vercel. Backend variables belong in the Convex deployment. Never put private backend credentials in client-exposed variables or source control.

- VITE_CONVEX_URL: the production Convex deployment URL, configured in Vercel.
- CONVEX_SITE_URL: the matching Convex auth/site URL, configured in Convex.
- DEXTA_OWNER_EMAIL: the exact verified email of the owner account, configured in Convex.

Owner bootstrap deliberately fails closed unless DEXTA_OWNER_EMAIL is configured and matches the authenticated email. This is intentional security behavior. Do not replace it with unrestricted first-user ownership.

## Owner onboarding

1. The Dexta owner chooses the Google account they will use and confirms the verified email during handover.
2. The deployment administrator sets DEXTA_OWNER_EMAIL in the production Convex deployment and verifies the frontend/backend URLs.
3. Deploy the Convex functions and open the application.
4. The owner signs in. Bootstrap is allowed only if the configured email matches and the staff table is empty.
5. Verify the owner record, protected queries and owner-only actions.
6. Using approved test data, create a sample client request and verify it persists after refresh and appears in the correct workflow. Test related vehicle, quote and deal operations where implemented.
7. Test with a separate non-owner account and verify it cannot bootstrap or access owner-only actions. Remove test data and record the release SHA and test results.

## Release blockers

- The latest pull-request checks previously reported action_required. A new passing run is required.
- Live Convex authorization and end-to-end persistence are not verified.
- Recovery PR #2 remains open and is not merged into main.

## Safe release rule

Do not claim full production verification until the current commit passes CI, the deployed build is confirmed, the configured owner signs in successfully, unauthorized access is denied, and a test business workflow persists in the backend.