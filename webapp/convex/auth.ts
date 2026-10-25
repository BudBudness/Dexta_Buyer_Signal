import Google from "@auth/core/providers/google"
import { convexAuth } from "@convex-dev/auth/server"

// Google OAuth is handled directly by Convex Auth. No Macaly auth bridge is used.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  session: { totalDurationMs: 1000 * 60 * 60 * 24 * 30 },
})
