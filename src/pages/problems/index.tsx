import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { RequireRole } from "@/components/auth/RequireRole";
import { ProblemCard } from "./ProblemCard";
import { ProblemCardSkeleton } from "./ProblemCardSkeleton";

const ProblemsPage = () => {
  const problems = useQuery(api.problems.list);

  return (
    <RequireRole allowedRoles={["STUDENT"]} redirectTo="/dashboard">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Problems
          </h1>
          <p className="mt-1 text-zinc-400">
            Pick a problem to start a timed assessment session.
          </p>
        </div>

        {problems === undefined ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProblemCardSkeleton key={i} />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
            No problems available yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => (
              <ProblemCard key={problem._id} problem={problem} />
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
};

export default ProblemsPage;
