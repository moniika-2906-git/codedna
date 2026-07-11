"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function ScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return <span className="text-gray-500 text-xs">—</span>;
  let color = "bg-yellow-900 text-yellow-300";
  if (score >= 80) color = "bg-green-900 text-green-300";
  else if (score <= 40) color = "bg-red-900 text-red-300";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {score}/100
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="w-10 h-10 rounded-full bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 bg-gray-800 rounded" />
        <div className="h-2.5 w-1/4 bg-gray-800 rounded" />
      </div>
      <div className="h-6 w-16 bg-gray-800 rounded-full" />
    </div>
  );
}

export default function DashboardPage() {
  const sessions = useQuery(api.sessions.listAll);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <span className="text-sm text-purple-400">Recruiter Dashboard</span>
        <h1 className="text-3xl font-bold mt-1 mb-1">Candidate Submissions</h1>
        <p className="text-gray-500 text-sm mb-8">
          Every submission, scored by AI Collaboration and ready to replay.
        </p>

        {sessions === undefined && (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {sessions?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="mb-1">No submissions yet.</p>
            <p className="text-sm">
              Switch to Student View and complete an assessment to see it here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sessions?.map((s, i) => (
            <Link
              key={s._id}
              href={`/replay/${s._id}`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-[fadeIn_0.4s_ease-out_forwards] opacity-0 flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-xl p-4 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-semibold text-sm shrink-0">
                {s.candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-purple-300 transition">
                  {s.candidateName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {s.problemName} · {s.totalPrompts} AI interactions
                </p>
              </div>
              <ScoreBadge score={s.score} />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}