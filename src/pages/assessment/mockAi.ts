export type PromptAction = "ASKED" | "ACCEPTED" | "REJECTED" | "MODIFIED";

export interface MockAiResult {
  responseText: string;
  codeSnippet: string;
}

/**
 * Produces a deterministic, canned "AI" suggestion for a given prompt.
 * This stands in for a real AI call — swap this out once an AI provider
 * is wired up via an Edge Function.
 */
export const generateMockAiResponse = (prompt: string): MockAiResult => {
  const trimmed = prompt.trim();
  const responseText = trimmed
    ? `Here's a suggestion based on: "${trimmed}"`
    : "Here's a suggestion to help you get started.";

  const codeSnippet = [
    `// AI suggestion for: ${trimmed || "your prompt"}`,
    "// Review this suggestion before accepting it into your solution.",
    "function aiSuggestion(input) {",
    "  // TODO: adapt this to your actual problem logic",
    "  return input;",
    "}",
  ].join("\n");

  return { responseText, codeSnippet };
};
