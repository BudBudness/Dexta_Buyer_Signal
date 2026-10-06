import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireOwner } from "./authz"

export const seed=mutation({args:{},returns:v.number(),handler:async(ctx)=>{await requireOwner(ctx);const existing=await ctx.db.query("sources").collect();if(existing.length)return existing.length;await ctx.db.insert("sources",{name:"Public Web Search",kind:"internet-search",enabled:true,queryTemplates:['Uganda "looking for" car buyer','Uganda "want to buy" Toyota car','Uganda car buyer UGX'],status:"ready",lastSearched:Date.now(),resultCount:0,qualifiedCount:0,notes:"Public web discovery only; explicit public contacts only."});return 1}})
