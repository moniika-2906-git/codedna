import { useEffect, useRef } from "react";
import type { ProctoringApi } from "./types";

/**
 * Logs a `FULLSCREEN_EXIT` (MEDIUM) event when the document leaves
 * fullscreen while proctoring is active. Only transitions *out* of fullscreen
 * are logged; if the user never entered fullscreen, nothing fires.
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
        void apiRef.current.log({
          eventType: "FULLSCREEN_EXIT",
          severity: "MEDIUM",
        });
      }
      wasFullscreenRef.current = inFullscreen;
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [enabled]);
}
