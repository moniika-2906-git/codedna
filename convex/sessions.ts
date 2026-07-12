import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ACTION_WEIGHTS: Record<string, number> = {
  MODIFIED: 10,
  REJECTED: 8,
  ACCEPTED: 3,
  ASKED: 1,
};

// Starts a new assessment session for a specific problem, tied to the
// currently logged-in (authenticated) user.
export const create = mutation({
  args: { problemId: v.id("problems") },
  handler: async (ctx, { problemId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const problem = await ctx.db.get(problemId);
    if (!problem) throw new Error("Problem not found");

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      problemId,
      problemName: problem.title,
      code: problem.starterCode,
      startedAt: Date.now(),
    });

    return sessionId;
  },
});

// Fetches a session with its user and full prompt log history — used by replay/candidate detail pages.
export const getById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return null;

    const user = await ctx.db.get(session.userId);
    const promptLogs = await ctx.db
      .query("promptLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();

    return { ...session, user, promptLogs };
  },
});

// Lists all submitted sessions with candidate + problem info — used by the recruiter dashboard.
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.neq(q.field("submittedAt"), undefined))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        const promptLogs = await ctx.db
          .query("promptLogs")
          .withIndex("by_session", (q) => q.eq("sessionId", s._id))
          .collect();
        return {
          ...s,
          candidateName: user?.name ?? "Unknown",
          candidateEmail: user?.email ?? "",
          totalPrompts: promptLogs.length,
        };
      })
    );

    return enriched;
  },
});

// Calculates the AI Collaboration Score from prompt logs and saves the final code + score.
export const submitScore = mutation({
  args: { sessionId: v.id("sessions"), code: v.string() },
  handler: async (ctx, { sessionId, code }) => {
    const logs = await ctx.db
      .query("promptLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    const breakdown: Record<string, number> = {
      ASKED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      MODIFIED: 0,
    };

    let score: number;
    let label: string;

    if (logs.length === 0) {
      score = 100;
      label = "No AI assistance used — fully independent";
    } else {
      let totalWeight = 0;
      for (const log of logs) {
        breakdown[log.action] = (breakdown[log.action] || 0) + 1;
        totalWeight += ACTION_WEIGHTS[log.action] ?? 0;
      }
      const maxPossible = logs.length * ACTION_WEIGHTS.MODIFIED;
      score = Math.round((totalWeight / maxPossible) * 100);

      label = "Balanced AI collaboration";
      if (score >= 80) label = "Strong independent problem-solving with smart AI use";
      else if (score <= 40) label = "Heavy reliance on AI suggestions";
    }

    await ctx.db.patch(sessionId, {
      code,
      score,
      submittedAt: Date.now(),
    });

    return { score, totalPrompts: logs.length, breakdown, label, sessionId };
  },
});