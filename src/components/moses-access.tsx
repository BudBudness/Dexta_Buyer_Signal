import { useAuthActions } from "@convex-dev/auth/react"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { useState } from "react"

export function MosesAccess({ children }: { children: React.ReactNode }) {
  return <>
    <AuthLoading><div className="min-h-screen bg-black text-white grid place-items-center"><div className="text-xs font-black tracking-[.25em]">CHECKING DEXTA ACCESS…</div></div></AuthLoading>
    <Authenticated>{children}</Authenticated>
    <Unauthenticated><MosesLogin /></Unauthenticated>
  </>
}

function MosesLogin() {
  const { signIn } = useAuthActions()
  const [mode,setMode]=useState<"signIn"|"signUp">("signIn")
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("Moses"),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  async function submit(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError("")
    try {
      const fd=new FormData();fd.set("email",email);fd.set("password",password);fd.set("flow",mode)
      await signIn("password",fd)
    } catch(err){setError(err instanceof Error?err.message:"Access failed")} finally{setBusy(false)}
  }
  return <div className="min-h-screen bg-black text-white grid place-items-center p-5">
    <div className="w-full max-w-md border border-white/10 bg-zinc-950 p-7 sm:p-9">
      <div className="flex items-center gap-3"><div className="grid size-11 place-items-center bg-red-600">D</div><div><div className="font-black tracking-[.2em]">DEXTA</div><div className="text-[9px] tracking-[.25em] text-white/45">PRIVATE OPERATIONS</div></div></div>
      <div className="mt-10 text-[10px] font-black tracking-[.25em] text-red-500">MOSES ACCESS</div>
      <h1 className="mt-2 text-3xl font-black">Dexta Command Center</h1>
      <p className="mt-2 text-sm leading-6 text-white/50">Private operational access. Client activity stays outside this workspace.</p>
      <form onSubmit={submit} className="mt-7 space-y-3">
        {mode==="signUp"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full border border-white/10 bg-black p-4 text-sm outline-none focus:border-red-600" required/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border border-white/10 bg-black p-4 text-sm outline-none focus:border-red-600" required/>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password (8+ characters)" minLength={8} className="w-full border border-white/10 bg-black p-4 text-sm outline-none focus:border-red-600" required/>
        {error&&<div className="border border-red-700/50 bg-red-950/30 p-3 text-xs text-red-300">{error}</div>}
        <button disabled={busy} className="w-full bg-red-600 p-4 text-xs font-black disabled:opacity-50">{busy?"AUTHENTICATING…":mode==="signIn"?"SIGN IN":"CREATE MOSES ACCESS"}</button>
      </form>
      <button onClick={()=>{setMode(mode==="signIn"?"signUp":"signIn");setError("")}} className="mt-4 text-xs font-bold text-white/45 underline">{mode==="signIn"?"First-time setup / create owner access":"Back to sign in"}</button>
      <div className="mt-7 border-t border-white/10 pt-5 text-[10px] leading-5 text-white/35">The first authorized account becomes the Dexta owner. Additional accounts are blocked until explicitly authorized.</div>
    </div>
  </div>
}
