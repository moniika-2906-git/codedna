"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { use } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

const ACTION_STYLES: Record<string, string> = {
  ASKED: "bg-gray-700 text-gray-300",
  ACCEPTED: "bg-green-900 text-green-300",
  REJECTED: "bg-red-900 text-red-300",
  MODIFIED: "bg-purple-900 text-purple-300",
};

function ScoreRing({ score }: { score: number }) {
  let color = "text-yellow-400";
  if (score >= 80) color = "text-green-400";
  else if (score <= 40) color = "text-red-400";
  return (
    <div className={`text-5xl font-extrabold ${color}`}>
      {score}
      <span className="text-xl text-gray-500">/100</span>
    </div>
  );
}

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const session = useQuery(api.sessions.getById, {
    sessionId: id as Id<"sessions">,
  });

  return (
    <RequireAuth role="RECRUITER">
      <div className="min-h-screen bg-black text-white">
        

        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-purple-400 transition mb-6 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>

          {session === undefined && (
            <p className="text-gray-500 mt-6">Loading candidate...</p>
          )}

          {session === null && (
            <p className="text-gray-500 mt-6">Candidate session not found.</p>
          )}

          {session && (
            <>
              {/* Header Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-4 mb-8 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
                    {session.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{session.user?.name}</h1>
                    <p className="text-gray-500 text-sm">{session.user?.email}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {session.problemName} · Started{" "}
                      {new Date(session.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {session.score !== undefined && <ScoreRing score={session.score} />}
              </div>

              {/* Timeline */}
              <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
                AI Interaction Timeline
              </h2>
              <div className="relative pl-6 border-l border-gray-800 space-y-6 mb-10">
                {session.promptLogs.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No AI interactions were recorded for this session — fully independent work.
                  </p>
                )}

                {session.promptLogs.map((log) => (
                  <div key={log._id} className="relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-purple-500" />
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_STYLES[log.action]}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(log._creationTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-200 mb-2">
                        <span className="text-purple-400 font-medium">Prompt: </span>
                        {log.prompt}
                      </p>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">
                        <span className="text-gray-500 font-medium">AI: </span>
                        {log.aiResponse}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Code */}
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Final Submitted Code
              </h2>
              <pre className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-gray-300 overflow-x-auto">
                {session.code || "// No code submitted"}
              </pre>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}