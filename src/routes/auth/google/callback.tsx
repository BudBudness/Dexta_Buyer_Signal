import { useAuthActions } from "@convex-dev/auth/react"
import { useAction } from "convex/react"
import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { useMountEffect } from "@/hooks/use-mount-effect"
import {
  describeGoogleAuthError,
  takeGoogleAuthHandoff,
  takeGoogleAuthPopupProof,
} from "@/lib/google-auth-handoff"

export const Route = createFileRoute("/auth/google/callback")({
  component: GoogleAuthCallbackPage,
})

function GoogleAuthCallbackPage() {
  const { signIn } = useAuthActions()
  const completeAuthorizationPopup = useAction(api.googleAuth.completeAuthorizationPopup)
  const handled = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useMountEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const grant = params.get("macaly_google_grant")
    const oauthError = params.get("macaly_google_error")
    const flowId = params.get("macaly_google_flow")
    window.history.replaceState(null, "", window.location.pathname)

    if (flowId) {
      const proof = takeGoogleAuthPopupProof(flowId)
      if (!grant || !proof || oauthError) {
        setError("Google sign-in failed. Return to Dexta and try again.")
        return
      }
      void completeAuthorizationPopup({ flowId, grant, popupVerifier: proof })
        .then(() => window.close())
        .catch(() => setError("Google sign-in failed. Return to Dexta and try again."))
      return
    }

    const handoff = takeGoogleAuthHandoff()
    if (!grant || !handoff || oauthError) {
      setError(oauthError === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed.")
      return
    }

    void signIn("macaly-google", {
      grant,
      handoffVerifier: handoff.verifier,
      linkToCurrentUser: handoff.mode === "link",
    })
      .then(() => window.location.replace("/"))
      .catch(caught => setError(describeGoogleAuthError(caught, handoff.mode)))
  })

  return <div className="min-h-screen bg-black text-white grid place-items-center p-6">
    <div className="max-w-md text-center">
      {error ? <>
        <div className="text-xs font-black tracking-[.2em] text-red-500">GOOGLE ACCESS</div>
        <p role="alert" className="mt-3 text-sm text-white/70">{error}</p>
        <a href="/" className="mt-5 inline-block text-xs font-black underline">RETURN TO DEXTA</a>
      </> : <div className="text-xs font-black tracking-[.2em]">COMPLETING GOOGLE SIGN-IN…</div>}
    </div>
  </div>
}
