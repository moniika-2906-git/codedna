# Proctoring module for the assessment flow

## Context
`/assessment/:sessionId` currently has no integrity/anti-cheat layer. This adds consent-gated webcam/mic proctoring: a standalone consent screen, camera-based face-count monitoring (via face-api.js TinyFaceDetector), tab/fullscreen-exit detection, and audio-spike detection — each anomaly logged as an immutable event, with snapshots uploaded to Convex file storage. A daily cron purges data older than 90 days per the stated retention policy.

Decisions confirmed with user:
- **IP capture**: add a Convex **HTTP action** (`convex/http.ts` route) that reads the caller's IP from request headers server-side and writes the consent record — client cannot spoof this.
- **Face model hosting**: download the TinyFaceDetector weight files now and self-host under `public/models/` (no runtime CDN dependency).
- **Retention**: build a real Convex **cron job** (`crons.ts`, daily) that deletes `proctoring_events` (+ their storage snapshots) and can also purge `proctoring_sessions` older than 90 days.
- **Camera UX**: show a small persistent webcam thumbnail in the assessment UI while proctoring is active (transparency + confirms the feed is live).

## Schema changes (`convex/schema.ts`)
Add two new tables (existing tables/fields untouched):

```ts
proctoringSessions: defineTable({
  sessionId: v.id("sessions"),
  userId: v.id("users"),
  consentedAt: v.number(),
  ipAddress: v.string(),
  consentVersion: v.string(),   // e.g. "v1"
  consentText: v.string(),      // exact text shown at consent time
}).index("by_session", ["sessionId"]),

proctoringEvents: defineTable({
  sessionId: v.id("sessions"),
  eventType: v.union(
    v.literal("NO_FACE"),
    v.literal("MULTIPLE_FACES"),
    v.literal("TAB_SWITCH"),
    v.literal("FULLSCREEN_EXIT"),
    v.literal("AUDIO_ANOMALY"),
  ),
  severity: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
  timestamp: v.number(),
  snapshotStorageId: v.optional(v.id("_storage")),
  snapshotUrl: v.optional(v.string()),
}).index("by_session", ["sessionId"]),
```

Table names use camelCase to match existing convention (`promptLogs`, not `prompt_logs`).

## New backend files

**`convex/proctoring.ts`**
- `recordConsent` — **internalMutation** (called only from the HTTP action, not directly from the client) — args: `sessionId, ipAddress, consentVersion, consentText`; resolves `userId` via `getAuthUserId`-style session check passed from the action; inserts into `proctoringSessions`. Immutable: no update/patch function is ever exposed for this table.
- `hasConsented` — query, args `{ sessionId }`, returns boolean — used to gate camera/mic requests client-side.
- `generateSnapshotUploadUrl` — mutation, returns `ctx.storage.generateUploadUrl()` (auth-required).
- `logEvent` — mutation, args `{ sessionId, eventType, severity, snapshotStorageId? }`; resolves `snapshotUrl` via `ctx.storage.getUrl` when a storage id is given; inserts into `proctoringEvents`.
- `listEventsForSession` — query, args `{ sessionId }`, ordered by timestamp — for recruiter visibility (not wired into UI this task, but exposed for the dashboard/replay pages to use later).

**`convex/http.ts`** (extend existing file)
- Add `POST /proctoring/consent` HTTP action: reads `request.headers.get("x-forwarded-for")` (fallback to a placeholder if absent, since Convex HTTP actions run behind their own proxy — document this limitation in a code comment), authenticates the caller via the bearer token Convex Auth attaches, then calls `internal.proctoring.recordConsent` with the resolved `userId`, sessionId (from JSON body), consentVersion, and consentText.

**`convex/crons.ts`** (new)
- `cronJobs()` with a **daily** job `purge-old-proctoring-data` that calls an internal mutation `internal.proctoring.purgeExpired` which deletes `proctoringEvents` (and their `_storage` snapshot blobs via `ctx.storage.delete`) and `proctoringSessions` rows where the relevant timestamp is older than `Date.now() - 90 * 24 * 60 * 60 * 1000`.
- Register `crons` export; add `purgeExpired` internalMutation in `convex/proctoring.ts`.

## Frontend: consent screen

