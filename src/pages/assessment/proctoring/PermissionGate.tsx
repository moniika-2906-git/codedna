import { AlertTriangle, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionGateProps {
  onRetry: () => void;
}

/**
 * Blocking card shown when camera/mic access is denied. The assessment is
 * not rendered until the candidate grants access and taps "Try Again".
 */
export const PermissionGate = ({ onRetry }: PermissionGateProps) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Camera &amp; microphone required
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This assessment is proctored. To continue, allow access to your
          camera and microphone in your browser, then tap Try Again.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Camera className="h-3.5 w-3.5" />
          <span>Proctoring cannot run without media access.</span>
        </div>
        <Button
          onClick={onRetry}
          className="mt-6 gap-1.5 bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};
