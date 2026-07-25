import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import type { ProctoringApi, ProctoringEventType } from "./types";

const DETECTION_INTERVAL_MS = 5000;

// Model load is shared across mounts so re-entering the assessment doesn't
// re-fetch the weights. Reset on failure so a transient 404 can be retried.
let modelsLoaded = false;
let modelsLoading: Promise<void> | null = null;

function ensureModelsLoaded(): Promise<void> {
  if (modelsLoaded) return Promise.resolve();
  if (!modelsLoading) {
    modelsLoading = faceapi.nets.tinyFaceDetector
      .loadFromUri("/models")
      .then(() => {
        modelsLoaded = true;
        modelsLoading = null;
      })
      .catch((err) => {
        modelsLoading = null;
        throw err;
      });
  }
  return modelsLoading;
}

/** Draws the current video frame to an offscreen canvas and returns a JPEG blob. */
async function captureFrame(video: HTMLVideoElement): Promise<Blob | undefined> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.7)
    );
    return blob ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Loads the TinyFaceDetector model once, then every 5s counts faces in the
 * camera feed. Logs `no-face` when 0 faces are seen and `multi-face` when 2+
 * are seen, attaching a snapshot of the current frame. A persistent
 * condition logs exactly once until it clears, so a sustained 0-face state
 * isn't spammed every interval.
 */
export function useFaceMonitor(
  stream: MediaStream | null,
  api: ProctoringApi,
  enabled: boolean
) {
  const apiRef = useRef(api);
  apiRef.current = api;
  const lastLoggedRef = useRef<ProctoringEventType | null>(null);

  useEffect(() => {
    if (!enabled || !stream) return;
    let cancelled = false;
    const video = document.createElement("video");
    video.setAttribute("playsinline", "true");
    video.muted = true;
    video.srcObject = stream;

    const detector = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    });

    let timer: ReturnType<typeof setInterval> | null = null;

    const detect = async () => {
      if (cancelled || video.readyState < 2) return;
      try {
        const results = await faceapi.detectAllFaces(video, detector);
        const count = results.length;
        if (count === 0) {
          if (lastLoggedRef.current !== "no-face") {
            lastLoggedRef.current = "no-face";
            const snapshot = await captureFrame(video);
            await apiRef.current.log({ eventType: "no-face", snapshot });
          }
        } else if (count >= 2) {
          if (lastLoggedRef.current !== "multi-face") {
            lastLoggedRef.current = "multi-face";
            const snapshot = await captureFrame(video);
            await apiRef.current.log({ eventType: "multi-face", snapshot });
          }
        } else {
          // Back to a normal single-face state; reset so the next anomaly logs.
          lastLoggedRef.current = null;
        }
      } catch {
        // Detection failures (e.g. mid-load) are non-fatal; retry next tick.
      }
    };

    void video
      .play()
      .catch(() => {
        /* autoplay may be blocked until a gesture; detection retries */
      })
      .finally(() => ensureModelsLoaded())
      .then(() => {
        if (cancelled) return;
        timer = setInterval(detect, DETECTION_INTERVAL_MS);
        void detect();
      })
      .catch(() => {
        // Model load failed; face monitoring stays inert for this session.
      });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      video.pause();
      video.srcObject = null;
    };
  }, [stream, enabled]);
}
