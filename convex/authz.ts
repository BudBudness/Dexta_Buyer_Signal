import { getAuthUserId } from "@convex-dev/auth/server"
import { internalQuery } from "./_generated/server"
import { v } from "convex/values"
import type { MutationCtx, QueryCtx } from "./_generated/server"

type DbCtx = QueryCtx | MutationCtx

/**
 * Returns the active owner staff record for the current user, or null.
 * Never throws. Use `requireOwner` for mutations where a thrown error is
 * acceptable, or check the result directly in queries (result unions).
 */
export async function currentOwner(ctx: DbCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) return null
  const user = await ctx.db.get(userId)
  const email = user?.email
  if (!email) return null
  const normalized = String(email).toLowerCase().trim()
  const staff = await ctx.db
    .query("staff")
    .withIndex("by_email", (q) => q.eq("email", normalized))
    .unique()
  if (!staff || !staff.active || staff.role !== "owner") return null
  return staff
}

/** Throws when the caller is not the active Dexta owner. */
export async function requireOwner(ctx: DbCtx) {
  const staff = await currentOwner(ctx)
  if (!staff) throw new Error("Dexta owner access required")
  return staff
}

/** Non-throwing boolean check, callable from actions. */
export const isOwner = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => (await currentOwner(ctx)) !== null,
})
