"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-green-900 text-green-300",
  MEDIUM: "bg-yellow-900 text-yellow-300",
  HARD: "bg-red-900 text-red-300",
};

export default function ProblemsPage() {
  const problems = useQuery(api.problems.list);

  return (
    <RequireAuth role="STUDENT">
      <div className="min-h-screen bg-black text-white">
    
        <div className="px-6 py-12 max-w-3xl mx-auto">
          <span className="text-sm text-purple-400">Choose a Problem</span>
          <h1 className="text-3xl font-bold mt-1 mb-8">Start Your Assessment</h1>

          {problems === undefined && (
            <p className="text-gray-500">Loading problems...</p>
          )}

          {problems?.length === 0 && (
            <p className="text-gray-500">
              No problems found. Seed them from the Convex dashboard first.
            </p>
          )}

          <div className="space-y-3">
            {problems?.map((p) => (
              <Link
                key={p._id}
                href={`/assessment/${p._id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-xl p-5 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">{p.title}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[p.difficulty]}`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}