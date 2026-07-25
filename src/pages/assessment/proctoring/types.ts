// Shared types for the assessment proctoring runtime. The event types and
// severities mirror the Convex `proctoringEvents` schema exactly.

export type ProctoringEventType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "TAB_SWITCH"
  | "FULLSCREEN_EXIT"
  | "AUDIO_ANOMALY";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface ProctoringApi {
  /** Log one anomaly event, uploading an optional snapshot to file storage. */
  log: (args: {
    eventType: ProctoringEventType;
    severity: Severity;
    snapshot?: Blob;
  }) => Promise<void>;
}
