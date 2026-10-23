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
