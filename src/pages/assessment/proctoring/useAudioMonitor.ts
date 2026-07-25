import { useEffect, useRef } from "react";
import type { ProctoringApi } from "./types";

// RMS amplitude (0..1) considered "loud" for anomaly purposes.
const VOLUME_THRESHOLD = 0.12;
// Must stay above the threshold for this long before an event fires, so brief
// transient noise (coughs, door slams) does NOT log.
const SUSTAINED_MS = 1500;
// Cooldown after an event so continuous loud input doesn't spam duplicates.
const COOLDOWN_MS = 5000;

/**
 * Feeds the microphone track into a Web Audio AnalyserNode and polls RMS
 * volume via requestAnimationFrame. Logs `audio-anomaly` only when the
 * volume stays above the threshold for a sustained window — brief transients
 * reset the window and never fire — and debounces repeat events.
 */
export function useAudioMonitor(
  stream: MediaStream | null,
  api: ProctoringApi,
  enabled: boolean
) {
  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    if (!enabled || !stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    let cancelled = false;
    let audioCtx: AudioContext | null = null;
    let rafId: number | null = null;
    let loudSince: number | null = null;
    let lastLoggedAt = 0;

    try {
      audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (cancelled) return;
        analyser.getByteTimeDomainData(data);
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / data.length);
        const now = performance.now();

        if (rms > VOLUME_THRESHOLD) {
          if (loudSince === null) loudSince = now;
          if (
            now - loudSince >= SUSTAINED_MS &&
            now - lastLoggedAt > COOLDOWN_MS
          ) {
            lastLoggedAt = now;
            loudSince = now; // restart the sustained window after firing
            void apiRef.current.log({ eventType: "audio-anomaly" });
          }
        } else {
          // Dropped below threshold: a later loud period must sustain again.
          loudSince = null;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    } catch {
      // Audio analysis unavailable; non-fatal — other monitors still run.
    }

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (audioCtx && audioCtx.state !== "closed") {
        void audioCtx.close();
      }
    };
  }, [stream, enabled]);
}
