import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

function randomReference(): string {
  // Unpredictable 12-character code (Crockford-style base32, no ambiguous 0/O/1/I)
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  let code = ""
  for (const b of bytes) code += alphabet[b % alphabet.length]
  return "DX-" + code
}

function assertMaxLength(value: string | undefined, field: string, max: number) {
  if (value !== undefined && value.length > max) {
    throw new Error(`${field} must be ${max} characters or fewer`)
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    yearRange: v.optional(v.string()),
    budget: v.optional(v.string()),
    location: v.optional(v.string()),
    fuelTransmission: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.object({ id: v.id("clientRequests"), reference: v.string() }),
  handler: async (ctx, args) => {
    const name = args.name.trim()
    const phone = args.phone.trim()
    if (!name || !phone) throw new Error("Name and phone are required")

    assertMaxLength(name, "Name", 100)
    assertMaxLength(phone, "Phone", 40)
    assertMaxLength(args.make, "Make", 80)
    assertMaxLength(args.model, "Model", 80)
    assertMaxLength(args.yearRange, "Year range", 40)
    assertMaxLength(args.budget, "Budget", 80)
    assertMaxLength(args.location, "Location", 120)
    assertMaxLength(args.fuelTransmission, "Fuel/transmission", 80)
    assertMaxLength(args.notes, "Notes", 2000)

    const reference = randomReference()
    const now = Date.now()
    const id = await ctx.db.insert("clientRequests", {
      ...args,
      name,
      phone,
      reference,
      status: "new",
      createdAt: now,
      updatedAt: now,
    })
    return { id, reference }
  },
})

/**
 * Public tracking deliberately exposes status metadata only.
 * Personal details remain available only through owner-protected operations.
 */
export const getByReference = query({
  args: { reference: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      reference: v.string(),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const ref = args.reference.trim().toUpperCase()
    const request = (await ctx.db
      .query("clientRequests")
      .withIndex("by_reference", (q) => q.eq("reference", ref))
      .take(1))[0]
    if (!request) return null
    return {
      reference: request.reference,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }
  },
})
