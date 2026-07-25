import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * CORS headers for the /proctoring/consent endpoint. The browser origin is
 * reflected back (rather than hardcoded) because this app is served from a
 * per-preview/per-deploy subdomain (e.g. Enter's live-preview.enterapp.pro
 * hosts) that isn't known ahead of time. `Vary: Origin` tells caches the
 * response differs per origin.
 */
function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    Vary: "Origin",
  };
}

/**
 * Handles the browser's automatic CORS preflight for POST /proctoring/consent
 * (triggered because the real request carries a JSON Content-Type and an
 * Authorization header). Without this, the browser blocks the actual POST
 * before it ever reaches the server, surfacing as "TypeError: Failed to
 * fetch" — the request never leaves the browser.
 */
http.route({
  path: "/proctoring/consent",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          ...corsHeaders(request),
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        }),
      });
    }
    return new Response();
  }),
});

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
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders(request),
      });
    }

    let body: { sessionId?: string; consentVersion?: string };
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", {
        status: 400,
        headers: corsHeaders(request),
      });
    }

    const { sessionId, consentVersion } = body;
    if (!sessionId || !consentVersion) {
      return new Response("Missing sessionId or consentVersion", {
        status: 400,
        headers: corsHeaders(request),
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
        { status: 400, headers: corsHeaders(request) }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(request),
      },
    });
  }),
});

export default http;
