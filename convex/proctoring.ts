import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// 90-day retention window for proctoring event/snapshot data. The
// proctoringSessions audit trail itself is never deleted (see purgeExpired).
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Canonical consent text, keyed by version. The client only ever sends a
 * `consentVersion` string — never the text itself — so a tampered/forged
 * client payload can never end up persisted as if it were what the user saw.
 * Bump the version key whenever the wording materially changes; never mutate
 * an existing entry's text (would falsify already-recorded consent history).
 */
const CONSENT_TEXT_BY_VERSION: Record<string, string> = {
  v1: [
    "CodeDNA assessment proctoring consent (v1):",
    "We will access your camera",
    "We will access your microphone",
    "We will capture periodic snapshots during your session",
    "We will detect tab switches and fullscreen exits",
    "Data is retained for 90 days then deleted",
  ].join("\n"),
};

export const LATEST_CONSENT_VERSION = "v1";

/**
 * Shared ownership check, reused by every function that takes a `sessionId`
 * (hasConsented, generateSnapshotUploadUrl, logEvent). Resolves the caller's
 * user id via `getAuthUserId` — NOT a raw `identity.subject` comparison,
 * because @convex-dev/auth encodes `subject` as `"<userId>::<authSessionId>"`,
 * so a literal `session.userId === identity.subject` check would always be
 * false — and verifies they own the assessment `sessions` row referenced by
 * `sessionId`. Throws on any failure; callers that need a boolean instead
 * (like `hasConsented`) catch and translate.
 */
async function requireSessionOwner(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions">
): Promise<{ userId: Id<"users"> }> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not signed in");
  }
  const session = await ctx.db.get(sessionId);
  if (!session || session.userId !== userId) {
    throw new Error("Session does not belong to this user");
  }
  return { userId };
}

/**
 * Internal mutation: records a student's proctoring consent.
 *
 * Called ONLY from the `POST /proctoring/consent` HTTP action (see
 * convex/http.ts), never directly from the client — this is what lets us
 * capture the caller's IP and identity server-side where they cannot be
 * spoofed. Only `consentVersion` is accepted; the exact `consentText` is
 * resolved server-side from `CONSENT_TEXT_BY_VERSION` so a client can never
 * submit text that differs from what it actually displayed.
 *
 * Insert-only: there is no update/patch function for proctoringSessions other
 * than `markPurged`, which may only ever set `purgedAt`. Re-submitting
 * consent for the same session is idempotent — the original record is kept
 * and its id returned, never overwritten.
 */
export const recordConsent = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    ipAddress: v.string(),
    consentVersion: v.string(),
  },
  handler: async (ctx, { sessionId, userId, ipAddress, consentVersion }) => {
    const consentText = CONSENT_TEXT_BY_VERSION[consentVersion];
    if (!consentText) {
      throw new Error(`Unknown consent version: ${consentVersion}`);
    }

    // The session must exist and belong to the consenting user, so a caller
    // can never lodge a consent record against someone else's session.
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session does not belong to this user");
    }

    // Idempotent: keep the original record (insert-only) if one exists.
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
      consentVersion,
      consentText,
      ipAddress,
      createdAt: Date.now(),
    });
  },
});

/**
 * Whether the caller has consented to proctoring for the given session.
 * Used client-side to gate camera/mic requests and the assessment itself.
 * Uses the shared ownership check; returns false (rather than throwing) for
 * any unauthenticated/not-owned/no-record case since this is a plain gate.
 */
export const hasConsented = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    let userId: Id<"users">;
    try {
      ({ userId } = await requireSessionOwner(ctx, sessionId));
    } catch {
      return false;
    }
    const record = await ctx.db
      .query("proctoringSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();
    return !!record && record.userId === userId;
  },
});

/**
 * Returns a one-shot Convex file-storage upload URL for a proctoring
 * snapshot. Ownership-checked via the shared helper so a client can't
 * generate upload URLs against a session it doesn't own.
 */
export const generateSnapshotUploadUrl = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireSessionOwner(ctx, sessionId);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Logs a single proctoring anomaly event. Ownership-checked via the shared
 * helper. Optionally attaches a snapshot (already uploaded to file storage)
 * by its storage id.
 */
export const logEvent = mutation({
  args: {
    sessionId: v.id("sessions"),
    eventType: v.union(
      v.literal("no-face"),
      v.literal("multi-face"),
      v.literal("tab-switch"),
      v.literal("fullscreen-exit"),
      v.literal("audio-anomaly")
    ),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { sessionId, eventType, storageId }) => {
    await requireSessionOwner(ctx, sessionId);

    return await ctx.db.insert("proctoringEvents", {
      sessionId,
      eventType,
      timestamp: Date.now(),
      storageId,
    });
  },
});

/**
 * Lists all proctoring events for a session, oldest first. Exposed for the
 * recruiter dashboard / replay pages to surface anomalies (not wired into UI
 * in this task, but available for later use). Ownership-checked via the same
 * shared helper used everywhere else.
 */
export const listEventsForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    await requireSessionOwner(ctx, sessionId);
    return await ctx.db
      .query("proctoringEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

/**
 * The ONLY function permitted to patch a `proctoringSessions` row, and it may
 * ONLY ever set `purgedAt`. Never touches ipAddress/consentText/consentVersion
 * or any other field — those remain exactly as recorded at consent time,
 * forever, since this table is the audit trail proving consent was given.
 */
export const markPurged = internalMutation({
  args: { proctoringSessionId: v.id("proctoringSessions") },
  handler: async (ctx, { proctoringSessionId }) => {
    await ctx.db.patch(proctoringSessionId, { purgedAt: Date.now() });
  },
});

/**
 * Internal mutation run by the daily cron (see convex/crons.ts).
 *
 * IMPORTANT: this NEVER deletes `proctoringSessions` rows — that table is the
 * permanent audit trail proving consent was given. It only deletes
 * `proctoringEvents` rows (and their snapshot blobs) for sessions whose
 * consent predates the 90-day retention window, then marks the session
 * `purgedAt` via `markPurged` (the single function allowed to patch that
 * table, and only that one field).
 */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_MS;

    const expiredConsents = await ctx.db
      .query("proctoringSessions")
      .filter((q) =>
        q.and(
          q.lt(q.field("createdAt"), cutoff),
          q.eq(q.field("purgedAt"), undefined)
        )
      )
      .collect();

    let deletedEvents = 0;

    for (const consent of expiredConsents) {
      const events = await ctx.db
        .query("proctoringEvents")
        .withIndex("by_session", (q) => q.eq("sessionId", consent.sessionId))
        .collect();

      for (const evt of events) {
        if (evt.storageId) {
          try {
            await ctx.storage.delete(evt.storageId);
          } catch {
            // Blob may already be gone; the event row should still be deleted.
          }
        }
        await ctx.db.delete(evt._id);
        deletedEvents++;
      }

      await ctx.runMutation(internal.proctoring.markPurged, {
        proctoringSessionId: consent._id,
      });
    }

    return {
      purgedConsentRecords: expiredConsents.length,
      deletedEvents,
    };
  },
});
