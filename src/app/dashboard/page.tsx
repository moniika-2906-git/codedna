"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

function ScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return <span className="text-gray-500 text-xs">—</span>;
  let color = "bg-yellow-900 text-yellow-300 border-yellow-800";
  if (score >= 80) color = "bg-green-900 text-green-300 border-green-800";
  else if (score <= 40) color = "bg-red-900 text-red-300 border-red-800";
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
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

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const sessions = useQuery(api.sessions.listAll);

  const total = sessions?.length ?? 0;
  const avgScore =
    sessions && sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / sessions.length
        )
      : 0;
  const strongCount = sessions?.filter((s) => (s.score ?? 0) >= 80).length ?? 0;

  return (
    <RequireAuth role="RECRUITER">
      <div className="min-h-screen bg-black text-white">
       

        <div className="max-w-5xl mx-auto px-6 py-10">
          <span className="text-sm text-purple-400 font-medium">Recruiter Dashboard</span>
          <h1 className="text-3xl font-bold mt-1 mb-1">Candidate Submissions</h1>
          <p className="text-gray-500 text-sm mb-8">
            Every submission, scored by AI Collaboration and ready to review.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Candidates" value={String(total)} accent="text-purple-400" />
            <StatCard label="Average Score" value={`${avgScore}/100`} accent="text-cyan-400" />
            <StatCard label="Strong Performers (80+)" value={String(strongCount)} accent="text-green-400" />
          </div>

          {sessions === undefined && (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {sessions?.length === 0 && (
            <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
              <p className="mb-1">No submissions yet.</p>
              <p className="text-sm">
                Once students submit assessments, they'll appear here.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {sessions?.map((s, i) => (
              <Link
                key={s._id}
                href={`/dashboard/candidate/${s._id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-[fadeIn_0.4s_ease-out_forwards] opacity-0 flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-purple-500 hover:bg-gray-900/70 rounded-xl p-4 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-semibold text-sm shrink-0 text-white">
                  {s.candidateName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-purple-300 transition">
                    {s.candidateName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {s.problemName} · {s.totalPrompts} AI interactions ·{" "}
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <ScoreBadge score={s.score} />
                <span className="text-gray-600 group-hover:text-purple-400 transition text-lg">
                  →
                </span>
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
    </RequireAuth>
  );
}