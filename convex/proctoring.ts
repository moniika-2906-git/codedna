import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// 90-day retention window for proctoring data, per the stated policy.
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Internal mutation: records a student's proctoring consent.
 *
 * Called ONLY from the `POST /proctoring/consent` HTTP action (see convex/http.ts),
 * never directly from the client — this is what lets us capture the caller's IP
 * and identity server-side where they cannot be spoofed.
 *
 * Immutability: there is intentionally NO update/patch function for
 * proctoringSessions. The only writers are this insert and the `purgeExpired`
 * cron delete. Re-submitting consent for the same session is idempotent: the
 * original record is left untouched and its id is returned.
 */
export const recordConsent = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    ipAddress: v.string(),
    consentVersion: v.string(),
    consentText: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, userId, ipAddress, consentVersion, consentText } = args;

    // Defensive: the session must exist and belong to the consenting user, so
    // a caller can never lodge a consent record against someone else's session.
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session does not belong to this user");
    }

    // Idempotent: if a consent record already exists for this session, keep
    // the original (immutability) and return its id instead of duplicating.
    const existing = await ctx.db
      .query("proctoringSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();
    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("proctoringSessions", {
      sessionId,
      userId,
      consentedAt: Date.now(),
      ipAddress,
      consentVersion,
      consentText,
    });
  },
});

/**
 * Whether the caller has consented to proctoring for the given session.
 * Used client-side to gate camera/mic requests and the assessment itself.
 * Returns false if the caller isn't signed in or has no consent record, or if
 * the session belongs to a different user.
 */
export const hasConsented = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const record = await ctx.db
      .query("proctoringSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();
    if (!record) return false;
    return record.userId === userId;
  },
});

/**
 * Returns a one-shot Convex file-storage upload URL. The client POSTs a
 * snapshot blob to that URL and receives a `storageId` it then passes to
 * `logEvent`. Auth-required so anonymous clients can't occupy storage.
 */
export const generateSnapshotUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Logs a single immutable proctoring anomaly event. Optionally attaches a
 * snapshot (already uploaded to file storage) by its storage id; the readable
 * URL is resolved server-side so the client can't forge it.
 */
export const logEvent = mutation({
  args: {
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
    snapshotStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { sessionId, eventType, severity, snapshotStorageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Only allow logging against a session the caller owns.
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session does not belong to this user");
    }

    const snapshotUrl = snapshotStorageId
      ? (await ctx.storage.getUrl(snapshotStorageId)) ?? undefined
      : undefined;

    return await ctx.db.insert("proctoringEvents", {
      sessionId,
      eventType,
      severity,
      timestamp: Date.now(),
      snapshotStorageId,
      snapshotUrl,
    });
  },
});

/**
 * Lists all proctoring events for a session, oldest first. Exposed for the
 * recruiter dashboard / replay pages to surface anomalies (not wired into UI
 * in this task, but available for later use).
 */
export const listEventsForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("proctoringEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

/**
 * Internal mutation run by the daily cron (see convex/crons.ts). Deletes
 * proctoring events older than the 90-day retention window — including their
 * snapshot blobs from file storage — and purges expired proctoring sessions.
 * Newer rows are left untouched.
 */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_MS;

    const expiredEvents = await ctx.db
      .query("proctoringEvents")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const evt of expiredEvents) {
      if (evt.snapshotStorageId) {
        try {
          await ctx.storage.delete(evt.snapshotStorageId);
        } catch {
          // Blob may already be gone; the event row should still be deleted.
        }
      }
      await ctx.db.delete(evt._id);
    }

    const expiredSessions = await ctx.db
      .query("proctoringSessions")
      .filter((q) => q.lt(q.field("consentedAt"), cutoff))
      .collect();

    for (const s of expiredSessions) {
      await ctx.db.delete(s._id);
    }

    return {
      deletedEvents: expiredEvents.length,
      deletedSessions: expiredSessions.length,
    };
  },
});
