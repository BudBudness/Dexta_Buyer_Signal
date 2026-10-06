import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

const staffValidator = v.object({
  _id: v.id("staff"),
  _creationTime: v.number(),
  email: v.string(),
  name: v.string(),
  role: v.string(),
  active: v.boolean(),
})

async function identityEmail(ctx: any) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity?.email) throw new Error("Authenticated email is required")
  return identity.email.toLowerCase().trim()
}

export const bootstrap = mutation({
  args: { name: v.optional(v.string()) },
  returns: v.object({ role: v.string(), name: v.string() }),
  handler: async (ctx, args) => {
    const email = await identityEmail(ctx)
    const existing = await ctx.db.query("staff").collect()
    const mine = existing.find(x => x.email === email)
    if (mine) {
      if (!mine.active) throw new Error("This Moses account is inactive")
      return { role: mine.role, name: mine.name }
    }
    if (existing.length > 0) throw new Error("This account is not authorized for Dexta operations")
    const name = args.name?.trim() || "Moses"
    await ctx.db.insert("staff", { email, name, role: "owner", active: true })
    return { role: "owner", name }
  },
})

export const me = query({
  args: {},
  returns: v.union(v.null(), staffValidator),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity?.email) return null
    const email = identity.email.toLowerCase().trim()
    return (await ctx.db.query("staff").collect()).find(x => x.email === email) ?? null
  },
})

export const assertOwner = query({
  args: {},
  returns: v.boolean(),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity?.email) return false
    const email = identity.email.toLowerCase().trim()
    const staff = (await ctx.db.query("staff").collect()).find(x => x.email === email)
    return Boolean(staff?.active && staff.role === "owner")
  },
})
