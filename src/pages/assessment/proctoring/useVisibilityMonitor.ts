import { useEffect, useRef } from "react";
import type { ProctoringApi } from "./types";

/**
 * Logs a single `tab-switch` event each time the document becomes hidden.
 * Tracks the previous visibility state so a full hidden→visible cycle logs
 * exactly once — rapid tab toggling doesn't produce duplicates.
 */
export function useVisibilityMonitor(api: ProctoringApi, enabled: boolean) {
  const apiRef = useRef(api);
  apiRef.current = api;
  const wasHiddenRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handler = () => {
      if (document.hidden) {
        if (!wasHiddenRef.current) {
          wasHiddenRef.current = true;
          void apiRef.current.log({ eventType: "tab-switch" });
        }
      } else {
        wasHiddenRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [enabled]);
}
