"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildPrompt(prompt: string, code: string) {
  return `You are a helpful coding assistant inside a coding assessment platform. The candidate's current code is:\n\n${code}\n\nThe candidate asks: ${prompt}\n\nGive a concise, helpful response (max 4-5 lines). If suggesting code, keep it short.`;
}

async function askGemini(prompt: string, code: string) {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(prompt, code) }] }],
    }),
  });
  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate a response."
  );
}

async function askGroq(prompt: string, code: string) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildPrompt(prompt, code) }],
    }),
  });
  const data = await res.json();
  return (
    data?.choices?.[0]?.message?.content ||
    "Sorry, I couldn't generate a response."
  );
}

export const ask = action({
  args: {
    prompt: v.string(),
    code: v.string(),
    agent: v.union(
      v.literal("gemini"),
      v.literal("groq"),
      v.literal("claude"),
      v.literal("chatgpt")
    ),
  },
  handler: async (ctx, { prompt, code, agent }) => {
    if (agent === "gemini") return askGemini(prompt, code);
    if (agent === "groq") return askGroq(prompt, code);

    // Claude and ChatGPT are architecturally supported (same pattern as
    // above) but not yet enabled — kept honest for demo purposes since
    // they require funded API credits rather than a free tier.
    return "This agent will be enabled after we secure API credits post-selection. Try Gemini or Groq for a live response.";
  },
});