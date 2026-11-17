import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireOwner } from "./authz"

export const seed=mutation({args:{},returns:v.number(),handler:async(ctx)=>{await requireOwner(ctx);const existing=await ctx.db.query("sources").collect();if(existing.length)return existing.length;await ctx.db.insert("sources",{name:"Public Web Search",kind:"internet-search",enabled:false,queryTemplates:['Uganda "looking for" car buyer','Uganda "want to buy" Toyota car','Uganda car buyer UGX'],status:"authorization_pending",lastSearched:Date.now(),resultCount:0,qualifiedCount:0,notes:"Disabled by default. Enable only after provider ownership, permitted use, source scope, retention, and private evidence storage are verified."});return 1}})
