import { useAuthActions } from "@convex-dev/auth/react"
import { useAction } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useRef, useState } from "react"
import {
  createGoogleAuthChallenge,
  createGoogleAuthHandoff,
  createGoogleAuthVerifier,
  describeGoogleAuthError,
  takeGoogleAuthHandoff,
  type GoogleAuthHandoffMode,
} from "@/lib/google-auth-handoff"

const POLL_MS = 2000
const TIMEOUT_MS = 10 * 60 * 1000
const READY_TIMEOUT_MS = 10000
const READY = "macaly-google-popup-ready"
const START = "macaly-google-popup-start"

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms))

function openPopup() {
  const width = 520
  const height = 720
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
  return window.open("/auth/google/popup", "_blank",
    `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`)
}

function waitForReady(authWindow: Window) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handle)
      reject(new Error("Google sign-in popup timed out"))
    }, READY_TIMEOUT_MS)
    function handle(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== authWindow || event.data?.type !== READY) return
      window.clearTimeout(timeout)
      window.removeEventListener("message", handle)
      resolve()
    }
    window.addEventListener("message", handle)
  })
}

export function GoogleAuthButton({ mode = "sign-in" }: { mode?: GoogleAuthHandoffMode }) {
  const { signIn } = useAuthActions()
  const createAuthorizationUrl = useAction(api.googleAuth.createAuthorizationUrl)
  const getAuthorizationStatus = useAction(api.googleAuth.getAuthorizationStatus)
  const attempt = useRef(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function start() {
    const attemptId = ++attempt.current
    setError(null)
    setLoading(true)
    let authWindow: Window | null = null
    try {
      const flowMode = window.top === window ? "redirect" : "popup"
      const handoffChallengePromise = createGoogleAuthHandoff(mode)
      const popupVerifier = flowMode === "popup" ? createGoogleAuthVerifier() : null
      const popupChallengePromise = popupVerifier ? createGoogleAuthChallenge(popupVerifier) : Promise.resolve(null)
      let popupReady: Promise<void> | null = null
      if (flowMode === "popup") {
        authWindow = openPopup()
        if (!authWindow) throw new Error("Google sign-in popup was blocked")
        popupReady = waitForReady(authWindow)
      }
      const [handoffChallenge, popupChallenge] = await Promise.all([handoffChallengePromise, popupChallengePromise])
      const authorizationPromise = createAuthorizationUrl({
        appOrigin: window.location.origin,
        handoffChallenge,
        flowMode,
        ...(popupChallenge ? { popupChallenge } : {}),
      })
      const authorization = authWindow
        ? (await Promise.all([authorizationPromise, popupReady ?? Promise.reject(new Error("Google popup failed"))]))[0]
        : await authorizationPromise
      if (authWindow && popupVerifier) {
        authWindow.postMessage({
          type: START,
          flowId: authorization.flowId,
          authorizationUrl: authorization.authorizationUrl,
          popupVerifier,
        }, window.location.origin)
      } else {
        window.location.href = authorization.authorizationUrl
      }
      if (!authWindow) return

      const deadline = Date.now() + TIMEOUT_MS
      while (attempt.current === attemptId && Date.now() < deadline) {
        const status = await getAuthorizationStatus({ flowId: authorization.flowId })
        if (status.status === "pending") {
          await wait(POLL_MS)
          continue
        }
        const handoff = takeGoogleAuthHandoff()
        if (status.status === "error") {
          throw new Error(status.error === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed.")
        }
        if (!handoff) throw new Error("Google sign-in handoff expired.")
        await signIn("macaly-google", {
          grant: status.grant,
          handoffVerifier: handoff.verifier,
          linkToCurrentUser: handoff.mode === "link",
        })
        authWindow.close()
        setLoading(false)
        return
      }
      if (attempt.current === attemptId) throw new Error("Google sign-in timed out. Please try again.")
    } catch (caught) {
      if (attempt.current !== attemptId) return
      authWindow?.close()
      takeGoogleAuthHandoff()
      setError(describeGoogleAuthError(caught, mode))
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
    {loading && <button type="button" onClick={() => { attempt.current += 1; takeGoogleAuthHandoff(); setLoading(false) }}
      className="w-full text-xs font-bold text-white/45 underline">Cancel</button>}
  </div>
}
