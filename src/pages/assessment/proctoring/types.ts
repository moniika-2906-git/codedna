// Shared types for the assessment proctoring runtime. Event type strings
// mirror the Convex `proctoringEvents` schema exactly.

export type ProctoringEventType =
  | "no-face"
  | "multi-face"
  | "tab-switch"
  | "fullscreen-exit"
  | "audio-anomaly";

export interface ProctoringApi {
  /** Log one anomaly event, uploading an optional snapshot to file storage. */
  log: (args: {
    eventType: ProctoringEventType;
    snapshot?: Blob;
  }) => Promise<void>;
}
