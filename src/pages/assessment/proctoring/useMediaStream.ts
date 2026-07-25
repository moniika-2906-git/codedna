import { useCallback, useEffect, useState } from "react";

export interface MediaStreamState {
  stream: MediaStream | null;
  error: Error | null;
  permissionDenied: boolean;
  /** Re-requests camera + microphone. Used by the PermissionGate "Try Again". */
  retry: () => void;
}

/**
 * Acquires a single combined camera + microphone MediaStream, surfacing a
 * permission-denied state when the user blocks access. The stream's tracks
 * are stopped on unmount so the camera/mic indicators turn off.
 *
 * `enabled` gates the request: getUserMedia is only called once consent has
 * been confirmed, so the camera/mic is never touched before the candidate
 * agrees.
 */
export function useMediaStream(enabled: boolean): MediaStreamState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    let active = true;
    let currentStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        currentStream = s;
        setStream(s);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStream(null);
      });

    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [attempt, enabled]);

  const retry = useCallback(() => {
    setStream(null);
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  const permissionDenied =
    !!error &&
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "SecurityError");

  return { stream, error, permissionDenied, retry };
}
