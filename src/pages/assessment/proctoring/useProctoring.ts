import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMediaStream } from "./useMediaStream";
import { useFaceMonitor } from "./useFaceMonitor";
import { useVisibilityMonitor } from "./useVisibilityMonitor";
import { useFullscreenMonitor } from "./useFullscreenMonitor";
import { useAudioMonitor } from "./useAudioMonitor";
import type { ProctoringApi, ProctoringEventType } from "./types";

export interface ProctoringState {
  stream: MediaStream | null;
  permissionDenied: boolean;
  error: Error | null;
  /** Consent confirmed but media could not be acquired — block the assessment. */
  blocked: boolean;
  /** Re-request camera/mic after a denial/failure. */
  retry: () => void;
}

/**
 * Composes the four single-purpose proctoring monitors (face, audio,
 * visibility, fullscreen) over a shared MediaStream, all funnelling events
 * through one `logEvent` mutation + one snapshot upload helper. Mounted inside
 * the assessment page once consent is confirmed.
 *
 * Proctoring never throws into the assessment: any logging/upload failure is
 * swallowed so a candidate's work is never disrupted by an integrity check.
 */
export function useProctoring(
  sessionId: Id<"sessions"> | undefined,
  enabled: boolean
): ProctoringState {
  const { stream, error, permissionDenied, retry } = useMediaStream(enabled);
  const logEvent = useMutation(api.proctoring.logEvent);
  const generateSnapshotUploadUrl = useMutation(
    api.proctoring.generateSnapshotUploadUrl
  );

  const log = useCallback(
    async (args: { eventType: ProctoringEventType; snapshot?: Blob }) => {
      if (!sessionId) return;
      try {
        let storageId: Id<"_storage"> | undefined;
        if (args.snapshot) {
          const uploadUrl = await generateSnapshotUploadUrl({ sessionId });
          const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            body: args.snapshot,
          });
          if (!uploadRes.ok) return;
          const json = (await uploadRes.json()) as {
            storageId: Id<"_storage">;
          };
          storageId = json.storageId;
        }
        await logEvent({
          sessionId,
          eventType: args.eventType,
          storageId,
        });
      } catch {
        // Swallowed intentionally — see hook docstring.
      }
    },
    [sessionId, logEvent, generateSnapshotUploadUrl]
  );

  const proctoringApi: ProctoringApi = { log };

  const active = enabled && !!stream;
  useFaceMonitor(stream, proctoringApi, active);
  useAudioMonitor(stream, proctoringApi, active);
  useVisibilityMonitor(proctoringApi, enabled);
  useFullscreenMonitor(proctoringApi, enabled);

  // Block the assessment whenever consent is confirmed but the camera/mic
  // couldn't be acquired (permission denied, no hardware, etc.) — proctoring
  // must never silently continue without a media feed.
  const blocked = enabled && !stream && !!error;

  return { stream, permissionDenied, error, blocked, retry };
}
