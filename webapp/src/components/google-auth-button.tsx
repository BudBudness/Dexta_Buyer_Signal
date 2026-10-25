import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"

type GoogleAuthButtonProps = { mode?: "sign-in" | "link" }

export function GoogleAuthButton({ mode = "sign-in" }: GoogleAuthButtonProps) {
  const { signIn } = useAuthActions()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function start() {
    setError(null)
    setLoading(true)
    try {
      // Convex Auth owns the complete OAuth redirect/callback flow.
      await signIn("google", { redirectTo: mode === "link" ? "/settings/security" : "/" })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in failed. Please try again.")
      setLoading(false)
    }
  }

  return <div className="space-y-3">
    <button type="button" onClick={() => void start()} disabled={loading}
      className="flex w-full items-center justify-center gap-3 border border-white/15 bg-white p-4 text-sm font-black text-black transition hover:bg-zinc-100 disabled:opacity-50">
      <span className="grid size-6 place-items-center rounded-full border border-black/10 text-xs font-black">G</span>
      {loading ? "CONNECTING TO GOOGLE…" : mode === "link" ? "LINK GOOGLE ACCOUNT" : "CONTINUE WITH GOOGLE"}
    </button>
    {error && <div role="alert" className="border border-red-700/50 bg-red-950/30 p-3 text-xs leading-5 text-red-300">{error}</div>}
  </div>
}
