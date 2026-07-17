"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { use } from "react";


const ACTION_STYLES: Record<string, string> = {
  ASKED: "bg-gray-700 text-gray-300",
  ACCEPTED: "bg-green-900 text-green-300",
  REJECTED: "bg-red-900 text-red-300",
  MODIFIED: "bg-purple-900 text-purple-300",
};

export default function ReplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const session = useQuery(api.sessions.getById, {
    sessionId: id as Id<"sessions">,
  });

  if (session === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading replay...
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Session not found.
      </div>
    );
  }

  function timeElapsed(start: number, current: number) {
    const diffMs = current - start;
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <span className="text-sm text-purple-400">Interview Replay</span>
        <h1 className="text-2xl font-bold mt-1">{session.problemName}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {session.user?.name} · {session.user?.email}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Started {new Date(session.startedAt).toLocaleString()}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 border-l border-gray-800 space-y-8">
        {session.promptLogs.length === 0 && (
          <p className="text-gray-500 text-sm">
            No AI interactions were recorded for this session.
          </p>
        )}

        {session.promptLogs.map((log) => (
          <div key={log._id} className="relative">
            <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-purple-500" />
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 font-mono">
                +{timeElapsed(session.startedAt, log._creationTime)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_STYLES[log.action]}`}
              >
                {log.action}
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

      {/* Final Code Snapshot */}
      <div className="mt-10">
        <h3 className="text-sm text-gray-400 mb-2">Final Submitted Code</h3>
        <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
          {session.code || "// No code submitted"}
        </pre>
      </div>
    </div>
  );
}