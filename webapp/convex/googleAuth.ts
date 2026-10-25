import {
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
} from "@convex-dev/auth/server"
import { ConvexError, v } from "convex/values"

import { internal } from "./_generated/api"
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server"

// Keep this set aligned with the non-Google providers registered in auth.ts.
// ResendOTP and Password are both enabled in convex/auth.ts. Only credential
// rows with a usable secret or verified-email marker count as recovery methods.
const enabledFallbackProviderIds = new Set(["resend-otp", "password"])

function accountCanRestoreAccess(account: {
  provider: string
  secret?: string
  emailVerified?: string
}) {
  // The shipped fallback methods persist one of these credential markers only
  // after the account can restore access. Placeholder or unrelated rows do not
  // make unlinking safe.
  if (!enabledFallbackProviderIds.has(account.provider)) return false
  return Boolean(account.secret?.length || account.emailVerified?.length)
}

export const unlinkGoogle = action({
  args: {},
  handler: async (ctx): Promise<{ unlinked: boolean }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Sign in before unlinking Google")
    const preparation = await ctx.runQuery(
      internal.googleAuth.prepareGoogleUnlink,
      { userId },
    )
    if (!preparation.shouldUnlink) return { unlinked: false }

    // Revoke first: if revocation fails, Google remains linked and retryable.
    // The internal mutation does not depend on the now-revoked session.
    await invalidateSessions(ctx, { userId })
    return await ctx.runMutation(internal.googleAuth.unlinkGoogleAccount, {
      userId,
    })
  },
})

export const prepareGoogleUnlink = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.googleSubject) return { shouldUnlink: false }

    const fallbackAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect()
    if (!fallbackAccounts.some(accountCanRestoreAccess)) {
      throw new ConvexError({ code: "LAST_SIGN_IN_METHOD" })
    }
    return { shouldUnlink: true }
  },
})

export const unlinkGoogleAccount = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.googleSubject) return { unlinked: false }

    const fallbackAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect()
    if (!fallbackAccounts.some(accountCanRestoreAccess)) {
      throw new ConvexError({ code: "LAST_SIGN_IN_METHOD" })
    }
    await ctx.db.patch(args.userId, { googleSubject: undefined })
    return { unlinked: true }
  },
})

export const accountSecurity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db.get(userId)
    if (!user) return null
    const fallbackAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect()
    return {
      googleLinked: Boolean(user.googleSubject),
      canUnlinkGoogle: fallbackAccounts.some(accountCanRestoreAccess),
    }
  },
})

export const revokeOtherSessions = action({
  args: {},
  handler: async (ctx) => {
    const [userId, sessionId] = await Promise.all([
      getAuthUserId(ctx),
      getAuthSessionId(ctx),
    ])
    if (!userId || !sessionId) throw new Error("Sign in to manage sessions")
    await invalidateSessions(ctx, { userId, except: [sessionId] })
    return { revoked: true }
  },
})

export const revokeAllSessions = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Sign in to manage sessions")
    await invalidateSessions(ctx, { userId })
    return { revoked: true }
  },
})
