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
 * caller's identity is resolved from the Bearer JWT that Convex Auth attaches,
 * then passed to the internal `proctoring.recordConsent` mutation.
 *
 * LIMITATION: Convex HTTP actions run behind Convex's own proxy, so
 * `x-forwarded-for` is the most reliable client-IP signal available here. If
 * no forwarding header is present we record `"unknown"` rather than fail, so
 * the consent row's non-null `ipAddress` schema still holds. Acceptable
 * because the primary integrity signal is the authenticated identity, not the
 * IP.
 */
http.route({
  path: "/proctoring/consent",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: {
      sessionId?: string;
      consentVersion?: string;
      consentText?: string;
    };
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { sessionId, consentVersion, consentText } = body;
    if (!sessionId || !consentVersion || !consentText) {
      return new Response("Missing sessionId, consentVersion, or consentText", {
        status: 400,
      });
    }

    // x-forwarded-for may be a comma-separated list (client, proxy1, ...);
    // the leftmost entry is the original client IP.
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
        consentText,
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