**`src/pages/consent/index.tsx`** (new route `/consent/:sessionId`)
- Full-screen centered card (same visual pattern as `/auth`), listing explicit bullet points: "We will access your camera", "We will access your microphone", "We will capture periodic snapshots during your session", "Data is retained for 90 days then deleted".
- Renders `CONSENT_TEXT` (a versioned constant, `CONSENT_VERSION = "v1"`) verbatim so the exact shown text can be logged.
- Checkbox ("I have read and agree...") gates an enabled "Continue" button.
- On submit: POST to the new HTTP action endpoint (`${convexSiteUrl}/proctoring/consent`) with the JWT (via `useAuthToken()`) in the Authorization header, sessionId, consentVersion, consentText.
- On success, navigate to `/assessment/:sessionId`.
- `RequireRole allowedRoles={["STUDENT"]}` guard, same as other student pages.

Update `/problems` `ProblemCard.tsx`: after `sessions.create` succeeds, navigate to `/consent/:sessionId` instead of `/assessment/:sessionId` directly (assessment becomes reachable only after consent).

`AssessmentPage` (`src/pages/assessment/index.tsx`) gains a guard: on mount, check `api.proctoring.hasConsented({ sessionId })`; if `false`, redirect to `/consent/:sessionId`. This protects direct URL access without consent.

## Frontend: proctoring runtime (active during assessment)

**`src/pages/assessment/proctoring/useProctoring.ts`** (new hook, mounted inside `AssessmentPage` once consent is confirmed)
Responsibilities, composed from smaller single-purpose hooks in the same folder:
- `useMediaStream.ts` — calls `navigator.mediaDevices.getUserMedia({ video: true, audio: true })` once; exposes the `MediaStream`, an error state (permission denied), and a cleanup on unmount (`track.stop()`).
- `useFaceMonitor.ts` — loads face-api.js models once from `/models/` (`faceapi.nets.tinyFaceDetector.loadFromUri("/models")`), then every 5s runs `detectAllFaces` on a hidden `<video>` element wired to the stream; on `count === 0` → logs `NO_FACE` (severity LOW), on `count >= 2` → logs `MULTIPLE_FACES` (severity HIGH); on any anomaly, draws the current video frame to an offscreen `<canvas>`, converts to a Blob, uploads via `generateSnapshotUploadUrl` + `fetch(POST)`, then calls `logEvent` with the resulting storage id.
- `useVisibilityMonitor.ts` — `document.addEventListener("visibilitychange", ...)`; when `document.hidden`, logs `TAB_SWITCH` (severity MEDIUM, no snapshot).
- `useFullscreenMonitor.ts` — `document.addEventListener("fullscreenchange", ...)`; when `document.fullscreenElement` becomes falsy (and proctoring is active), logs `FULLSCREEN_EXIT` (severity MEDIUM, no snapshot).
- `useAudioMonitor.ts` — Web Audio API: `AudioContext` + `AnalyserNode` fed by the mic track; polls RMS volume via `requestAnimationFrame`; if volume stays above a threshold for a sustained window (e.g. >1.5s continuously above threshold, debounced to avoid duplicate events), logs `AUDIO_ANOMALY` (severity LOW, no snapshot).

All five sub-hooks share one `logEvent` mutation call and one `generateSnapshotUploadUrl` mutation, passed down from `useProctoring`.

**`src/pages/assessment/proctoring/WebcamThumbnail.tsx`** — small fixed-position (bottom-right) `<video>` element bound to the camera stream, muted, autoplay, rounded corner per design system, with a small "Recording" indicator dot.

**`src/pages/assessment/proctoring/PermissionGate.tsx`** — if `getUserMedia` fails/is denied, shows a dark-themed blocking card explaining camera/mic access is required to continue the assessment, with a "Try Again" button.

Wire into `AssessmentPage`: once `hasConsented` is confirmed true, mount `useProctoring(sessionId)`; render `<WebcamThumbnail stream={...} />` over the workspace; if permission denied, render `<PermissionGate onRetry={...} />` instead of the editor.

## Dependencies
- `add_dependency("face-api.js")`
- Download 1 file into the repo: `public/models/tiny_face_detector_model-weights_manifest.json` and `public/models/tiny_face_detector_model-shard1` (binary) — fetched from the official face-api.js GitHub repo (MIT licensed) via `bash`/`curl` during implementation, not through `add_dependency`.

## Deployment
After implementation, push the updated `convex/` folder (schema + new files) to the existing deployment using the previously-provided deploy key, then run codegen so `api.proctoring.*` and `internal.proctoring.*` typecheck.

