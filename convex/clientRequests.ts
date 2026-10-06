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

export const create = mutation({
  args:{name:v.string(),phone:v.string(),make:v.optional(v.string()),model:v.optional(v.string()),yearRange:v.optional(v.string()),budget:v.optional(v.string()),location:v.optional(v.string()),fuelTransmission:v.optional(v.string()),notes:v.optional(v.string())},
  returns:v.object({id:v.id("clientRequests"),reference:v.string()}),
  handler:async(ctx,args)=>{
    const name=args.name.trim(), phone=args.phone.trim()
    if(!name||!phone) throw new Error("Name and phone are required")
    const reference=randomReference()
    const now=Date.now()
    const id=await ctx.db.insert("clientRequests",{...args,name,phone,reference,status:"new",createdAt:now,updatedAt:now})
    return {id,reference}
  }
})
export const getByReference = query({
  args:{reference:v.string()},returns:v.union(v.null(),v.object({_id:v.id("clientRequests"),_creationTime:v.number(),reference:v.string(),name:v.string(),phone:v.string(),make:v.optional(v.string()),model:v.optional(v.string()),yearRange:v.optional(v.string()),budget:v.optional(v.string()),location:v.optional(v.string()),fuelTransmission:v.optional(v.string()),notes:v.optional(v.string()),status:v.string(),createdAt:v.number(),updatedAt:v.number()})),
  handler:async(ctx,args)=>{const ref=args.reference.trim().toUpperCase();return (await ctx.db.query("clientRequests").withIndex("by_reference",q=>q.eq("reference",ref)).take(1))[0]??null}
})
