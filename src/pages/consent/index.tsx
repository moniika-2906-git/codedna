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
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { CONVEX_SITE_URL } from "@/lib/convexClient";

/** Bumped when the consent wording materially changes. */
export const CONSENT_VERSION = "v1";

/**
 * The exact bullet points rendered to the user. These double as the verbatim
 * text logged to the backend at consent time (see CONSENT_TEXT below), so the
 * stored record always matches what the candidate was shown.
 */
export const CONSENT_BULLETS = [
  "We will access your camera",
  "We will access your microphone",
  "We will capture periodic snapshots during your session",
  "We will detect tab switches and fullscreen exits",
  "Data is retained for 90 days then deleted",
] as const;

// Exact text persisted in the consent record. Kept in sync with CONSENT_BULLETS
// so auditing can confirm the candidate saw precisely this wording.
export const CONSENT_TEXT = [
  `CodeDNA assessment proctoring consent (${CONSENT_VERSION}):`,
  ...CONSENT_BULLETS,
].join("\n");

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
    try {
      const res = await fetch(`${CONVEX_SITE_URL}/proctoring/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionId,
          consentVersion: CONSENT_VERSION,
          consentText: CONSENT_TEXT,
        }),
      });
      if (res.status === 401) {
        setError("Your session has expired. Please sign in again.");
        setIsSubmitting(false);
        return;
      }
      if (!res.ok) {
        setError("Could not record consent. Please try again.");
        setIsSubmitting(false);
        return;
      }
      navigate(`/assessment/${sessionId}`, { replace: true });
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
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
            {[
              {
                icon: Camera,
                text: CONSENT_BULLETS[0],
              },
              {
                icon: Mic,
                text: CONSENT_BULLETS[1],
              },
              {
                icon: ImageIcon,
                text: CONSENT_BULLETS[2],
              },
              {
                icon: Square,
                text: CONSENT_BULLETS[3],
              },
              {
                icon: Clock,
                text: CONSENT_BULLETS[4],
              },
            ].map(({ icon: Icon, text }) => (
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
                className="mt-0.5 border-zinc-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
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
