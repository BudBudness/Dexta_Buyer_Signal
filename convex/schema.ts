import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,
  staff: defineTable({
    email: v.string(), name: v.string(), role: v.string(), active: v.boolean(),
  }).index("by_email", ["email"]),
  leads: defineTable({
    publicName: v.string(), username: v.optional(v.string()), source: v.string(), sourceType: v.string(),
    sourceUrl: v.string(), observedAt: v.number(), city: v.optional(v.string()), region: v.optional(v.string()),
    country: v.string(), make: v.string(), model: v.string(), yearMin: v.optional(v.number()), yearMax: v.optional(v.number()),
    mileageMax: v.optional(v.number()), fuelType: v.optional(v.string()), transmission: v.optional(v.string()),
    drivetrain: v.optional(v.string()), budgetMin: v.optional(v.number()), budgetMax: v.optional(v.number()), currency: v.string(),
    intentText: v.string(), intentType: v.string(), intentStrength: v.number(), urgency: v.string(),
    importRequired: v.boolean(), publicContact: v.optional(v.string()), contactType: v.optional(v.string()),
    contactSource: v.optional(v.string()), contactContext: v.optional(v.string()), contactConfidence: v.number(),
    authorizationContext: v.optional(v.string()), permissionContext: v.optional(v.string()),
    evidenceText: v.optional(v.string()), evidenceCapturedAt: v.optional(v.number()), sourceConfidence: v.number(),
    leadStatus: v.string(), firstSeen: v.number(), lastSeen: v.number(),
  }).index("by_intent", ["intentType", "intentStrength"]).index("by_status", ["leadStatus", "lastSeen"])
    .index("by_make_model", ["make", "model", "lastSeen"]).index("by_contact", ["contactType", "lastSeen"])
    .index("by_source", ["source", "lastSeen"]),
  contacts: defineTable({
    leadId: v.id("leads"), contact: v.string(), contactType: v.string(), contactSource: v.string(),
    contactContext: v.optional(v.string()), contactConfidence: v.number(),
    authorizationContext: v.optional(v.string()), permissionContext: v.optional(v.string()),
  }).index("by_lead", ["leadId"]),
  sources: defineTable({
    name: v.string(), kind: v.string(), enabled: v.boolean(), queryTemplates: v.array(v.string()),
    status: v.string(), lastRun: v.optional(v.number()), lastSearched: v.number(), resultCount: v.number(),
    qualifiedCount: v.number(), notes: v.optional(v.string()),
  }).index("by_enabled", ["enabled", "lastSearched"]),
  discoveryRuns: defineTable({
    startedAt: v.number(), completedAt: v.optional(v.number()), queryCount: v.number(),
    candidates: v.number(), created: v.number(), updated: v.number(), status: v.string(), error: v.optional(v.string()),
  }).index("by_started", ["startedAt"]),
  clientRequests: defineTable({
    reference: v.string(), name: v.string(), phone: v.string(), make: v.optional(v.string()), model: v.optional(v.string()),
    yearRange: v.optional(v.string()), budget: v.optional(v.string()), location: v.optional(v.string()),
    fuelTransmission: v.optional(v.string()), notes: v.optional(v.string()), status: v.string(),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_reference", ["reference"]).index("by_status", ["status", "updatedAt"]),
  vehicles: defineTable({
    requestId: v.optional(v.id("clientRequests")), make: v.string(), model: v.string(), year: v.number(),
    mileage: v.optional(v.number()), fuel: v.optional(v.string()), transmission: v.optional(v.string()),
    source: v.string(), sourceUrl: v.optional(v.string()), purchasePrice: v.number(), importCost: v.number(),
    transportCost: v.number(), landedCost: v.number(), expectedPrice: v.number(), currency: v.string(),
    status: v.string(), notes: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_request", ["requestId", "updatedAt"]).index("by_status", ["status", "updatedAt"]),
  quotes: defineTable({
    requestId: v.id("clientRequests"), vehicleId: v.optional(v.id("vehicles")), amount: v.number(),
    currency: v.string(), validUntil: v.optional(v.number()), status: v.string(), notes: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_request", ["requestId", "updatedAt"]).index("by_status", ["status", "updatedAt"]),
  deals: defineTable({
    requestId: v.id("clientRequests"), vehicleId: v.optional(v.id("vehicles")), quoteId: v.optional(v.id("quotes")),
    agreedPrice: v.number(), currency: v.string(), deposit: v.number(), balance: v.number(),
    paymentStatus: v.string(), documentStatus: v.string(), shippingStatus: v.string(), deliveryStatus: v.string(),
    status: v.string(), notes: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_request", ["requestId", "updatedAt"]).index("by_status", ["status", "updatedAt"]),
  documents: defineTable({
    requestId: v.id("clientRequests"), kind: v.string(), name: v.string(), status: v.string(),
    reference: v.optional(v.string()), notes: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_request", ["requestId", "updatedAt"]),
})
