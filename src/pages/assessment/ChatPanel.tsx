import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { Bot, Check, Loader2, Pencil, Send, User, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateMockAiResponse, type PromptAction } from "./mockAi";

interface ChatMessage {
  id: string;
  prompt: string;
  aiResponse: string;
  codeSnippet: string;
  classification: PromptAction | null;
}

interface ChatPanelProps {
  sessionId: Id<"sessions">;
  onInsertCode: (code: string) => void;
}

export const ChatPanel = ({ sessionId, onInsertCode }: ChatPanelProps) => {
  const logPrompt = useMutation(api.promptLogs.log);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      const { responseText, codeSnippet } = generateMockAiResponse(trimmed);

      await logPrompt({
        sessionId,
        prompt: trimmed,
        aiResponse: responseText,
        action: "ASKED",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          prompt: trimmed,
          aiResponse: responseText,
          codeSnippet,
          classification: null,
        },
      ]);
      setPrompt("");
    } finally {
      setIsSending(false);
    }
  };

  const handleClassify = async (
    message: ChatMessage,
    action: Exclude<PromptAction, "ASKED">
  ) => {
    await logPrompt({
      sessionId,
      prompt: message.prompt,
      aiResponse: message.aiResponse,
      action,
    });

    if (action === "ACCEPTED" || action === "MODIFIED") {
      onInsertCode(message.codeSnippet);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, classification: action } : m
      )
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Bot className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-medium text-zinc-200">AI Assistant</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">
            Ask the AI for help. Every prompt and how you use the response is
            tracked as part of your Engineering DNA score.
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <p className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
                {message.prompt}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                <p className="text-sm text-zinc-300">{message.aiResponse}</p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-900 p-2 font-mono text-xs text-zinc-400">
                  {message.codeSnippet}
                </pre>

                {message.classification ? (
                  <p className="mt-2 text-xs font-medium text-indigo-400">
                    Marked as {message.classification.toLowerCase()}
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleClassify(message, "ACCEPTED")}
                      className="h-7 gap-1 bg-emerald-500/10 px-2 text-xs text-emerald-400 hover:bg-emerald-500/20"
                      variant="ghost"
                    >
                      <Check className="h-3 w-3" />
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleClassify(message, "MODIFIED")}
                      className="h-7 gap-1 bg-indigo-500/10 px-2 text-xs text-indigo-400 hover:bg-indigo-500/20"
                      variant="ghost"
                    >
                      <Pencil className="h-3 w-3" />
                      Modify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleClassify(message, "REJECTED")}
                      className="h-7 gap-1 bg-red-500/10 px-2 text-xs text-red-400 hover:bg-red-500/20"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-zinc-800 p-3"
      >
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Ask the AI for a hint or a solution..."
          className="min-h-[44px] flex-1 resize-none border-zinc-800 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSending || !prompt.trim()}
          className={cn("shrink-0 bg-indigo-500 text-zinc-50 hover:bg-indigo-400")}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
