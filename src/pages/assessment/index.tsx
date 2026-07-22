import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProblemPanel } from "./ProblemPanel";
import { CodeEditor } from "./CodeEditor";
import { ChatPanel } from "./ChatPanel";
import { SessionTimer } from "./SessionTimer";
import { SubmissionResult } from "./SubmissionResult";

const AssessmentPage = () => {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const sessionId = sessionIdParam as Id<"sessions"> | undefined;

  const session = useQuery(
    api.sessions.getById,
    sessionId ? { sessionId } : "skip"
  );
  const problem = useQuery(
    api.problems.getById,
    session?.problemId ? { problemId: session.problemId } : "skip"
  );
  const submitScore = useMutation(api.sessions.submitScore);

  const [code, setCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    label: string;
    totalPrompts: number;
  } | null>(null);

  // Initialize the editor with the session's saved code once it loads.
  useEffect(() => {
    if (session && code === null) {
      setCode(session.code);
    }
  }, [session, code]);

  const handleSubmit = async () => {
    if (!sessionId || code === null || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await submitScore({ sessionId, code });
      setResult({
        score: res.score,
        label: res.label,
        totalPrompts: res.totalPrompts,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireRole allowedRoles={["STUDENT"]} redirectTo="/dashboard">
      {result ? (
        <SubmissionResult
          score={result.score}
          label={result.label}
          totalPrompts={result.totalPrompts}
          onBackToProblems={() => navigate("/problems")}
        />
      ) : session === undefined || problem === undefined || code === null ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : session === null || problem === null ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-zinc-400">
          Session or problem not found.
        </div>
      ) : (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <p className="text-sm font-medium text-zinc-300">
              {problem.title}
            </p>
            <div className="flex items-center gap-3">
              <SessionTimer startedAt={session.startedAt} />
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1.5 bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Submit
              </Button>
            </div>
          </div>

          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={35} minSize={25}>
              <ProblemPanel problem={problem} />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-zinc-800" />
            <ResizablePanel defaultSize={40} minSize={25}>
              <div className="h-full p-3">
                <CodeEditor value={code} onChange={setCode} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-zinc-800" />
            <ResizablePanel defaultSize={25} minSize={20}>
              <ChatPanel
                sessionId={sessionId as Id<"sessions">}
                onInsertCode={(snippet) =>
                  setCode((prev) => `${prev ?? ""}\n\n${snippet}`)
                }
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </RequireRole>
  );
};

export default AssessmentPage;
