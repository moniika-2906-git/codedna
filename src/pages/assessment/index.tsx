import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { RequireRole } from "@/components/auth/RequireRole";
import { Loader2 } from "lucide-react";

/**
 * Placeholder assessment screen. The full code editor / AI collaboration
 * workspace is out of scope for this task — this just confirms a session
 * was created correctly and is reachable by ID.
 */
const AssessmentPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useQuery(
    api.sessions.getById,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  return (
    <RequireRole allowedRoles={["STUDENT"]} redirectTo="/dashboard">
      <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 text-center">
        {session === undefined ? (
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        ) : session === null ? (
          <p className="text-zinc-400">Session not found.</p>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
            <h1 className="text-xl font-semibold text-zinc-100">
              {session.problemName}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Session started. The assessment workspace is coming soon.
            </p>
          </div>
        )}
      </div>
    </RequireRole>
  );
};

export default AssessmentPage;
