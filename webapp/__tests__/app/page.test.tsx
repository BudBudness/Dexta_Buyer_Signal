import { afterEach, describe, expect, it } from "vitest"
import { convexTest } from "convex-test"
import schema from "../../convex/schema"
import { api } from "../../convex/_generated/api"

const modules = import.meta.glob("../../convex/**/*.ts")
const originalOwnerEmail = process.env.DEXTA_OWNER_EMAIL

afterEach(() => {
  if (originalOwnerEmail === undefined) delete process.env.DEXTA_OWNER_EMAIL
  else process.env.DEXTA_OWNER_EMAIL = originalOwnerEmail
})

describe("Dexta owner bootstrap authorization", () => {
  it("fails closed when no owner email is configured", async () => {
    delete process.env.DEXTA_OWNER_EMAIL
    const t = convexTest(schema, modules)
    await expect(
      t.withIdentity({ email: "attacker@example.com" }).mutation(api.staff.bootstrap, { name: "Attacker" }),
    ).rejects.toThrow("not authorized")
  })

  it("only allows the configured owner to bootstrap an empty staff table", async () => {
    process.env.DEXTA_OWNER_EMAIL = "moses@example.com"
    const t = convexTest(schema, modules)
    const result = await t.withIdentity({ email: "moses@example.com" }).mutation(api.staff.bootstrap, { name: "Moses" })
    expect(result).toEqual({ role: "owner", name: "Moses" })
    await expect(
      t.withIdentity({ email: "other@example.com" }).mutation(api.staff.bootstrap, { name: "Other" }),
    ).rejects.toThrow("not authorized")
  })

  it("does not grant owner access to a non-configured account", async () => {
    process.env.DEXTA_OWNER_EMAIL = "moses@example.com"
    const t = convexTest(schema, modules)
    await expect(
      t.withIdentity({ email: "other@example.com" }).mutation(api.staff.bootstrap, { name: "Other" }),
    ).rejects.toThrow("not authorized")
  })
})

describe("public Dexta service requests", () => {
  it("accepts a public request with multiple services and keeps public tracking private", async () => {
    const t = convexTest(schema, modules)
    const created = await t.mutation(api.clientRequests.create, {
      name: "Test Client",
      phone: "+256700000000",
      email: "client@example.com",
      contactPreference: "both",
      serviceTypes: ["vehicle_sourcing", "third_party_insurance", "event_vehicle_hire"],
      make: "Toyota",
      model: "Harrier",
      budget: "UGX 80,000,000",
      eventType: "Wedding",
      eventDate: "2026-12-12",
      driverPreference: "Chauffeur-driven",
      vehicleClass: "Premium SUV",
    })
    expect(created.reference).toMatch(/^DX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{12}$/)
    const tracked = await t.query(api.clientRequests.getByReference, { reference: created.reference.toLowerCase() })
    expect(tracked).toMatchObject({ reference: created.reference, status: "received" })
    expect(tracked).not.toHaveProperty("name")
    expect(tracked).not.toHaveProperty("phone")
    expect(tracked).not.toHaveProperty("email")
    expect(tracked).not.toHaveProperty("notes")
  })

  it("requires an email when email contact is selected", async () => {
    const t = convexTest(schema, modules)
    await expect(t.mutation(api.clientRequests.create, {
      name: "Test Client",
      phone: "+256700000000",
      contactPreference: "email",
    })).rejects.toThrow("Email is required")
  })

  it("rejects invalid service types and malformed email addresses", async () => {
    const t = convexTest(schema, modules)
    await expect(t.mutation(api.clientRequests.create, {
      name: "Test Client",
      phone: "+256700000000",
      email: "not-an-email",
    })).rejects.toThrow("valid email")
    await expect(t.mutation(api.clientRequests.create, {
      name: "Test Client",
      phone: "+256700000000",
      serviceTypes: ["invented_service"],
    })).rejects.toThrow("valid Dexta service")
  })

  it("does not expose personal data for an unknown or malformed reference", async () => {
    const t = convexTest(schema, modules)
    expect(await t.query(api.clientRequests.getByReference, { reference: "DX-NOT-A-VALID-REFERENCE" })).toBeNull()
    expect(await t.query(api.clientRequests.getByReference, { reference: "DX-23456789ABCDEFGHJKMNP" })).toBeNull()
  })
})
