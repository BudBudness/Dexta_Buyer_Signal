import { createFileRoute } from "@tanstack/react-router"
import { ArrowRight, BadgeCheck, CalendarDays, CarFront, CheckCircle2, ChevronRight, Clock3, Compass, Fuel, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react"
import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

export const Route = createFileRoute("/client")({ component: Client })

const SERVICES = [
  { value: "vehicle_sourcing", title: "Vehicle sourcing", description: "Find a vehicle that fits your needs and budget.", icon: CarFront },
  { value: "insurance", title: "Comprehensive insurance", description: "Compare suitable cover through licensed insurers.", icon: ShieldCheck },
  { value: "third_party_insurance", title: "Third-party insurance", description: "Assistance obtaining required third-party cover.", icon: BadgeCheck },
  { value: "driving_permit", title: "Driving permits", description: "Guidance with legitimate applications and renewals.", icon: Compass },
  { value: "inspection", title: "Vehicle inspection", description: "Arrange checks before you commit to a purchase.", icon: CheckCircle2 },
  { value: "registration", title: "Registration & documents", description: "Help coordinating applicable documentation.", icon: Wallet },
  { value: "event_vehicle_hire", title: "Premium event vehicle hire", description: "Executive arrivals, weddings, VIP and corporate events.", icon: Sparkles },
] as const

const VEHICLE_GROUPS = [
  { title: "SUVs & crossovers", models: "Harrier · RAV4 · Prado · Fortuner", note: "Family, business and mixed-road use", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1100&q=85" },
  { title: "Everyday sedans", models: "Premio · Allion · Corolla", note: "Commuting and practical ownership", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1100&q=85" },
  { title: "Work & rural-use vehicles", models: "Hilux · Pickups · Vans", note: "Business, farms and travel beyond town", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=85" },
  { title: "Family & passenger vehicles", models: "Noah · Voxy · Hiace", note: "Space for family and group travel", image: "https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?auto=format&fit=crop&w=1100&q=85" },
]

const STATUS_LABELS: Record<string, string> = {
  new: "Received", received: "Received", reviewing: "Reviewing", needs_client_information: "Need information",
  sourcing: "Sourcing", options_found: "Options found", quote_sent: "Quote sent",
  acquisition_in_progress: "Acquisition in progress", completed: "Completed", cancelled: "Cancelled",
}

function Client() {
  const [sent, setSent] = useState("")
  const [contactPreference, setContactPreference] = useState("whatsapp")
  const [selectedServices, setSelectedServices] = useState<string[]>(["vehicle_sourcing"])
  const [error, setError] = useState("")
  const [lookup, setLookup] = useState("")
  const createRequest = useMutation(api.clientRequests.create)
  const tracked = useQuery(api.clientRequests.getByReference, lookup.trim() ? { reference: lookup.trim() } : "skip" as any)
  const whatsappLink = sent ? "https://wa.me/256702111293?text=" + encodeURIComponent("Hello Dexta Autohaus, I am following up on request " + sent + ".") : "https://wa.me/256702111293"
  const mapsLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Plot 35, Bananuka Drive, Mbarara City, Uganda")

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    if (!selectedServices.length) {
      setError("Select at least one service so Dexta knows how to help.")
      return
    }
    const form = new FormData(e.currentTarget)
    const value = (key: string) => String(form.get(key) || "").trim()
    try {
      const result = await createRequest({
        name: value("name"),
        phone: value("phone"),
        email: value("email") || undefined,
        contactPreference,
        serviceTypes: selectedServices,
        make: value("make") || undefined,
        model: value("model") || undefined,
        yearRange: value("year") || undefined,
        budget: value("budget") || undefined,
        location: value("location") || undefined,
        fuelTransmission: value("fuel") || undefined,
        vehicleCondition: value("condition") || undefined,
        vehicleUse: value("use") || undefined,
        eventType: value("eventType") || undefined,
        eventDate: value("eventDate") || undefined,
        eventLocation: value("eventLocation") || undefined,
        hireDuration: value("hireDuration") || undefined,
        driverPreference: value("driverPreference") || undefined,
        vehicleClass: value("vehicleClass") || undefined,
        vehicleCount: value("vehicleCount") || undefined,
        notes: value("notes") || undefined,
      })
      setSent(result.reference)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your request. Please try again.")
    }
  }

  return <div className="dexta-site min-h-screen bg-white text-zinc-950">
    <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-black/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Dexta Autohaus home">
          <div className="brand-mark grid size-11 place-items-center rounded-sm bg-red-600"><CarFront size={23}/></div>
          <div><div className="text-sm font-black tracking-[.2em]">DEXTA AUTOHAUS</div><div className="mt-1 text-[9px] tracking-[.23em] text-white/50">PRECISION. PERFORMANCE. PRESTIGE.</div></div>
        </a>
        <nav className="hidden items-center gap-6 text-[11px] font-bold tracking-wider text-white/65 lg:flex">
          <a href="#vehicles" className="hover:text-white">VEHICLES</a><a href="#services" className="hover:text-white">SERVICES</a><a href="#process" className="hover:text-white">HOW IT WORKS</a><a href="#office" className="hover:text-white">VISIT US</a>
        </nav>
        <a href="https://wa.me/256702111293" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-3 text-[10px] font-black text-black transition hover:bg-red-600 hover:text-white sm:px-4"><MessageCircle size={15}/> <span className="hidden sm:inline">WHATSAPP DEXTA</span><span className="sm:hidden">WHATSAPP</span></a>
      </div>
    </header>

    <main id="top">
      <section className="hero-scene relative isolate overflow-hidden bg-black text-white">
        <div className="hero-image absolute inset-0" aria-hidden="true"/>
        <div className="hero-shade absolute inset-0" aria-hidden="true"/>
        <div className="hero-grid absolute inset-0" aria-hidden="true"/>
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 md:min-h-[700px] lg:grid-cols-[1fr_.75fr] lg:px-8 lg:py-24">
          <div className="hero-copy max-w-3xl">
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[.28em] text-red-400"><span className="h-px w-8 bg-red-500"/> MBARARA · UGANDA</div>
            <h1 className="text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-7xl xl:text-8xl">The right vehicle.<br/><span className="hero-outline">The right way.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">Tell Dexta what you need. We help you find, source and acquire the right vehicle—or coordinate the services that keep you moving.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href="#request" className="inline-flex items-center gap-3 rounded-sm bg-red-600 px-6 py-4 text-xs font-black tracking-wider transition hover:-translate-y-1 hover:bg-red-500">START A REQUEST <ArrowRight size={16}/></a><a href="#services" className="inline-flex items-center gap-2 border border-white/25 px-5 py-4 text-xs font-bold tracking-wider transition hover:border-white">EXPLORE SERVICES <ChevronRight size={15}/></a></div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-[10px] font-bold tracking-[.16em] text-white/45"><span className="flex items-center gap-2"><MapPin size={13}/> MBARARA-BASED</span><span className="flex items-center gap-2"><ShieldCheck size={13}/> SOURCING WITH CLARITY</span><span className="flex items-center gap-2"><Wallet size={13}/> NEGOTIABLE SERVICE FEES</span></div>
          </div>
          <div className="hero-orbit-wrap hidden lg:block" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-float-card"><span className="text-[9px] font-black tracking-[.24em] text-red-400">DEXTA SELECT</span><div className="mt-3 text-2xl font-black">Made for Uganda.</div><p className="mt-2 max-w-[230px] text-xs leading-5 text-white/55">Practical choices. Premium service. Local context.</p><div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-white/70"><span className="size-2 rounded-full bg-red-500"/> SOURCE WITH CONFIDENCE</div></div></div>
        </div>
        <div className="hero-bottom-line absolute inset-x-0 bottom-0 h-px"/>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" id="vehicles">
        <div className="section-intro mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="section-kicker">VEHICLES FOR UGANDA</div><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Choose for the life you live.</h2></div><p className="max-w-lg text-sm leading-6 text-black/55">From daily driving in Mbarara to family travel, business use and rural roads. These are sourcing categories—not live inventory. Availability is confirmed for each request.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{VEHICLE_GROUPS.map((vehicle, i) => <article key={vehicle.title} className="vehicle-card group relative min-h-[360px] overflow-hidden bg-zinc-900 text-white" style={{ animationDelay: (i * 90) + "ms" }}><img src={vehicle.image} alt={vehicle.title + " vehicle category"} loading="lazy" className="vehicle-image absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="vehicle-overlay absolute inset-0"/><div className="relative flex h-full min-h-[360px] flex-col justify-end p-5"><span className="text-[9px] font-black tracking-[.2em] text-red-300">SOURCE TO REQUIREMENT</span><h3 className="mt-3 text-xl font-black">{vehicle.title}</h3><p className="mt-2 text-xs leading-5 text-white/70">{vehicle.models}</p><p className="mt-1 text-[10px] text-white/45">{vehicle.note}</p><a href="#request" onClick={() => { setSelectedServices(["vehicle_sourcing"]) }} className="mt-5 inline-flex w-fit items-center gap-2 border-b border-white/35 pb-2 text-[10px] font-black tracking-wider">REQUEST THIS CATEGORY <ArrowRight size={13}/></a></div></article>)}</div>
        <div className="mt-5 flex flex-wrap gap-4 border border-black/10 bg-zinc-50 p-4 text-xs text-black/55"><span className="flex items-center gap-2"><Fuel size={15} className="text-red-600"/> Fuel and transmission preferences</span><span className="flex items-center gap-2"><Compass size={15} className="text-red-600"/> Local-road suitability</span><span className="flex items-center gap-2"><Wallet size={15} className="text-red-600"/> Budget in UGX</span></div>
      </section>

      <section id="services" className="services-section bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl"><div className="section-kicker text-red-400">BEYOND THE VEHICLE</div><div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end"><h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">One point of contact.<br/>More ways to move.</h2><p className="max-w-lg text-sm leading-6 text-white/55">Request one service or combine several. Pricing is quoted transparently, with service fees open to negotiation and official or third-party charges shown separately.</p></div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{SERVICES.map((service, i) => { const Icon = service.icon; const selected = selectedServices.includes(service.value); return <button type="button" key={service.value} onClick={() => setSelectedServices(prev => selected ? prev.filter(s => s !== service.value) : [...prev, service.value])} className={"service-card group relative min-h-[185px] border p-5 text-left transition duration-300 hover:-translate-y-1 " + (selected ? "border-red-500 bg-white/[.08]" : "border-white/10 bg-white/[.025] hover:border-white/30")} style={{ animationDelay: (i * 60) + "ms" }}><div className="flex items-start justify-between"><div className={"grid size-10 place-items-center " + (selected ? "bg-red-600 text-white" : "bg-white/10 text-white/75")}><Icon size={19}/></div><span className={"grid size-5 place-items-center rounded-full border text-[10px] " + (selected ? "border-red-500 bg-red-600 text-white" : "border-white/25 text-transparent")}>✓</span></div><h3 className="mt-5 font-black">{service.title}</h3><p className="mt-2 text-xs leading-5 text-white/50">{service.description}</p></button> })}</div>
          <p className="mt-4 text-xs text-white/45">Select services here or in the request form. Insurance and permits are arranged through licensed insurers or authorised authorities; Dexta does not underwrite policies or issue permits.</p>
        </div>
      </section>

      <section id="request" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8"><div className="section-kicker">START WITH WHAT YOU KNOW</div><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Tell us what you need.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">Vehicle sourcing, ownership assistance or a premium event arrival. Share the details you have—we can clarify the rest.</p></div>
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="request-panel border border-black/10 bg-white p-5 sm:p-8">
            {sent ? <div className="py-5"><div className="grid size-14 place-items-center bg-red-600 text-white"><CheckCircle2 size={27}/></div><h3 className="mt-5 text-2xl font-black">Request received.</h3><p className="mt-2 max-w-lg text-sm leading-6 text-black/55">Your reference is below. WhatsApp is a direct chat link—not an automatic message. Tap it to send Dexta the reference. If you selected email, we will use the address you provided for contact once email service is configured.</p><div className="mt-5 border border-black/10 bg-zinc-50 p-4"><div className="text-[9px] font-black tracking-[.2em] text-black/40">YOUR REFERENCE</div><div className="mt-2 font-mono text-xl font-black">{sent}</div></div><div className="mt-5 flex flex-wrap gap-3"><a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-xs font-black text-white"><MessageCircle size={15}/> FOLLOW UP ON WHATSAPP</a><button type="button" onClick={() => { setSent(""); setError(""); }} className="border border-black/15 px-5 py-3 text-xs font-black">SUBMIT ANOTHER REQUEST</button></div></div> : <form onSubmit={submit} className="space-y-8">
              <fieldset><legend className="text-sm font-black">01 / Choose your service</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{SERVICES.map(service => <label key={service.value} className="flex cursor-pointer items-start gap-3 border border-black/10 p-3 transition hover:border-red-500"><input type="checkbox" name="serviceTypes" value={service.value} checked={selectedServices.includes(service.value)} onChange={e => setSelectedServices(prev => e.target.checked ? [...prev, service.value] : prev.filter(s => s !== service.value))} className="mt-1 accent-red-600"/><span><span className="block text-xs font-bold">{service.title}</span><span className="mt-1 block text-[10px] leading-4 text-black/45">{service.description}</span></span></label>)}</div></fieldset>
              <fieldset><legend className="text-sm font-black">02 / Your contact details</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><input name="name" required maxLength={100} autoComplete="name" placeholder="Full name *" className="form-field"/><input name="phone" required maxLength={40} autoComplete="tel" placeholder="Phone / WhatsApp *" className="form-field"/><input name="email" type="email" maxLength={254} autoComplete="email" required={contactPreference !== "whatsapp"} placeholder={contactPreference === "whatsapp" ? "Email (optional)" : "Email address *"} className="form-field"/><label className="form-field flex items-center gap-3"><span className="shrink-0 text-xs text-black/55">Contact me by</span><select value={contactPreference} onChange={e => setContactPreference(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none"><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="both">Both</option></select></label></div></fieldset>
              {selectedServices.includes("vehicle_sourcing") && <fieldset><legend className="text-sm font-black">03 / Vehicle requirements</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><input name="make" placeholder="Make (e.g. Toyota)" className="form-field"/><input name="model" placeholder="Model (e.g. Harrier)" className="form-field"/><input name="year" placeholder="Year range" className="form-field"/><input name="budget" placeholder="Budget in UGX" className="form-field"/><input name="location" placeholder="Your location (e.g. Mbarara)" className="form-field"/><select name="condition" defaultValue="" className="form-field"><option value="">New or used?</option><option>New</option><option>Used</option><option>Either</option></select><select name="fuel" defaultValue="" className="form-field"><option value="">Fuel / transmission</option><option>Petrol · Automatic</option><option>Petrol · Manual</option><option>Diesel · Automatic</option><option>Diesel · Manual</option><option>Hybrid</option><option>Open to advice</option></select><select name="use" defaultValue="" className="form-field"><option value="">Main use</option><option>Family</option><option>Business</option><option>Rural travel</option><option>Daily commuting</option><option>Premium / executive</option><option>Other</option></select></div></fieldset>}
              {selectedServices.includes("event_vehicle_hire") && <fieldset className="event-fields"><legend className="text-sm font-black">04 / Premium event hire</legend><p className="mt-1 text-xs text-black/45">For weddings, VIP arrivals, corporate events and celebrations.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><select name="eventType" defaultValue="" className="form-field"><option value="">Event type</option><option>Wedding</option><option>Corporate / conference</option><option>VIP arrival</option><option>Gala / celebration</option><option>Other</option></select><input name="eventDate" type="date" aria-label="Event date" className="form-field"/><input name="eventLocation" placeholder="Venue / pickup location" className="form-field"/><select name="hireDuration" defaultValue="" className="form-field"><option value="">Hire duration</option><option>Hourly</option><option>Half-day</option><option>Full-day</option><option>Multiple days</option></select><select name="driverPreference" defaultValue="" className="form-field"><option value="">Driving preference</option><option>Chauffeur-driven</option><option>Self-drive (subject to terms)</option><option>Open to advice</option></select><select name="vehicleClass" defaultValue="" className="form-field"><option value="">Vehicle class</option><option>Executive sedan</option><option>Premium SUV</option><option>Luxury SUV</option><option>Van / group transport</option><option>Recommend for my event</option></select><input name="vehicleCount" placeholder="Number of vehicles" inputMode="numeric" className="form-field"/></div></fieldset>}
              <fieldset><legend className="text-sm font-black">05 / Anything else?</legend><textarea name="notes" maxLength={2000} placeholder="Preferences, timing, negotiation expectations or questions…" className="form-field mt-3 min-h-28 resize-y"/></fieldset>
              <div className="border border-black/10 bg-zinc-50 p-4"><div className="flex items-start gap-3"><Wallet size={18} className="mt-0.5 shrink-0 text-red-600"/><div><div className="text-xs font-black">Flexible pricing · Open to negotiation</div><p className="mt-1 text-xs leading-5 text-black/55">We confirm quotes before proceeding. Official fees, insurance premiums and other third-party costs are separated from Dexta’s service fee.</p></div></div></div>
              {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" className="group flex w-full items-center justify-center gap-3 bg-red-600 px-5 py-4 text-xs font-black tracking-[.12em] text-white transition hover:bg-black">SUBMIT REQUEST <ArrowRight size={16} className="transition group-hover:translate-x-1"/></button>
              <p className="text-[10px] leading-4 text-black/40">Your request details are private to Dexta’s authorised operations. Availability and pricing are confirmed individually.</p>
            </form>}
          </div>
          <aside className="space-y-4">
            <div id="process" className="border border-black/10 bg-zinc-50 p-6"><div className="section-kicker">THE DEXTA PROCESS</div><div className="mt-5 space-y-5"><Step n="01" t="Tell us what you need" d="Vehicle, service, event, budget and preferences."/><Step n="02" t="We check and coordinate" d="We review options and confirm availability, costs and conditions."/><Step n="03" t="You review the quote" d="Discuss options, ask questions and negotiate our service fee."/><Step n="04" t="Proceed when agreed" d="We coordinate the agreed sourcing or service steps." /></div><div className="mt-6 border-t border-black/10 pt-5 text-xs text-black/50"><ShieldCheck size={15} className="mr-2 inline text-red-600"/> No commitment until terms are agreed.</div></div>
            <div className="border border-black/10 p-6"><div className="flex items-center gap-2"><Clock3 size={17} className="text-red-600"/><h3 className="font-black">Check request status</h3></div><p className="mt-2 text-xs leading-5 text-black/50">Use your reference to see the current stage. No personal details are displayed.</p><form className="mt-4 flex gap-2" onSubmit={e => e.preventDefault()}><input value={lookup} onChange={e => setLookup(e.target.value.toUpperCase())} placeholder="DX-REFERENCE" aria-label="Request reference" className="min-w-0 flex-1 border border-black/15 px-3 py-3 font-mono text-xs outline-none focus:border-red-600"/><button type="submit" className="bg-black px-4 text-xs font-black text-white">CHECK</button></form>{lookup.trim() && <div aria-live="polite" className="mt-3 border-t border-black/10 pt-3 text-xs">{tracked === undefined ? <span className="text-black/45">Checking reference…</span> : tracked ? <><div className="font-black">{STATUS_LABELS[tracked.status] || tracked.status.replaceAll("_", " ")}</div><div className="mt-1 text-black/45">Last updated {new Date(tracked.updatedAt).toLocaleString()}</div></> : <span className="text-black/45">No request found for that reference.</span>}</div>}</div>
            <div className="border border-black/10 bg-black p-6 text-white"><div className="text-[10px] font-black tracking-[.2em] text-red-400">DIRECT CONTACT</div><h3 className="mt-3 text-xl font-black">Speak to Dexta.</h3><p className="mt-2 text-xs leading-5 text-white/55">WhatsApp opens a direct chat. You choose when to send your message.</p><a href="https://wa.me/256702111293" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-black"><MessageCircle size={15}/> +256 702 111293 <ArrowRight size={14}/></a></div>
          </aside>
        </div>
      </section>

      <section id="office" className="border-t border-black/10 bg-zinc-50 px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><div className="section-kicker">VISIT OUR OFFICE</div><h2 className="mt-3 text-2xl font-black sm:text-3xl">Mbarara, Uganda.</h2><p className="mt-2 text-sm text-black/55">Plot 35, Bananuka Drive, Mbarara City, Uganda</p><p className="mt-2 text-xs text-black/40">The map link searches the address; confirm the exact pin before travelling.</p></div><div className="flex flex-wrap gap-3"><a href={mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-black px-5 py-4 text-xs font-black text-white"><MapPin size={15}/> GET DIRECTIONS</a><a href="tel:+256702111293" className="inline-flex items-center gap-2 border border-black/20 px-5 py-4 text-xs font-black"><Phone size={15}/> CALL DEXTA</a></div></div></section>
    </main>
    <footer className="bg-black px-4 py-8 text-white sm:px-6"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><div className="text-xs font-black tracking-[.2em]">DEXTA AUTOHAUS</div><div className="mt-1 text-[9px] tracking-[.2em] text-white/40">PRECISION. PERFORMANCE. PRESTIGE.</div></div><div className="text-[10px] tracking-wider text-white/40">© DEXTA AUTOHAUS · MBARARA · UGANDA</div></div></footer>
  </div>
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return <div className="flex gap-3"><div className="text-[10px] font-black text-red-600">{n}</div><div><div className="text-sm font-bold">{t}</div><div className="mt-1 text-xs leading-5 text-black/45">{d}</div></div></div>
}
