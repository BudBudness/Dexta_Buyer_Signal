import { createFileRoute } from "@tanstack/react-router"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { storeGoogleAuthPopupProof } from "@/lib/google-auth-handoff"

export const Route = createFileRoute("/auth/google/popup")({
  component: GooglePopupBootstrap,
})

function GooglePopupBootstrap() {
  useMountEffect(() => {
    const opener = window.opener
    if (!opener) return

    const origin = window.location.origin
    const READY = "macaly-google-popup-ready"
    const START = "macaly-google-popup-start"

    const announce = () => opener.postMessage({ type: READY }, origin)
    const interval = window.setInterval(announce, 250)

    const handle = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== opener || event.data?.type !== START) return
      const { flowId, authorizationUrl, popupVerifier } = event.data ?? {}
      if (
        typeof flowId !== "string" ||
        typeof authorizationUrl !== "string" ||
        typeof popupVerifier !== "string"
      ) return

      const target = new URL(authorizationUrl)
      if (target.protocol !== "https:") return

      window.clearInterval(interval)
      window.removeEventListener("message", handle)
      storeGoogleAuthPopupProof(flowId, popupVerifier)
      window.opener = null
      window.location.replace(target.toString())
    }

    window.addEventListener("message", handle)
    announce()
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("message", handle)
    }
  })

  return <div className="min-h-screen bg-black text-white grid place-items-center">
    <div className="text-xs font-black tracking-[.2em]">OPENING GOOGLE…</div>
  </div>
}
