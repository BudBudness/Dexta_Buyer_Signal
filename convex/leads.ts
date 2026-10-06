import { paginationOptsValidator, paginationResultValidator } from "convex/server"
import { v } from "convex/values"
import { internalMutation, mutation, query } from "./_generated/server"
import { currentOwner, requireOwner } from "./authz"

const leadValidator = v.object({
  _id: v.id("leads"), _creationTime: v.number(), publicName: v.string(), username: v.optional(v.string()),
  source: v.string(), sourceType: v.string(), sourceUrl: v.string(), observedAt: v.number(),
  city: v.optional(v.string()), region: v.optional(v.string()), country: v.string(), make: v.string(), model: v.string(),
  yearMin: v.optional(v.number()), yearMax: v.optional(v.number()), mileageMax: v.optional(v.number()),
  fuelType: v.optional(v.string()), transmission: v.optional(v.string()), drivetrain: v.optional(v.string()),
  budgetMin: v.optional(v.number()), budgetMax: v.optional(v.number()), currency: v.string(), intentText: v.string(),
  intentType: v.string(), intentStrength: v.number(), urgency: v.string(), importRequired: v.boolean(),
  publicContact: v.optional(v.string()), contactType: v.optional(v.string()), contactSource: v.optional(v.string()),
  contactContext: v.optional(v.string()), contactConfidence: v.number(), authorizationContext: v.optional(v.string()),
  permissionContext: v.optional(v.string()), evidenceText: v.optional(v.string()), evidenceCapturedAt: v.optional(v.number()),
  sourceConfidence: v.number(), leadStatus: v.string(), firstSeen: v.number(), lastSeen: v.number(),
})

type ListResult = { page: Array<{ [key: string]: unknown }>; isDone: boolean; continueCursor: string }

export const list = query({
  args: { paginationOpts: paginationOptsValidator, intentType: v.optional(v.string()), leadStatus: v.optional(v.string()) },
  returns: paginationResultValidator(leadValidator),
  handler: async (ctx,args) => {
    if (!(await currentOwner(ctx))) return { page: [] as Array<typeof leadValidator.type>, isDone: true, continueCursor: "" }
    if (args.leadStatus) return ctx.db.query("leads").withIndex("by_status",q=>q.eq("leadStatus",args.leadStatus!)).order("desc").paginate(args.paginationOpts)
    if (args.intentType && args.intentType !== "import") return ctx.db.query("leads").withIndex("by_intent",q=>q.eq("intentType",args.intentType!)).order("desc").paginate(args.paginationOpts)
    return ctx.db.query("leads").withIndex("by_status").order("desc").paginate(args.paginationOpts)
  },
})

export const updateStatus = mutation({
  args:{leadId:v.id("leads"),leadStatus:v.string()}, returns:v.null(),
  handler:async(ctx,args)=>{
    await requireOwner(ctx)
    const allowed=["new","qualified","contacted","responded","requirement_confirmed","sourcing","quote_sent","negotiation","won","lost"]
    if(!allowed.includes(args.leadStatus)) throw new Error("Invalid pipeline status")
    const lead=await ctx.db.get(args.leadId); if(!lead) throw new Error("Lead not found")
    await ctx.db.patch(args.leadId,{leadStatus:args.leadStatus,lastSeen:Date.now()}); return null
  }
})

export const seed = mutation({ args: {}, returns: v.number(), handler: async (ctx) => { await requireOwner(ctx); return (await ctx.db.query("leads").take(1)).length } })

export const purgeInvalidWebSignals = mutation({ args:{}, returns:v.number(), handler:async(ctx)=>{ await requireOwner(ctx); const leads=await ctx.db.query("leads").collect(); let removed=0; const invalid=/financing|repayment periods?|partnered with|car dealers?|cars? for sale|popular models?|an overview|guide to|how to buy|best choice|compare|review|customers? can|offers? \d+%/i; for(const lead of leads){ if(lead.source.toLowerCase()==="web" && invalid.test(lead.evidenceText??lead.intentText)){ await ctx.db.delete(lead._id); removed++ } } return removed } })

