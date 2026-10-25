import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireOwner } from "./authz"

const owner = requireOwner

export const requests = query({
  args:{}, returns:v.array(v.object({_id:v.id("clientRequests"),_creationTime:v.number(),reference:v.string(),name:v.string(),phone:v.string(),make:v.optional(v.string()),model:v.optional(v.string()),yearRange:v.optional(v.string()),budget:v.optional(v.string()),location:v.optional(v.string()),fuelTransmission:v.optional(v.string()),notes:v.optional(v.string()),status:v.string(),createdAt:v.number(),updatedAt:v.number()})),
  handler:async ctx=>{await owner(ctx);return await ctx.db.query("clientRequests").order("desc").take(100)}
})
export const vehicles = query({
  args:{requestId:v.optional(v.id("clientRequests"))}, returns:v.array(v.object({_id:v.id("vehicles"),_creationTime:v.number(),requestId:v.optional(v.id("clientRequests")),make:v.string(),model:v.string(),year:v.number(),mileage:v.optional(v.number()),fuel:v.optional(v.string()),transmission:v.optional(v.string()),source:v.string(),sourceUrl:v.optional(v.string()),purchasePrice:v.number(),importCost:v.number(),transportCost:v.number(),landedCost:v.number(),expectedPrice:v.number(),currency:v.string(),status:v.string(),notes:v.optional(v.string()),createdAt:v.number(),updatedAt:v.number()})),
  handler:async(ctx,args)=>{await owner(ctx);if(args.requestId)return await ctx.db.query("vehicles").withIndex("by_request",q=>q.eq("requestId",args.requestId!)).order("desc").take(100);return await ctx.db.query("vehicles").order("desc").take(100)}
})
export const quotes = query({
  args:{requestId:v.optional(v.id("clientRequests"))}, returns:v.array(v.object({_id:v.id("quotes"),_creationTime:v.number(),requestId:v.id("clientRequests"),vehicleId:v.optional(v.id("vehicles")),amount:v.number(),currency:v.string(),validUntil:v.optional(v.number()),status:v.string(),notes:v.optional(v.string()),createdAt:v.number(),updatedAt:v.number()})),
  handler:async(ctx,args)=>{await owner(ctx);if(args.requestId)return await ctx.db.query("quotes").withIndex("by_request",q=>q.eq("requestId",args.requestId!)).order("desc").take(100);return await ctx.db.query("quotes").order("desc").take(100)}
})
export const deals = query({
  args:{requestId:v.optional(v.id("clientRequests"))}, returns:v.array(v.object({_id:v.id("deals"),_creationTime:v.number(),requestId:v.id("clientRequests"),vehicleId:v.optional(v.id("vehicles")),quoteId:v.optional(v.id("quotes")),agreedPrice:v.number(),currency:v.string(),deposit:v.number(),balance:v.number(),paymentStatus:v.string(),documentStatus:v.string(),shippingStatus:v.string(),deliveryStatus:v.string(),status:v.string(),notes:v.optional(v.string()),createdAt:v.number(),updatedAt:v.number()})),
  handler:async(ctx,args)=>{await owner(ctx);if(args.requestId)return await ctx.db.query("deals").withIndex("by_request",q=>q.eq("requestId",args.requestId!)).order("desc").take(100);return await ctx.db.query("deals").order("desc").take(100)}
})
export const documents = query({
  args:{requestId:v.optional(v.id("clientRequests"))}, returns:v.array(v.object({_id:v.id("documents"),_creationTime:v.number(),requestId:v.id("clientRequests"),kind:v.string(),name:v.string(),status:v.string(),reference:v.optional(v.string()),notes:v.optional(v.string()),createdAt:v.number(),updatedAt:v.number()})),
  handler:async(ctx,args)=>{await owner(ctx);if(args.requestId)return await ctx.db.query("documents").withIndex("by_request",q=>q.eq("requestId",args.requestId!)).order("desc").take(100);return await ctx.db.query("documents").order("desc").take(100)}
})
export const updateRequestStatus = mutation({
  args:{id:v.id("clientRequests"),status:v.string()},returns:v.null(),handler:async(ctx,args)=>{await owner(ctx);const r=await ctx.db.get(args.id);if(!r)throw new Error("Request not found");await ctx.db.patch(args.id,{status:args.status,updatedAt:Date.now()});return null}
})
export const addVehicle = mutation({
  args:{requestId:v.optional(v.id("clientRequests")),make:v.string(),model:v.string(),year:v.number(),mileage:v.optional(v.number()),fuel:v.optional(v.string()),transmission:v.optional(v.string()),source:v.string(),sourceUrl:v.optional(v.string()),purchasePrice:v.number(),importCost:v.number(),transportCost:v.number(),expectedPrice:v.number(),currency:v.string(),notes:v.optional(v.string())},
  returns:v.id("vehicles"),handler:async(ctx,args)=>{await owner(ctx);const landed=args.purchasePrice+args.importCost+args.transportCost;return await ctx.db.insert("vehicles",{...args,landedCost:landed,status:"candidate",createdAt:Date.now(),updatedAt:Date.now()})}
})
export const addQuote = mutation({
  args:{requestId:v.id("clientRequests"),vehicleId:v.optional(v.id("vehicles")),amount:v.number(),currency:v.string(),validUntil:v.optional(v.number()),notes:v.optional(v.string())},
  returns:v.id("quotes"),handler:async(ctx,args)=>{await owner(ctx);return await ctx.db.insert("quotes",{...args,status:"draft",createdAt:Date.now(),updatedAt:Date.now()})}
})
export const addDeal = mutation({
  args:{requestId:v.id("clientRequests"),vehicleId:v.optional(v.id("vehicles")),quoteId:v.optional(v.id("quotes")),agreedPrice:v.number(),currency:v.string(),deposit:v.number(),notes:v.optional(v.string())},
  returns:v.id("deals"),handler:async(ctx,args)=>{await owner(ctx);if(args.deposit<0||args.deposit>args.agreedPrice)throw new Error("Deposit must be within deal value");return await ctx.db.insert("deals",{...args,balance:args.agreedPrice-args.deposit,paymentStatus:args.deposit?"partial":"unpaid",documentStatus:"pending",shippingStatus:"pending",deliveryStatus:"pending",status:"active",createdAt:Date.now(),updatedAt:Date.now()})}
})
export const addDocument = mutation({
  args:{requestId:v.id("clientRequests"),kind:v.string(),name:v.string(),reference:v.optional(v.string()),notes:v.optional(v.string())},
  returns:v.id("documents"),handler:async(ctx,args)=>{await owner(ctx);return await ctx.db.insert("documents",{...args,status:"pending",createdAt:Date.now(),updatedAt:Date.now()})}
})
export const updateDeal = mutation({
  args:{id:v.id("deals"),paymentStatus:v.optional(v.string()),documentStatus:v.optional(v.string()),shippingStatus:v.optional(v.string()),deliveryStatus:v.optional(v.string()),status:v.optional(v.string()),notes:v.optional(v.string())},
  returns:v.null(),handler:async(ctx,args)=>{await owner(ctx);const allowed={paymentStatus:["unpaid","partial","paid","refunded"],documentStatus:["pending","in_progress","ready","issued"],shippingStatus:["pending","arranged","in_transit","delivered"],deliveryStatus:["pending","scheduled","delivered"],status:["active","completed","cancelled"]};for(const [field,values] of Object.entries(allowed)){const value=args[field as keyof typeof args];if(typeof value==="string"&&!values.includes(value))throw new Error(`Invalid ${field}`)}const {id,...patch}=args;const d=await ctx.db.get(id);if(!d)throw new Error("Deal not found");await ctx.db.patch(id,{...patch,updatedAt:Date.now()});return null}
})
