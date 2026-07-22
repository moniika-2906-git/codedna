import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DifficultyBadge } from "./DifficultyBadge";

interface ProblemCardProps {
  problem: Doc<"problems">;
}

export const ProblemCard = ({ problem }: ProblemCardProps) => {
  const navigate = useNavigate();
  const createSession = useMutation(api.sessions.create);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const sessionId: Id<"sessions"> = await createSession({
        problemId: problem._id,
      });
      navigate(`/assessment/${sessionId}`);
    } catch {
      setIsStarting(false);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleStart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleStart();
        }
      }}
      aria-disabled={isStarting}
      className="group relative cursor-pointer rounded-xl border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 aria-disabled:pointer-events-none aria-disabled:opacity-60"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-zinc-100 transition-colors group-hover:text-indigo-400">
            {problem.title}
          </CardTitle>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <CardDescription className="line-clamp-2 text-zinc-400">
          {problem.description}
        </CardDescription>
      </CardHeader>
      <CardContent />
      {isStarting && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-950/60">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
      )}
    </Card>
  );
};
