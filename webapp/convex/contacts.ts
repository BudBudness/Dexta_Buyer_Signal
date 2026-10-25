import { paginationOptsValidator, paginationResultValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { currentOwner, requireOwner } from "./authz"

const contactValidator = v.object({
  _id: v.id("contacts"), _creationTime: v.number(), leadId: v.id("leads"),
  contact: v.string(), contactType: v.string(), contactSource: v.string(),
  contactContext: v.optional(v.string()), contactConfidence: v.number(),
  authorizationContext: v.optional(v.string()), permissionContext: v.optional(v.string()),
})

export const listForLead = query({
  args: { leadId: v.id("leads"), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(contactValidator),
  handler: async (ctx, args) => {
    if (!(await currentOwner(ctx))) return { page: [], isDone: true, continueCursor: "" }
    return ctx.db.query("contacts").withIndex("by_lead", q => q.eq("leadId", args.leadId)).paginate(args.paginationOpts)
  },
})

export const getForLead = query({
  args: { leadId: v.optional(v.id("leads")) },
  returns: v.array(contactValidator),
  handler: async (ctx, args) => {
    if (!args.leadId) return []
    if (!(await currentOwner(ctx))) return []
    return await ctx.db.query("contacts").withIndex("by_lead", q => q.eq("leadId", args.leadId!)).collect()
  },
})

export const create = mutation({
  args: {
    leadId: v.id("leads"), contact: v.string(), contactType: v.string(),
    contactSource: v.string(), contactContext: v.optional(v.string()),
    contactConfidence: v.number(), authorizationContext: v.optional(v.string()),
    permissionContext: v.optional(v.string()),
  },
  returns: v.id("contacts"),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    if (!args.contact.trim()) throw new Error("Contact is required")
    if (args.contactSource.toLowerCase().includes("private") && !args.authorizationContext && !args.permissionContext) {
      throw new Error("Authorized private contact requires authorization or permission context")
    }
    return ctx.db.insert("contacts", { ...args, contact: args.contact.trim() })
  },
})

