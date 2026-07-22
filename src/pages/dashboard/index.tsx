import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Award, TrendingUp, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { RequireRole } from "@/components/auth/RequireRole";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./StatCard";
import { CandidateTable } from "./CandidateTable";

const DashboardPage = () => {
  const submissions = useQuery(api.sessions.listAll);

  const stats = useMemo(() => {
    if (!submissions) return null;

    const uniqueCandidates = new Set(submissions.map((s) => s.userId)).size;
    const scores = submissions
      .map((s) => s.score)
      .filter((score): score is number => typeof score === "number");
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
    const strongPerformers = scores.filter((score) => score >= 80).length;

    return { uniqueCandidates, averageScore, strongPerformers };
  }, [submissions]);

  return (
    <RequireRole allowedRoles={["RECRUITER"]} redirectTo="/problems">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-1 text-zinc-400">
            Review candidate submissions and Engineering DNA scores.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats === null ? (
            <>
              <Skeleton className="h-28 rounded-xl bg-zinc-900" />
              <Skeleton className="h-28 rounded-xl bg-zinc-900" />
              <Skeleton className="h-28 rounded-xl bg-zinc-900" />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Total Candidates"
                value={String(stats.uniqueCandidates)}
              />
              <StatCard
                icon={TrendingUp}
                label="Average Score"
                value={String(stats.averageScore)}
              />
              <StatCard
                icon={Award}
                label="Strong Performers"
                value={String(stats.strongPerformers)}
              />
            </>
          )}
        </div>

        {submissions === undefined ? (
          <Skeleton className="h-64 rounded-xl bg-zinc-900" />
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
            No submissions yet.
          </div>
        ) : (
          <CandidateTable submissions={submissions} />
        )}
      </div>
    </RequireRole>
  );
};

export default DashboardPage;
