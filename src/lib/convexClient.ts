import { ConvexReactClient } from "convex/react";

// Enter's hosted build/publish pipeline does not reliably inject custom
// VITE_* environment variables, so the (non-secret) Convex deployment URL
// is hardcoded here as a fallback. Local `.env.local` still works for
// `pnpm dev` if VITE_CONVEX_URL is set there.
const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL ??
  "https://lovely-boar-392.eu-west-1.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
