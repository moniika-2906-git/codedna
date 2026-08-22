"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
interface Problem {
  _id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
}

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-green-900 text-green-300",
  MEDIUM: "bg-yellow-900 text-yellow-300",
  HARD: "bg-red-900 text-red-300",
};

const ProblemCard = ({ problem }: { problem: Problem }) => (
  <Link
    href={`/assessment/${problem._id}`}
    className="block cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-indigo-500"
  >
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-lg font-semibold text-zinc-100">{problem.title}</h3>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyStyles[problem.difficulty]}`}
      >
        {problem.difficulty}
      </span>
    </div>
    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
      {problem.description}
    </p>
  </Link>
);

const ProblemCardSkeleton = () => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-800" />
      <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-zinc-800" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-3.5 w-full animate-pulse rounded bg-zinc-800" />
      <div className="h-3.5 w-2/3 animate-pulse rounded bg-zinc-800" />
    </div>
  </div>
);

function ProblemsList() {
  const problems = useQuery(api.problems.list) as Problem[] | undefined;

  return (
    <div className="min-h-screen w-full bg-zinc-950 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-indigo-400">
          Choose a Problem
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50 md:text-4xl">
          Start Your Assessment
        </h1>
        <div className="mt-8 flex flex-col gap-4">
          {problems === undefined ? (
            <>
              <ProblemCardSkeleton />
              <ProblemCardSkeleton />
              <ProblemCardSkeleton />
              <ProblemCardSkeleton />
            </>
          ) : problems.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">
              No problems found. Seed them from the Convex dashboard first.
            </p>
          ) : (
            problems.map((problem) => (
              <ProblemCard key={problem._id} problem={problem} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <RequireAuth role="STUDENT">
      <ProblemsList />
    </RequireAuth>
  );
}