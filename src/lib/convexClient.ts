import { ConvexReactClient } from "convex/react";

// Enter's hosted build/publish pipeline does not reliably inject custom
// VITE_* environment variables, so the (non-secret) Convex deployment URL
// is hardcoded here as a fallback. Local `.env.local` still works for
// `pnpm dev` if VITE_CONVEX_URL is set there.
const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL ??
  "https://lovely-boar-392.eu-west-1.convex.cloud";

// Base URL for Convex HTTP actions (served from the same deployment as the
// websocket client). Used by the consent screen to POST to /proctoring/consent.
export const CONVEX_SITE_URL = CONVEX_URL;

export const convex = new ConvexReactClient(CONVEX_URL);
