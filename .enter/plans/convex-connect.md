# Connect Vite + React app to existing Convex backend

## Context
The project needs to talk to an already-existing Convex deployment (`https://lovely-boar-392.eu-west-1.convex.cloud`). No new Convex project/schema should be created — only the frontend client wiring. Auth will use `@convex-dev/auth` (Password provider) once the user's `convex/` folder (schema.ts, auth.ts, problems.ts, sessions.ts, promptLogs.ts, users.ts) is provided.

Decisions confirmed with user:
- Convex URL is not a secret → hardcode it as a fallback constant (Enter's hosted build pipeline doesn't reliably inject custom `VITE_*` vars), while still supporting `.env.local` for local dev.
- Install `@convex-dev/auth` now and use `ConvexAuthProvider` from the start, since the incoming `convex/auth.ts` uses the Password provider.

## Changes

1. **Dependencies**: add `convex` and `@convex-dev/auth` npm packages.
2. **`.env.local`** (new file): `VITE_CONVEX_URL=https://lovely-boar-392.eu-west-1.convex.cloud`
3. **`src/lib/convexClient.ts`** (new file): create and export a single `ConvexReactClient` instance, reading `import.meta.env.VITE_CONVEX_URL` with the literal URL as fallback so it survives Enter's build/publish pipeline.
4. **`src/env.d.ts`**: add `VITE_CONVEX_URL?: string` to `ImportMetaEnv` for typing.
5. **`src/App.tsx`**: since `src/main.tsx` is a platform-protected file and cannot be edited, wrap the router tree in `<ConvexAuthProvider client={convex}>` inside `App.tsx` (outermost provider, above `QueryClientProvider`).
6. No `convex/` folder is created/scaffolded now — that will be added once the user shares their existing files (schema.ts, auth.ts, problems.ts, sessions.ts, promptLogs.ts, users.ts) verbatim into `convex/`.

## Verification
- `pnpm dev` / preview loads without runtime errors (ConvexAuthProvider mounts, no missing-URL exceptions).
- Confirm in browser console there are no Convex connection errors (client will attempt a websocket connection to the given URL even with no schema yet).
- Once the user provides the `convex/` folder, a follow-up step will run `npx convex dev`/deploy-related typegen as needed and verify `useQuery`/`useMutation` type-check against the real schema.

## Out of scope
- No new Convex schema, functions, or project creation.
- No auth UI/pages built yet — only provider wiring.
