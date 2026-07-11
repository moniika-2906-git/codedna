import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("STUDENT"), v.literal("RECRUITER"), v.literal("ADMIN")),
  }).index("by_email", ["email"]),

  problems: defineTable({
    title: v.string(),
    difficulty: v.union(v.literal("EASY"), v.literal("MEDIUM"), v.literal("HARD")),
    description: v.string(),
    exampleInput: v.string(),
    exampleOutput: v.string(),
    starterCode: v.string(),
  }),

  sessions: defineTable({
    userId: v.id("users"),
    problemId: v.optional(v.id("problems")),
    problemName: v.string(),
    code: v.string(),
    score: v.optional(v.number()),
    startedAt: v.number(),
    submittedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  promptLogs: defineTable({
    sessionId: v.id("sessions"),
    prompt: v.string(),
    aiResponse: v.string(),
    action: v.union(
      v.literal("ASKED"),
      v.literal("ACCEPTED"),
      v.literal("REJECTED"),
      v.literal("MODIFIED")
    ),
  }).index("by_session", ["sessionId"]),
});