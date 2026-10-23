import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { GoogleAuthButton } from "@/components/google-auth-button"

export function MosesAccess({ children }: { children: React.ReactNode }) {
  return <>
    <AuthLoading>
      <div className="min-h-screen bg-black text-white grid place-items-center">
        <div className="text-xs font-black tracking-[.25em]">CHECKING DEXTA ACCESS…</div>
      </div>
    </AuthLoading>
    <Authenticated>{children}</Authenticated>
    <Unauthenticated><MosesLogin /></Unauthenticated>
  </>
}

function MosesLogin() {
  return <div className="min-h-screen bg-black text-white grid place-items-center p-5">
    <div className="w-full max-w-md border border-white/10 bg-zinc-950 p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center bg-red-600 text-lg font-black">D</div>
        <div>
          <div className="font-black tracking-[.2em]">DEXTA</div>
          <div className="text-[9px] tracking-[.25em] text-white/45">PRIVATE OPERATIONS</div>
        </div>
      </div>

      <div className="mt-10 text-[10px] font-black tracking-[.25em] text-red-500">MOSES ACCESS</div>
      <h1 className="mt-2 text-3xl font-black">Dexta Command Center</h1>
      <p className="mt-2 text-sm leading-6 text-white/50">
        Sign in with the Google account authorized for Dexta operations.
      </p>

      <div className="mt-7">
        <GoogleAuthButton />
      </div>

      <div className="mt-7 border-t border-white/10 pt-5 text-[10px] leading-5 text-white/35">
        Google handles authentication. Dexta controls authorization. The first authorized Google account becomes the owner; additional accounts require explicit authorization.
      </div>
    </div>
  </div>
}
