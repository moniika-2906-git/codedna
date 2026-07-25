import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * POST /proctoring/consent
 *
 * Records the authenticated student's proctoring consent. The caller's IP is
 * read server-side from request headers (the client cannot spoof it) and the
 * caller's identity is resolved from the Bearer JWT that Convex Auth attaches
 * to this httpAction's `ctx.auth` — confirmed working via `getAuthUserId(ctx)`
 * inside this httpAction with the client sending
 * `Authorization: Bearer <useAuthToken()>` (see @convex-dev/auth docs: HTTP
 * actions get `ctx.auth.getUserIdentity()` populated from that header).
 *
 * The client sends ONLY `consentVersion` — never consent text. The exact
 * text is resolved server-side in `proctoring.recordConsent` from a canonical
 * version→text table, so a tampered client payload can never be persisted as
 * if it were what the user actually saw.
 */
http.route({
  path: "/proctoring/consent",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: { sessionId?: string; consentVersion?: string };
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { sessionId, consentVersion } = body;
    if (!sessionId || !consentVersion) {
      return new Response("Missing sessionId or consentVersion", {
        status: 400,
      });
    }

    // x-forwarded-for is often a comma-separated proxy chain
    // ("client, proxy1, proxy2, ..."); the leftmost entry is the original
    // client IP. Fall back to x-real-ip, then a placeholder if both are
    // absent (e.g. local dev without a proxy in front of Convex).
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") ?? "unknown";

    try {
      await ctx.runMutation(internal.proctoring.recordConsent, {
        sessionId: sessionId as Id<"sessions">,
        userId,
        ipAddress,
        consentVersion,
      });
    } catch (err) {
      return new Response(
        err instanceof Error ? err.message : "Failed to record consent",
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
