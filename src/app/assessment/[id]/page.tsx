"use client";

import { useState, useEffect, use } from "react";
import Editor from "@monaco-editor/react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type ChatMessage = {
  prompt: string;
  response: string;
  action: "ASKED" | "ACCEPTED" | "REJECTED" | "MODIFIED";
  logId: Id<"promptLogs"> | null;
};

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const problemId = id as Id<"problems">;

  const problem = useQuery(api.problems.getById, { problemId });

  const [code, setCode] = useState("");
  const [codeInitialized, setCodeInitialized] = useState(false);
  const [output, setOutput] = useState("Run your code to see output here.");
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<"gemini" | "groq" | "claude" | "chatgpt">("gemini");
  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [scoreResult, setScoreResult] = useState<{
    score: number;
    totalPrompts: number;
    breakdown: Record<string, number>;
    label: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createSession = useMutation(api.sessions.create);
  const logPrompt = useMutation(api.promptLogs.log);
  const submitScore = useMutation(api.sessions.submitScore);
  const askAI = useAction(api.ai.ask);

  // Once the problem loads, seed the editor with its starter code
  useEffect(() => {
    if (problem && !codeInitialized) {
      setCode(problem.starterCode);
      setCodeInitialized(true);
    }
  }, [problem, codeInitialized]);

  // Create a session tied to this specific problem
  useEffect(() => {
    if (!problem) return;
    createSession({ problemId })
      .then((sid) => setSessionId(sid))
      .catch(() => console.error("Could not create session"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  async function handleRun() {
    if (selectedLanguage !== "javascript") {
      setOutput(
        `${selectedLanguage.toUpperCase()} execution is coming soon — this language will be enabled after we secure execution infrastructure post-selection. Try JavaScript for a live run.`
      );
      return;
    }

    setLoading(true);
    setOutput("Running...");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("sandbox", "allow-scripts");
    document.body.appendChild(iframe);

    const resultPromise = new Promise<string>((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data?.source === "codedna-sandbox") {
          window.removeEventListener("message", handler);
          resolve(event.data.output);
        }
      };
      window.addEventListener("message", handler);

      const sandboxScript = `
        <script>
          const logs = [];
          const send = () => parent.postMessage({ source: "codedna-sandbox", output: logs.join("\\n") || "No output printed. Did you call your function with console.log(yourFunction(...))? Defining a function alone won't print anything." }, "*");
          console.log = (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
          try {
            ${code}
          } catch (err) {
            logs.push("Error: " + err.message);
          }
          send();
        </script>
      `;
      iframe.srcdoc = sandboxScript;

      setTimeout(() => resolve("Error: Execution timed out (possible infinite loop)"), 5000);
    });

    const result = await resultPromise;
    setOutput(`Status: Success\n\nOutput:\n${result}`);
    document.body.removeChild(iframe);
    setLoading(false);
  }

  async function handleAskAI() {
    if (!aiPrompt.trim() || !sessionId) return;
    setAiLoading(true);
    try {
      const response = await askAI({ prompt: aiPrompt, code, agent: selectedAgent });

      const logId = await logPrompt({
        sessionId,
        prompt: aiPrompt,
        aiResponse: response,
        action: "ASKED",
      });

      setChatHistory((prev) => [
        ...prev,
        { prompt: aiPrompt, response, action: "ASKED", logId },
      ]);
      setAiPrompt("");
    } catch {
      console.error("AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleFeedback(index: number, action: "ACCEPTED" | "REJECTED") {
    const msg = chatHistory[index];
    if (!sessionId) return;

    setChatHistory((prev) =>
      prev.map((m, i) => (i === index ? { ...m, action } : m))
    );

    await logPrompt({
      sessionId,
      prompt: msg.prompt,
      aiResponse: msg.response,
      action,
    });
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const data = await submitScore({ sessionId, code });
      setScoreResult(data);
    } catch {
      console.error("Score submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (problem === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading problem...
      </div>
    );
  }

  if (problem === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Score Overlay */}
      {scoreResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
            <p className="text-sm text-gray-400 mb-2">AI Collaboration Score</p>
            <div className="text-6xl font-extrabold text-purple-400 mb-4">
              {scoreResult.score}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className="text-gray-300 mb-6">{scoreResult.label}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500">Total Prompts</div>
                <div className="text-lg font-bold">{scoreResult.totalPrompts}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500">Modified</div>
                <div className="text-lg font-bold">{scoreResult.breakdown.MODIFIED || 0}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500">Rejected</div>
                <div className="text-lg font-bold">{scoreResult.breakdown.REJECTED || 0}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500">Accepted</div>
                <div className="text-lg font-bold">{scoreResult.breakdown.ACCEPTED || 0}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`/replay/${sessionId}`}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-medium transition text-center"
              >
                View Replay
              </a>
              <button
                onClick={() => setScoreResult(null)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Statement Panel */}
      <div className="w-1/4 border-r border-gray-800 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{problem.title}</h2>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 px-3 py-1.5 rounded-lg font-medium transition"
          >
            {submitting ? "Scoring..." : "Submit"}
          </button>
        </div>
        <p className="text-gray-400 mb-4 text-sm">{problem.description}</p>
        <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300">
          <p className="mb-2">Example:</p>
          <pre className="whitespace-pre-wrap">{`Input: ${problem.exampleInput}\nOutput: ${problem.exampleOutput}`}</pre>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="w-1/2 flex flex-col border-r border-gray-800">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as typeof selectedLanguage)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python (coming soon)</option>
            <option value="java">Java (coming soon)</option>
            <option value="cpp">C++ (coming soon)</option>
          </select>
          <button
            onClick={handleRun}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>

        <div className="flex-1">
          <Editor
            height="60%"
            language={selectedLanguage === "cpp" ? "cpp" : selectedLanguage}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
          <div className="h-[40%] bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">OUTPUT</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <div className="w-1/4 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800">
          <span className="text-sm font-medium block mb-2">Ask AI</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value as typeof selectedAgent)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200"
          >
            <option value="gemini">Gemini</option>
            <option value="groq">Groq (Llama 3.3)</option>
            <option value="claude">Claude (coming soon)</option>
            <option value="chatgpt">ChatGPT (coming soon)</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <p className="text-gray-500 text-sm">
              Ask the AI for hints or help — every interaction is tracked.
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 text-sm">
              <p className="text-purple-400 mb-1 font-medium">You: {msg.prompt}</p>
              <p className="text-gray-300 mb-2 whitespace-pre-wrap">{msg.response}</p>
              {msg.action === "ASKED" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(i, "ACCEPTED")}
                    className="text-xs bg-green-700 hover:bg-green-600 px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFeedback(i, "REJECTED")}
                    className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    msg.action === "ACCEPTED"
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {msg.action}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask for a hint..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm resize-none mb-2"
            rows={2}
          />
          <button
            onClick={handleAskAI}
            disabled={aiLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-2 rounded-lg text-sm font-medium transition"
          >
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );
}