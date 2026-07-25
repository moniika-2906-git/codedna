import { useEffect, useRef } from "react";

interface WebcamThumbnailProps {
  stream: MediaStream | null;
}

/**
 * Small persistent camera preview pinned to the bottom-right of the
 * assessment workspace. Confirms the feed is live while proctoring is active
 * and makes the recording obvious to the candidate.
 */
export const WebcamThumbnail = ({ stream }: WebcamThumbnailProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      void video.play().catch(() => {
        /* autoplay restrictions; the muted video will start on first interaction */
      });
    }
  }, [stream]);

  return (
    <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl ring-1 ring-black/40">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className="h-28 w-40 object-cover"
      />
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-zinc-950/70 px-1.5 py-0.5 backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-100">
          Recording
        </span>
      </div>
    </div>
  );
};
