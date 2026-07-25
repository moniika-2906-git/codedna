import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Extend the auth-provided "users" table with our own custom field.
  users: defineTable({
    ...authTables.users.validator.fields,
    role: v.optional(
      v.union(v.literal("STUDENT"), v.literal("RECRUITER"), v.literal("ADMIN"))
    ),
  }).index("email", ["email"]),

  problems: defineTable({
    title: v.string(),
    difficulty: v.union(v.literal("EASY"), v.literal("MEDIUM"), v.literal("HARD")),
    description: v.string(),
    exampleInput: v.string(),
    exampleOutput: v.string(),
    starterCode: v.string(),
  }),

  sessions: defineTable({
    userId: v.id("users"),
    problemId: v.optional(v.id("problems")),
    problemName: v.string(),
    code: v.string(),
    score: v.optional(v.number()),
    startedAt: v.number(),
    submittedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  promptLogs: defineTable({
    sessionId: v.id("sessions"),
    prompt: v.string(),
    aiResponse: v.string(),
    action: v.union(
      v.literal("ASKED"),
      v.literal("ACCEPTED"),
      v.literal("REJECTED"),
      v.literal("MODIFIED")
    ),
  }).index("by_session", ["sessionId"]),

  // Proctoring consent records. Immutable once written: only `recordConsent`
  // (internal mutation) inserts, and only the daily `purgeExpired` cron deletes.
  // The client never writes here directly — consent is lodged via the
  // /proctoring/consent HTTP action so the IP + identity are resolved server-side.
  proctoringSessions: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    consentedAt: v.number(),
    ipAddress: v.string(),
    consentVersion: v.string(),
    consentText: v.string(),
  }).index("by_session", ["sessionId"]),

  // Immutable proctoring anomaly events logged during an assessment. Each row
  // optionally references a snapshot stored in Convex file storage (_storage).
  proctoringEvents: defineTable({
    sessionId: v.id("sessions"),
    eventType: v.union(
      v.literal("NO_FACE"),
      v.literal("MULTIPLE_FACES"),
      v.literal("TAB_SWITCH"),
      v.literal("FULLSCREEN_EXIT"),
      v.literal("AUDIO_ANOMALY")
    ),
    severity: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH")
    ),
    timestamp: v.number(),
    snapshotStorageId: v.optional(v.id("_storage")),
    snapshotUrl: v.optional(v.string()),
  }).index("by_session", ["sessionId"]),
});
