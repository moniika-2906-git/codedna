import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowLeft, History, MessageSquare } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { RequireRole } from "@/components/auth/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "../ScoreBadge";

const CandidateDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useQuery(
    api.sessions.getById,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  return (
    <RequireRole allowedRoles={["RECRUITER"]} redirectTo="/problems">
      <div className="container py-12">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {session === undefined ? (
          <Skeleton className="h-64 rounded-xl bg-zinc-900" />
        ) : session === null ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
            Session not found.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Card className="rounded-xl border-zinc-800 bg-zinc-900">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-zinc-100">
                    {session.user?.name ?? "Unknown candidate"}
                  </CardTitle>
                  <p className="mt-1 text-sm text-zinc-500">
                    {session.user?.email}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {session.problemName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <ScoreBadge score={session.score ?? 0} />
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
                  >
                    <Link to={`/replay/${sessionId}`}>
                      <History className="h-4 w-4" />
                      View Replay
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  Prompt History ({session.promptLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {session.promptLogs.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No AI interactions logged for this session.
                  </p>
                ) : (
                  session.promptLogs.map((log) => (
                    <div
                      key={log._id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-zinc-100">{log.prompt}</p>
                        <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-400">
                          {log.action}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-zinc-500">
                        {log.aiResponse}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-300">
                  Final Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
                  {session.code}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RequireRole>
  );
};

export default CandidateDetailPage;
