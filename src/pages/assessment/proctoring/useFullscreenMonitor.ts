import { useEffect, useRef } from "react";
import type { ProctoringApi } from "./types";

/**
 * Logs a `fullscreen-exit` event when the document leaves fullscreen while
 * proctoring is active. Only transitions *out* of fullscreen are logged.
 *
 * Real users always have a fullscreen baseline to exit from: the consent
 * page (`src/pages/consent/index.tsx`) requires and enters fullscreen on the
 * consent→assessment transition, blocking the transition entirely if the
 * browser/user denies it. Without that guarantee this monitor could never
 * fire for a real candidate.
 */
export function useFullscreenMonitor(api: ProctoringApi, enabled: boolean) {
  const apiRef = useRef(api);
  apiRef.current = api;
  const wasFullscreenRef = useRef<boolean>(
    typeof document !== "undefined" ? !!document.fullscreenElement : false
  );

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handler = () => {
      const inFullscreen = !!document.fullscreenElement;
      if (!inFullscreen && wasFullscreenRef.current) {
        void apiRef.current.log({ eventType: "fullscreen-exit" });
      }
      wasFullscreenRef.current = inFullscreen;
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [enabled]);
}