## Implementation checklist
- [ ] `convex/schema.ts`: add `proctoringSessions` and `proctoringEvents` tables with indexes, no changes to existing tables
- [ ] `convex/proctoring.ts`: `recordConsent` (internalMutation), `hasConsented` (query), `generateSnapshotUploadUrl` (mutation), `logEvent` (mutation), `listEventsForSession` (query), `purgeExpired` (internalMutation)
- [ ] `convex/http.ts`: add `POST /proctoring/consent` HTTP action reading IP from headers, authenticating via bearer token, calling `internal.proctoring.recordConsent`
- [ ] `convex/crons.ts`: new file, daily cron calling `internal.proctoring.purgeExpired`, registered as default export
- [ ] Download and commit `public/models/tiny_face_detector_model-weights_manifest.json` + shard file
- [ ] `add_dependency("face-api.js")`
- [ ] `src/pages/consent/index.tsx`: consent screen with explicit camera/mic/snapshot/90-day bullets, versioned consent text constant, checkbox-gated Continue button, POSTs to HTTP action with JWT, `RequireRole STUDENT` guard
- [ ] `src/router.tsx`: register `/consent/:sessionId` route
- [ ] `src/pages/problems/ProblemCard.tsx`: navigate to `/consent/:sessionId` instead of `/assessment/:sessionId` after `sessions.create`
- [ ] `src/pages/assessment/index.tsx`: check `hasConsented` on mount; redirect to `/consent/:sessionId` if false; mount proctoring hook + thumbnail once consented
- [ ] `src/pages/assessment/proctoring/useMediaStream.ts`: getUserMedia wrapper with permission-error state and cleanup
- [ ] `src/pages/assessment/proctoring/useFaceMonitor.ts`: loads TinyFaceDetector from `/models`, runs every 5s, logs NO_FACE/MULTIPLE_FACES with snapshot upload
- [ ] `src/pages/assessment/proctoring/useVisibilityMonitor.ts`: logs TAB_SWITCH on `visibilitychange`
- [ ] `src/pages/assessment/proctoring/useFullscreenMonitor.ts`: logs FULLSCREEN_EXIT on `fullscreenchange`
- [ ] `src/pages/assessment/proctoring/useAudioMonitor.ts`: AnalyserNode-based sustained volume spike detection, logs AUDIO_ANOMALY
- [ ] `src/pages/assessment/proctoring/useProctoring.ts`: composes the above, exposes stream + permission state to the page
- [ ] `src/pages/assessment/proctoring/WebcamThumbnail.tsx`: persistent bottom-right video preview with recording indicator
- [ ] `src/pages/assessment/proctoring/PermissionGate.tsx`: blocking dark-themed card when camera/mic denied
- [ ] Deploy updated `convex/` folder to the existing deployment; run codegen

## Verification checklist
- [ ] Consent screen cannot be bypassed: Continue button stays disabled until checkbox is checked
- [ ] Submitting consent creates exactly one `proctoringSessions` row with a non-placeholder IP, correct `consentVersion`, and `consentText` matching what was rendered
- [ ] No update/delete mutation exists for `proctoringSessions` (immutability) — only insert via `recordConsent` and delete via the cron's `purgeExpired`
- [ ] Direct navigation to `/assessment/:sessionId` without prior consent redirects to `/consent/:sessionId`
- [ ] Denying camera/mic permission shows `PermissionGate` and does not silently continue the assessment
- [ ] Simulated 0-face and 2-face conditions each produce one `proctoringEvents` row with correct `eventType`/`severity` and a resolvable `snapshotUrl`
- [ ] Switching browser tabs during an active session logs exactly one `TAB_SWITCH` event per switch (no duplicate spam on rapid toggling)
- [ ] Exiting fullscreen logs one `FULLSCREEN_EXIT` event
- [ ] A sustained loud audio input logs `AUDIO_ANOMALY`; brief transient noise does not
- [ ] `purgeExpired` deletes events/sessions older than 90 days and leaves newer rows untouched (verify via direct mutation call with a manually inserted old row, or by reasoning through the timestamp filter)
- [ ] `pnpm lint` passes with no new errors
- [ ] Full flow smoke-tested against the live Convex deployment end-to-end (consent → assessment loads → at least one event type logs successfully)
