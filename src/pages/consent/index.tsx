import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthToken } from "@convex-dev/auth/react";
import {
  Camera,
  Clock,
  Image as ImageIcon,
  Loader2,
  Mic,
  ShieldCheck,
  Square,
} from "lucide-react";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CONVEX_SITE_URL } from "@/lib/convexClient";
import { requestFullscreen } from "@/lib/fullscreen";

/**
 * Must match the key used server-side in `convex/proctoring.ts`
 * (CONSENT_TEXT_BY_VERSION). This page only ever displays the bullets and
 * sends this version string — the canonical consent text is resolved and
 * persisted server-side, never submitted by the client.
 */
const CONSENT_VERSION = "v1";

const CONSENT_ITEMS = [
  { icon: Camera, text: "We will access your camera" },
  { icon: Mic, text: "We will access your microphone" },
  { icon: ImageIcon, text: "We will capture periodic snapshots during your session" },
  { icon: Square, text: "We will detect tab switches and fullscreen exits" },
  { icon: Clock, text: "Data is retained for 90 days then deleted" },
] as const;

const ConsentContent = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const token = useAuthToken();

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed || isSubmitting || !sessionId) return;
    setIsSubmitting(true);
    setError(null);

    // Fullscreen must be requested (and granted) on this consent→assessment
    // transition, while we still have user-activation from the click, and
    // BEFORE navigating — otherwise fullscreen-exit detection during the
    // assessment would have no baseline "in fullscreen" state to exit from.
    // If the browser/user denies it, block starting entirely.
    const enteredFullscreen = await requestFullscreen();
    if (!enteredFullscreen) {
      setError(
        "Fullscreen is required to start this assessment. Please allow fullscreen and try again."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${CONVEX_SITE_URL}/proctoring/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // Only the version is sent — the server looks up the canonical text
        // itself so a client can never submit text that differs from what
        // was actually displayed.
        body: JSON.stringify({
          sessionId,
          consentVersion: CONSENT_VERSION,
        }),
      });
      if (res.status === 401) {
        setError("Your session has expired. Please sign in again.");
        setIsSubmitting(false);
        void document.exitFullscreen?.().catch(() => {});
        return;
      }
      if (!res.ok) {
        setError("Could not record consent. Please try again.");
        setIsSubmitting(false);
        void document.exitFullscreen?.().catch(() => {});
        return;
      }
      navigate(`/assessment/${sessionId}`, { replace: true });
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
      void document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg rounded-xl border-zinc-800 bg-zinc-900">
        <CardHeader className="items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Proctoring consent
          </h1>
          <p className="text-sm text-zinc-400">
            This assessment is monitored to protect integrity. Please review
            and agree before continuing.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" aria-label="What we will do">
            {CONSENT_ITEMS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </span>
                <span className="text-sm text-zinc-200">{text}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5 border-zinc-600 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
              />
              <span>
                I have read and agree to the proctoring terms described above.
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="gap-1.5 bg-indigo-500 text-zinc-50 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Continue to assessment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsentPage = () => (
  <RequireRole allowedRoles={["STUDENT"]} redirectTo="/dashboard">
    <ConsentContent />
  </RequireRole>
);

export default ConsentPage;
