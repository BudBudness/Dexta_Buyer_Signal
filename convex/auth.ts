{
  "file": {
    "path": "convex/auth.ts",
    "content": "import { convexAuth } from \"@convex-dev/auth/server\"\nimport { Password } from \"@convex-dev/auth/providers/Password\"\nimport { ResendOTP } from \"./ResendOTP\"\nimport { MacalyGoogle } from \"./MacalyGoogle\"\nimport { createProviderUser } from \"./authUsers\"\n\nexport const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({\n  providers: [ResendOTP, Password({ reset: ResendOTP, verify: ResendOTP }), MacalyGoogle],\n  callbacks: { createOrUpdateUser: createProviderUser },\n  session: { totalDurationMs: 1000 * 60 * 60 * 24 * 30 },\n})\n",
    "totalLines": 11
  }
}