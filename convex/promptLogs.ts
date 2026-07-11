import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    sessionId: v.id("sessions"),
    prompt: v.string(),
    aiResponse: v.string(),
    action: v.union(
      v.literal("ASKED"),
      v.literal("ACCEPTED"),
      v.literal("REJECTED"),
      v.literal("MODIFIED")
    ),
  },
  handler: async (ctx, { sessionId, prompt, aiResponse, action }) => {
    const logId = await ctx.db.insert("promptLogs", {
      sessionId,
      prompt,
      aiResponse,
      action,
    });
    return logId;
  },
});