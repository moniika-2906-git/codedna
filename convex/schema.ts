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

  // Proctoring consent records: the audit trail proving consent was given.
  // Insert-only — rows are NEVER deleted. `recordConsent` (internal mutation,
  // called only from the /proctoring/consent HTTP action) is the sole inserter,
  // and `markPurged` is the sole patcher, and it may only ever set `purgedAt`.
  proctoringSessions: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    consentVersion: v.string(),
    consentText: v.string(),
    ipAddress: v.string(),
    createdAt: v.number(),
    // Set by the retention cron once this session's events/snapshots have
    // been purged. Undefined until then. The consent record itself persists.
    purgedAt: v.optional(v.number()),
  }).index("by_session", ["sessionId"]),

  // Immutable proctoring anomaly events logged during an assessment. Each row
  // optionally references a snapshot stored in Convex file storage (_storage).
  proctoringEvents: defineTable({
    sessionId: v.id("sessions"),
    eventType: v.union(
      v.literal("no-face"),
      v.literal("multi-face"),
      v.literal("tab-switch"),
      v.literal("fullscreen-exit"),
      v.literal("audio-anomaly")
    ),
    timestamp: v.number(),
    storageId: v.optional(v.id("_storage")),
  }).index("by_session", ["sessionId"]),
});