export const create = mutation({
  args:{
    publicName:v.string(),username:v.optional(v.string()),source:v.string(),sourceType:v.string(),sourceUrl:v.string(),
    city:v.optional(v.string()),region:v.optional(v.string()),country:v.string(),make:v.string(),model:v.string(),
    yearMin:v.optional(v.number()),yearMax:v.optional(v.number()),mileageMax:v.optional(v.number()),
    fuelType:v.optional(v.string()),transmission:v.optional(v.string()),drivetrain:v.optional(v.string()),
    budgetMin:v.optional(v.number()),budgetMax:v.optional(v.number()),currency:v.string(),intentText:v.string(),
    intentType:v.string(),intentStrength:v.number(),urgency:v.string(),importRequired:v.boolean(),
    publicContact:v.optional(v.string()),contactType:v.optional(v.string()),contactSource:v.optional(v.string()),
    contactContext:v.optional(v.string()),contactConfidence:v.optional(v.number()),authorizationContext:v.optional(v.string()),
    permissionContext:v.optional(v.string()),evidenceText:v.optional(v.string())
  }, returns:v.id("leads"),
  handler:async(ctx,args)=>{
    await requireOwner(ctx)
    const now=Date.now(),hasContact=Boolean(args.publicContact)
    if(hasContact&&!args.contactType) throw new Error("contactType is required when contact is supplied")
    if(args.sourceType.toLowerCase().includes("private")&&!args.authorizationContext&&!args.permissionContext) throw new Error("Authorized private sources require authorization or permission context")
    return ctx.db.insert("leads",{...args,contactConfidence:args.contactConfidence??(hasContact?.85:0),observedAt:now,firstSeen:now,lastSeen:now,sourceConfidence:.9,leadStatus:"new",evidenceCapturedAt:args.evidenceText?now:undefined})
  }
})

export const ingestDiscovered = internalMutation({
  args:{
    publicName:v.string(),source:v.string(),sourceType:v.string(),sourceUrl:v.string(),city:v.optional(v.string()),
    country:v.string(),make:v.string(),model:v.string(),yearMin:v.optional(v.number()),yearMax:v.optional(v.number()),
    mileageMax:v.optional(v.number()),fuelType:v.optional(v.string()),transmission:v.optional(v.string()),drivetrain:v.optional(v.string()),
    budgetMin:v.optional(v.number()),budgetMax:v.optional(v.number()),intentText:v.string(),intentStrength:v.number(),urgency:v.string(),
    importRequired:v.boolean(),publicContact:v.optional(v.string()),contactType:v.optional(v.string()),evidenceText:v.string(),sourceConfidence:v.number()
  },returns:v.object({id:v.id("leads"),created:v.boolean()}),
  handler:async(ctx,args)=>{
    const existing=await ctx.db.query("leads").collect(),url=args.sourceUrl.trim().toLowerCase()
    const duplicate=existing.find(l=>url&&l.sourceUrl.trim().toLowerCase()===url||(l.make.toLowerCase()===args.make.toLowerCase()&&l.model.toLowerCase()===args.model.toLowerCase()&&l.city?.toLowerCase()===args.city?.toLowerCase()&&l.evidenceText?.trim().toLowerCase()===args.evidenceText.trim().toLowerCase()))
    const now=Date.now()
    if(duplicate){
      await ctx.db.patch(duplicate._id,{lastSeen:now,observedAt:now,publicContact:args.publicContact??duplicate.publicContact,budgetMin:args.budgetMin??duplicate.budgetMin,budgetMax:args.budgetMax??duplicate.budgetMax,yearMin:args.yearMin??duplicate.yearMin,yearMax:args.yearMax??duplicate.yearMax,mileageMax:args.mileageMax??duplicate.mileageMax,fuelType:args.fuelType??duplicate.fuelType,transmission:args.transmission??duplicate.transmission,drivetrain:args.drivetrain??duplicate.drivetrain,evidenceText:args.evidenceText,evidenceCapturedAt:now})
      return {id:duplicate._id,created:false}
    }
    const id=await ctx.db.insert("leads",{publicName:args.publicName,source:args.source,sourceType:args.sourceType,sourceUrl:args.sourceUrl,observedAt:now,city:args.city,country:args.country,make:args.make,model:args.model,yearMin:args.yearMin,yearMax:args.yearMax,mileageMax:args.mileageMax,fuelType:args.fuelType,transmission:args.transmission,drivetrain:args.drivetrain,budgetMin:args.budgetMin,budgetMax:args.budgetMax,currency:"UGX",intentText:args.intentText,intentType:args.intentStrength>=70?"purchase":"research",intentStrength:args.intentStrength,urgency:args.urgency,importRequired:args.importRequired,publicContact:args.publicContact,contactType:args.contactType,contactSource:args.publicContact?"public":undefined,contactContext:args.publicContact?"explicitly supplied":undefined,contactConfidence:args.publicContact ? .95 : 0,evidenceText:args.evidenceText,evidenceCapturedAt:now,sourceConfidence:args.sourceConfidence,leadStatus:"new",firstSeen:now,lastSeen:now})
    if(args.publicContact&&args.contactType) await ctx.db.insert("contacts",{leadId:id,contact:args.publicContact.trim(),contactType:args.contactType,contactSource:"public",contactContext:"explicitly supplied",contactConfidence:.95})
    return {id,created:true}
  }
})
