import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const serviceTypes = [
  "vehicle_sourcing",
  "insurance",
  "third_party_insurance",
  "driving_permit",
  "inspection",
  "registration",
  "event_vehicle_hire",
] as const

function randomReference(): string {
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
    email: v.optional(v.string()),
    contactPreference: v.optional(v.string()),
    serviceTypes: v.optional(v.array(v.string())),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    yearRange: v.optional(v.string()),
    budget: v.optional(v.string()),
    location: v.optional(v.string()),
    fuelTransmission: v.optional(v.string()),
    vehicleCondition: v.optional(v.string()),
    vehicleUse: v.optional(v.string()),
    eventType: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    eventLocation: v.optional(v.string()),
    hireDuration: v.optional(v.string()),
    driverPreference: v.optional(v.string()),
    vehicleClass: v.optional(v.string()),
    vehicleCount: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.object({ id: v.id("clientRequests"), reference: v.string() }),
  handler: async (ctx, args) => {
    const name = args.name.trim()
    const phone = args.phone.trim()
    const email = args.email?.trim().toLowerCase()
    if (!name || !phone) throw new Error("Name and phone are required")
    if (args.contactPreference && !["whatsapp", "email", "both"].includes(args.contactPreference)) {
      throw new Error("Choose a valid contact preference")
    }
    if (args.contactPreference && ["email", "both"].includes(args.contactPreference) && !email) {
      throw new Error("Email is required for your selected contact preference")
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address")
    }
    if (args.serviceTypes?.some((service) => !(serviceTypes as readonly string[]).includes(service))) {
      throw new Error("Choose a valid Dexta service")
    }

    assertMaxLength(name, "Name", 100)
    assertMaxLength(phone, "Phone", 40)
    assertMaxLength(email, "Email", 254)
    assertMaxLength(args.make, "Make", 80)
    assertMaxLength(args.model, "Model", 80)
    assertMaxLength(args.yearRange, "Year range", 40)
    assertMaxLength(args.budget, "Budget", 80)
    assertMaxLength(args.location, "Location", 120)
    assertMaxLength(args.fuelTransmission, "Fuel/transmission", 80)
    assertMaxLength(args.eventType, "Event type", 100)
    assertMaxLength(args.eventDate, "Event date", 40)
    assertMaxLength(args.eventLocation, "Event location", 160)
    assertMaxLength(args.hireDuration, "Hire duration", 80)
    assertMaxLength(args.driverPreference, "Driver preference", 40)
    assertMaxLength(args.vehicleClass, "Vehicle class", 100)
    assertMaxLength(args.vehicleCount, "Vehicle count", 20)
    assertMaxLength(args.notes, "Notes", 2000)

    const reference = randomReference()
    const now = Date.now()
    const id = await ctx.db.insert("clientRequests", {
      ...args,
      name,
      phone,
      email: email || undefined,
      serviceTypes: args.serviceTypes?.length ? [...new Set(args.serviceTypes)] : ["vehicle_sourcing"],
      reference,
      status: "received",
      createdAt: now,
      updatedAt: now,
    })
    return { id, reference }
  },
})

/**
 * Public tracking deliberately exposes status metadata only.
 * Personal details and internal sourcing notes remain owner-only.
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
    if (!/^DX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{12}$/.test(ref)) return null
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
