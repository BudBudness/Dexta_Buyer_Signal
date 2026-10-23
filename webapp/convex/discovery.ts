import { v } from "convex/values"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { callMacalyJson } from "./macaly"
import "./authz"

const MAKES=["Toyota","Honda","Mazda","Suzuki","Subaru","Nissan","Mitsubishi","Hyundai","Mercedes","BMW","Volkswagen","Ford","Isuzu","Lexus"]
const MODELS=["Noah","Fielder","Vezel","Swift","Harrier","Alphard","Forester","CX-5","Fit","Premio","Wish","RAV4","Hiace","Prado","Hilux","Axio","Demio","Civic","CR-V","X-Trail"]
const CITIES=["Kampala","Mbarara","Jinja","Wakiso","Entebbe","Mbale","Gulu","Fort Portal","Masaka","Kabale"]
const BUYER_WORDS=["looking for","looking to buy","want to buy","need a","need an","buying","i want","i need","my budget","can anyone source","who can source","searching for"]
const FUEL=["petrol","gasoline","diesel","hybrid","electric","ev"]
const TRANS=["automatic","auto","manual","cvt"]
const DRIVE=["4wd","4x4","awd","2wd","fwd","rwd"]
const EXCLUDE_PATTERNS=[
 /financing (?:for|covers|options)/i,/repayment periods?/i,/partnered with/i,/car dealers?/i,
 /used car dealers?/i,/cars? for sale/i,/popular models?/i,/an overview/i,/guide to/i,
 /how to buy/i,/best (?:choice|cars?)/i,/compare(?:d|s)?/i,/review(?:s)?/i,
 /customers? (?:can|may) /i,/offers? \d+%/i
]
function firstMatch(text:string,values:string[]){const l=text.toLowerCase();return values.find(v=>l.includes(v.toLowerCase()))}
function numberNear(text:string,patterns:RegExp[]){for(const p of patterns){const m=text.match(p);if(m){const n=Number(m[1].replace(/,/g,""));if(Number.isFinite(n))return n}}}
function budget(text:string){
 const t=text.toLowerCase().replace(/,/g,"")
 const nums=(t.match(/(?:ugx|shs|million|m)\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:m|million|m ugx|million ugx|ugx|shs)/gi)||[])
 const vals=nums.map(x=>{const n=Number(x.replace(/[^0-9.]/g,""));return /million|\bm\b/i.test(x)?n*1e6:n}).filter(Number.isFinite)
 if(vals.length>=2)return {budgetMin:Math.round(Math.min(...vals)),budgetMax:Math.round(Math.max(...vals))}
 if(vals.length===1)return {budgetMax:Math.round(vals[0])}
 return {}
}
function extract(text:string,url:string,title:string,source:string){
 const combined=(title+". "+text).replace(/\s+/g," ").trim(), lower=combined.toLowerCase()
 const make=firstMatch(combined,MAKES),model=firstMatch(combined,MODELS)
 if(!make||!model)return null
 if(EXCLUDE_PATTERNS.some(p=>p.test(combined)))return null
 if(!BUYER_WORDS.some(x=>lower.includes(x)))return null
 const direct=/\b(i|im|i'm|my|we|our)\b.{0,100}\b(buy|buying|need|want|looking|budget|source|import)\b/i.test(combined)
 const request=/\b(can anyone|who can|please|help me|searching for|looking for|looking to buy|want to buy|need (?:a|an))\b/i.test(combined)
 if(!direct&&!request)return null
 const city=firstMatch(combined,CITIES),b=budget(combined)
 const years=[...combined.matchAll(/\b(?:19|20)\d{2}\b/g)].map(m=>Number(m[0])).filter(y=>y>=1990&&y<=2035)
 const yearMin=years.length?Math.min(...years):undefined,yearMax=years.length?Math.max(...years):undefined
 const mileageMax=numberNear(lower,[/(?:under|below|less than|max(?:imum)?|up to)\s*([0-9]{2,3}(?:[,.][0-9]{3})*)\s*(?:km|kms|mileage)/i,/([0-9]{2,3}(?:[,.][0-9]{3})*)\s*km\s*(?:or less|maximum|max)/i])
 const fuelType=firstMatch(combined,FUEL),transmission=firstMatch(combined,TRANS),drivetrain=firstMatch(combined,DRIVE)
 const importRequired=/\b(import|importing|imported|japan|dubai|auction)\b/i.test(combined)
 const urgency=/\b(urgent|urgently|asap|immediately|today|this week|this month)\b/i.test(combined)?"hot":BUYER_WORDS.filter(x=>lower.includes(x)).length>=2?"high":"medium"
 const requirements=[model,yearMin||yearMax,b.budgetMax,mileageMax,fuelType,transmission,drivetrain].filter(Boolean).length
 const intentStrength=Math.min(99,60+BUYER_WORDS.filter(x=>lower.includes(x)).length*7+requirements*5+(city?4:0)+(importRequired?5:0)+(urgency==="hot"?7:0))
 return {publicName:title||"Public buyer signal",source,sourceType:"public web",sourceUrl:url||"#",city,country:"Uganda",make,model,yearMin,yearMax,mileageMax,fuelType,transmission,drivetrain,...b,intentText:combined.slice(0,280),intentStrength,urgency,importRequired,evidenceText:combined.slice(0,900),sourceConfidence:.9}
}
const SOURCES=[{name:"Public Web Search",kind:"internet-search",templates:['Uganda "I am looking for" car','Uganda "looking for" Toyota "budget"','Uganda "can anyone source" car'],notes:"Public web discovery only. Direct buyer language required."}]
export const discover=action({
 args:{query:v.optional(v.string())},
 returns:v.object({searched:v.number(),candidates:v.number(),created:v.number(),updated:v.number()}),
 handler:async(ctx,args)=>{
  const identity=await ctx.auth.getUserIdentity()
  if(!identity) return {searched:0,candidates:0,created:0,updated:0}
  const isOwner=await ctx.runQuery(internal.authz.isOwner,{})
  if(!isOwner) return {searched:0,candidates:0,created:0,updated:0}
  const base=args.query?.trim()||'Uganda "looking for" car buyer'
  const queries=[base,...SOURCES[0].templates]
  let searched=0,candidates=0,created=0,updated=0
  for(const query of queries){
   const data=await callMacalyJson("/api/client-app/internet-search",{query});searched++
   const rows=Array.isArray(data.search_results)?data.search_results:[]
   for(const row of rows){
    if(!row||typeof row!=="object")continue
    const r=row as Record<string,unknown>
    const item=extract(String(r.snippet??r.title??""),String(r.url??""),String(r.title??"Public buyer signal"),String(r.source??"Web search"))
    if(!item)continue
    candidates++
    const result=await ctx.runMutation(internal.leads.ingestDiscovered,item)
    if(result.created)created++;else updated++
   }
  }
  return {searched,candidates,created,updated}
 }
})